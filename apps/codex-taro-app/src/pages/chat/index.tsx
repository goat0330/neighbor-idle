import { Button, ScrollView, Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import {
  ChatBubble,
  ChatComposer,
  ContactCard,
  ContactExchangeAction,
  ContactExchangeSheet,
  QuickQuestionChips,
  ProductChatAnchor,
  WechatContactSetupSheet,
  type ContactExchangeStatus,
} from '@/components/community'
import { backendEnabled, conversationApi, userApi, type ConversationMessage, type UserProfile } from '@/services/backend'
import { itemApi } from '@/services/backend'
import { contactExchange, type ContactRequest } from '@/services/contactExchange'
import { mapBackendItem, seedListings, seedWants } from '@/services/market'
import type { Listing } from '@/types/market'
import avatarOrange from '@/assets/mock/avatar-orange.png'
import avatarBlue from '@/assets/mock/avatar-blue.png'
import './index.scss'

const isWechatMiniProgram = process.env.TARO_ENV === 'weapp'

const demoMessages: ConversationMessage[] = [
  { id: '1', side: 'peer', type: 'text', text: '请问书桌还在吗？', read: true, createdAt: Date.now() - 180000 },
  { id: '2', side: 'mine', type: 'text', text: '还在的，成色很新，可以自提。', read: true, createdAt: Date.now() - 120000 },
  { id: '3', side: 'peer', type: 'text', text: '今天晚上方便拿吗？', read: true, createdAt: Date.now() - 60000 },
]

const demoProfile: UserProfile = {
  id: 'demo',
  nickname: '小橘子',
  avatarUrl: avatarOrange,
  communityId: 'demo-community',
  communityName: '金水花园',
  building: '',
  verificationStatus: 'verified',
  hasWechat: false,
  hasPhone: false,
  phoneMasked: '',
  creditScore: 100,
  status: 'active',
}

export default function ChatPage() {
  const router = useRouter()
  const routeConversationId = router.params.conversationId || ''
  const listingId = router.params.listingId || ''
  const wantId = router.params.wantId || ''
  const wanted = useMemo(() => {
    const known = seedWants.find((want) => want.id === wantId)
    if (known || !wantId) return known
    return {
      id: wantId,
      title: decodeRouteParam(router.params.wantTitle || '') || '求购物品',
      budget: decodeRouteParam(router.params.wantBudget || '') || '价格面议',
      category: '其他',
      community: decodeRouteParam(router.params.wantCommunity || '') || '金水花园',
      description: '',
      author: decodeRouteParam(router.params.wantAuthor || '') || '邻居',
    }
  }, [router.params.wantAuthor, router.params.wantBudget, router.params.wantCommunity, router.params.wantTitle, wantId])
  const seedItem = useMemo(() => seedListings.find((listing) => listing.id === listingId) ?? seedListings[0], [listingId])
  const [item, setItem] = useState<Listing>(seedItem)
  const [conversationId, setConversationId] = useState(routeConversationId || (wantId ? `want-${wantId}` : `listing-${item.id}`))
  const [role, setRole] = useState<'buyer' | 'seller'>(wantId || router.params.role === 'seller' ? 'seller' : 'buyer')
  const [messages, setMessages] = useState<ConversationMessage[]>(demoMessages)
  const [draft, setDraft] = useState(() => decodeRouteParam(router.params.draft || ''))
  const [contactRequest, setContactRequest] = useState<ContactRequest>()
  const [showApprovalSheet, setShowApprovalSheet] = useState(false)
  const [showContactSetup, setShowContactSetup] = useState(false)
  const [contactSetupPurpose, setContactSetupPurpose] = useState<'approve' | 'none'>('none')
  const [profile, setProfile] = useState<UserProfile>(demoProfile)
  const [wechatId, setWechatId] = useState('')
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [savingContact, setSavingContact] = useState(false)
  const [cloudConversationReady, setCloudConversationReady] = useState(false)

  useEffect(() => {
    void initialize()
  }, [])

  useEffect(() => {
    const counterpart = wanted ? wanted.author : role === 'buyer' ? item.seller : '小橘子'
    const community = wanted?.community || item.community
    void Taro.setNavigationBarTitle({ title: `${counterpart}  ${community}` })
  }, [item.community, item.seller, role, wanted])

  useEffect(() => {
    if (!backendEnabled || !cloudConversationReady) return
    const timer = setInterval(() => {
      Promise.all([conversationApi.messages(conversationId), contactExchange.get(conversationId)])
        .then(([messageResult, request]) => {
          setMessages(messageResult.list)
          setContactRequest(request || undefined)
          return conversationApi.markRead(conversationId)
        })
        .catch(() => undefined)
    }, 4000)
    return () => clearInterval(timer)
  }, [cloudConversationReady, conversationId])

  async function initialize() {
    if (backendEnabled) {
      try {
        const profileResult = await userApi.me()
        setProfile(profileResult)
      } catch {
        // CloudBase 登录失败不阻断本地页面，后续动作会给出明确提示。
      }
    }
    if (wantId) {
      setRole('seller')
      setMessages([{ id: `want-${wantId}`, side: 'peer', type: 'text', text: `你好，我想响应你的求购：${wanted?.title || '这个物品'}`, read: true, createdAt: Date.now() }])
      return
    }
    if (!backendEnabled) {
      setContactRequest((await contactExchange.get(conversationId)) || undefined)
      return
    }
    try {
      const summary = routeConversationId
        ? await conversationApi.detail(routeConversationId)
        : await conversationApi.open(item.id)
      setConversationId(summary.id)
      setRole(summary.role)
      if (summary.itemId) {
        const itemResult = await itemApi.detail(summary.itemId)
        setItem(mapBackendItem(itemResult.item))
      }
      const [messageResult, request] = await Promise.all([
        conversationApi.messages(summary.id),
        contactExchange.get(summary.id),
      ])
      setMessages(messageResult.list)
      setContactRequest(request || undefined)
      await conversationApi.markRead(summary.id)
      setCloudConversationReady(true)
    } catch (error: any) {
      Taro.showToast({ title: error.message || '会话加载失败', icon: 'none' })
    }
  }

  useEffect(() => {
    setItem(seedItem)
  }, [seedItem])

  async function send() {
    const text = draft.trim()
    if (!text) return
    if (!backendEnabled || wantId) {
      setMessages((current) => [...current, { id: String(Date.now()), side: 'mine', type: 'text', text, read: false, createdAt: Date.now() }])
      setDraft('')
      return
    }
    try {
      const message = await conversationApi.send(conversationId, text)
      setMessages((current) => [...current, message])
      setDraft('')
    } catch (error: any) {
      Taro.showToast({ title: error.message || '发送失败', icon: 'none' })
    }
  }

  async function requestContact() {
    try {
      const request = await contactExchange.request(conversationId, '方便继续沟通交易细节')
      setContactRequest(request)
      Taro.showToast({ title: '已发送联系方式申请', icon: 'success' })
    } catch (error: any) {
      Taro.showToast({ title: error.message || '申请失败', icon: 'none' })
    }
  }

  function approveContact() {
    if (!contactRequest) return
    if (!profile.hasPhone && !profile.hasWechat) {
      setContactSetupPurpose('approve')
      setShowApprovalSheet(false)
      setShowContactSetup(true)
      Taro.showToast({ title: '需先授权手机号或填写微信号', icon: 'none' })
      return
    }
    void respond(true)
  }

  async function respond(approved: boolean) {
    if (!contactRequest) return
    try {
      const request = approved ? await contactExchange.approve(contactRequest) : await contactExchange.reject(contactRequest)
      setContactRequest(request)
      setShowApprovalSheet(false)
      Taro.showToast({ title: approved ? '已同意交换联系方式' : '已暂不同意', icon: 'success' })
    } catch (error: any) {
      Taro.showToast({ title: error.message || '处理失败', icon: 'none' })
    }
  }

  async function receivePhoneCode(code: string) {
    setPhoneLoading(true)
    try {
      if (backendEnabled) {
        const result = await userApi.setPhone(code)
        setProfile(result)
      } else {
        setProfile((current) => ({ ...current, hasPhone: true, phoneMasked: '138 **** 5678' }))
      }
      Taro.showToast({ title: '手机号已授权', icon: 'success' })
    } catch (error: any) {
      Taro.showToast({ title: error.message || '手机号授权失败', icon: 'none' })
    } finally {
      setPhoneLoading(false)
    }
  }

  async function saveContact() {
    if (!profile.hasPhone && !wechatId.trim()) {
      Taro.showToast({ title: '请授权手机号或填写微信号', icon: 'none' })
      return
    }
    setSavingContact(true)
    try {
      if (wechatId.trim()) {
        if (backendEnabled) await userApi.setWechat(wechatId.trim())
        setProfile((current) => ({ ...current, hasWechat: true }))
      }
      setShowContactSetup(false)
      if (contactSetupPurpose === 'approve') await respond(true)
      setContactSetupPurpose('none')
    } catch (error: any) {
      Taro.showToast({ title: error.message || '联系方式保存失败', icon: 'none' })
    } finally {
      setSavingContact(false)
    }
  }

  const contactStatus: ContactExchangeStatus = contactRequest?.status === 'approved'
    ? 'approved'
    : contactRequest?.status === 'pending'
      ? 'pending'
      : 'available'
  const peerAvatar = role === 'buyer' ? item.sellerAvatar : avatarBlue
  const ownAvatar = profile.avatarUrl || avatarOrange

  return (
    <View className='chat-page'>
      {!isWechatMiniProgram && <View className='chat-header'>
        <Text className='chat-back' onClick={() => Taro.navigateBack()}>‹</Text>
        <View className='chat-header-title'><Text>{wanted ? wanted.author : role === 'buyer' ? item.seller : '小橘子'}</Text><Text>{wanted?.community || item.community}</Text></View>
        <Text className='chat-more'>···</Text>
      </View>}
      <ScrollView scrollY className='chat-messages'>
        {wanted ? <WantedChatAnchor title={wanted.title} budget={wanted.budget} communityName={wanted.community} /> : <ProductChatAnchor image={item.image} title={item.title} price={item.price} communityName={item.community} onOpen={() => Taro.navigateTo({ url: `/pages/detail/index?id=${item.id}` })} />}
        <Text className='chat-time-label'>今天 {formatTime(Date.now())}</Text>
        {messages.map((message) => message.type === 'system'
          ? <View key={message.id} className='chat-system-message'><Text>{message.text}</Text></View>
          : <ChatBubble
            key={message.id}
            side={message.side === 'mine' ? 'outgoing' : 'incoming'}
            avatar={message.side === 'mine' ? ownAvatar : peerAvatar}
            text={message.text}
            time={formatTime(message.createdAt)}
            read={message.read}
          />)}
        {!wanted && role === 'seller' && contactRequest?.status === 'pending' && (
          <View className='seller-approval-trigger' onClick={() => setShowApprovalSheet(true)}>
            <Text>查看联系方式申请</Text>
          </View>
        )}
        {contactRequest?.status === 'approved' && (
          <View className='approved-contact-block'>
            <Text className='approved-contact-title'>已交换联系方式</Text>
            <ContactCard
              data={{ phone: contactRequest.phoneNumber, wechatId: contactRequest.wechatId }}
              showCopy
              onCopyPhone={(phone) => Taro.setClipboardData({ data: phone })}
              onCopyWechatId={(id) => Taro.setClipboardData({ data: id })}
            />
          </View>
        )}
      </ScrollView>
      <QuickQuestionChips onSelect={setDraft} />
      <ChatComposer
        value={draft}
        contactStatus={contactStatus}
        onInput={setDraft}
        onSend={() => { void send() }}
        onContactRequest={!wanted && role === 'buyer' ? () => { if (contactStatus === 'available') void requestContact() } : undefined}
      />
      {!wanted && role === 'seller' && contactRequest?.status === 'pending' && (
        <ContactExchangeAction status='pending' onRequest={() => setShowApprovalSheet(true)} />
      )}
      {!wanted && <ContactExchangeSheet
        open={showApprovalSheet}
        counterpartName={role === 'seller' ? '小橘子' : item.seller}
        wechatMasked={profile.hasWechat ? '已设置' : '未填写'}
        phoneMasked={profile.phoneMasked || '未授权'}
        onClose={() => setShowApprovalSheet(false)}
        onReject={() => { void respond(false) }}
        onApprove={approveContact}
      />}
      {!wanted && <WechatContactSetupSheet
        open={showContactSetup}
        phoneMasked={profile.phoneMasked}
        phoneVerified={Boolean(profile.hasPhone)}
        wechatId={wechatId}
        phoneLoading={phoneLoading}
        saving={savingContact}
        onPhoneCode={(code) => { void receivePhoneCode(code) }}
        onWechatIdChange={setWechatId}
        onSave={() => { void saveContact() }}
        onClose={() => { setShowContactSetup(false); setContactSetupPurpose('none') }}
      />}
    </View>
  )
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function decodeRouteParam(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function WantedChatAnchor({ title, budget, communityName }: { title: string; budget: string; communityName: string }) {
  return (
    <View className='wanted-chat-anchor'>
      <Text className='wanted-chat-anchor-kicker'>社区求购</Text>
      <Text className='wanted-chat-anchor-title'>{title}</Text>
      <View className='wanted-chat-anchor-meta'><Text>{budget}</Text><Text>{communityName}</Text></View>
    </View>
  )
}
