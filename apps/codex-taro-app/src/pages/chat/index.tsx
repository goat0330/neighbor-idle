import { Button, Input, ScrollView, Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { backendEnabled, conversationApi, type ConversationMessage } from '@/services/backend'
import { contactExchange, type ContactRequest } from '@/services/contactExchange'
import './index.scss'

const demoMessages: ConversationMessage[] = [
  { id: '1', side: 'peer', type: 'text', text: '你好，物品还在，可以小区东门自提。', read: true, createdAt: Date.now() - 60000 },
  { id: '2', side: 'mine', type: 'text', text: '可以便宜一点吗？今晚 7 点方便。', read: true, createdAt: Date.now() },
]

export default function ChatPage() {
  const router = useRouter()
  const routeConversationId = router.params.conversationId || ''
  const listingId = router.params.listingId || ''
  const [conversationId, setConversationId] = useState(routeConversationId || `listing-${listingId || 'demo'}`)
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer')
  const [messages, setMessages] = useState<ConversationMessage[]>(demoMessages)
  const [draft, setDraft] = useState('')
  const [contactRequest, setContactRequest] = useState<ContactRequest>()
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactReason, setContactReason] = useState('方便自提时联系')
  const [cloudConversationReady, setCloudConversationReady] = useState(false)

  useEffect(() => {
    void initialize()
  }, [])

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
    if (!backendEnabled) {
      setContactRequest((await contactExchange.get(conversationId)) || undefined)
      return
    }
    try {
      const summary = routeConversationId
        ? await conversationApi.detail(routeConversationId)
        : await conversationApi.open(listingId)
      setConversationId(summary.id)
      setRole(summary.role)
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

  async function send() {
    const text = draft.trim()
    if (!text) return
    if (!backendEnabled) {
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

  async function submitContactRequest() {
    try {
      const request = await contactExchange.request(conversationId, contactReason.trim() || '方便自提时联系')
      setContactRequest(request)
      setShowContactForm(false)
    } catch (error: any) {
      Taro.showToast({ title: error.message || '申请失败', icon: 'none' })
    }
  }

  async function respond(approved: boolean) {
    if (!contactRequest) return
    try {
      const request = approved ? await contactExchange.approve(contactRequest) : await contactExchange.reject(contactRequest)
      setContactRequest(request)
      Taro.showToast({ title: approved ? '已同意交换微信' : '已拒绝申请', icon: 'none' })
    } catch (error: any) {
      Taro.showToast({ title: error.message || '处理失败', icon: 'none' })
    }
  }

  async function revoke() {
    if (!contactRequest) return
    try {
      setContactRequest(await contactExchange.revoke(contactRequest))
      Taro.showToast({ title: '授权已撤回', icon: 'none' })
    } catch (error: any) {
      Taro.showToast({ title: error.message || '撤回失败', icon: 'none' })
    }
  }

  function copyWechat() {
    if (contactRequest?.wechatId) Taro.setClipboardData({ data: contactRequest.wechatId })
  }

  return (
    <View className='chat-page'>
      <View className='trade-strip'><Text>我想要</Text><Text>›</Text><Text className='trade-strip-active'>聊天议价</Text><Text>›</Text><Text>约定自提</Text></View>
      <ScrollView scrollY className='chat-messages'>
        <View className='chat-safety'>请勿提前转账；建议在小区公共区域验货后成交</View>
        {messages.map((item) => item.type === 'system'
          ? <View key={item.id} className='system-message'><Text>{item.text}</Text></View>
          : <View key={item.id} className={`bubble-row bubble-row-${item.side}`}><Text className={`bubble bubble-${item.side}`}>{item.text}</Text></View>)}
        <ContactPanel role={role} request={contactRequest} onRequest={() => setShowContactForm(true)} onApprove={() => respond(true)} onReject={() => respond(false)} onCopy={copyWechat} onRevoke={revoke} />
      </ScrollView>
      <View className='quick-actions'><Text onClick={() => setDraft('可以少一点吗？')}>议价</Text><Text onClick={() => setDraft('今晚 19:00 东门自提可以吗？')}>约自提</Text>{role === 'buyer' && <Text onClick={() => setShowContactForm(true)}>申请加微信</Text>}</View>
      <View className='chat-composer'><Input value={draft} onInput={(event) => setDraft(event.detail.value)} confirmType='send' onConfirm={send} placeholder='友好沟通，描述清楚时间和地点' /><Button onClick={send}>发送</Button></View>
      {showContactForm && <View className='contact-modal-mask' onClick={() => setShowContactForm(false)}><View className='contact-modal' onClick={(event) => event.stopPropagation()}><Text className='contact-modal-title'>申请交换微信</Text><Text className='contact-copy'>说明用途，卖家同意后双方才可查看联系方式。</Text><Input value={contactReason} maxlength={60} onInput={(event) => setContactReason(event.detail.value)} placeholder='例如：方便自提时联系' /><View className='contact-modal-actions'><Button onClick={() => setShowContactForm(false)}>取消</Button><Button className='confirm' onClick={submitContactRequest}>发送申请</Button></View></View></View>}
    </View>
  )
}

type ContactPanelProps = {
  role: 'buyer' | 'seller'
  request?: ContactRequest
  onRequest: () => void
  onApprove: () => void
  onReject: () => void
  onCopy: () => void
  onRevoke: () => void
}

function ContactPanel({ role, request, onRequest, onApprove, onReject, onCopy, onRevoke }: ContactPanelProps) {
  if (!request || request.status === 'rejected' || request.status === 'revoked') {
    if (role === 'seller') return <View className='contact-panel'><Text className='contact-title'>微信号不会自动公开</Text><Text className='contact-copy'>买家发起申请后，你可以在这里同意或拒绝。</Text></View>
    return <View className='contact-panel'><Text className='contact-title'>需要转到微信继续联系？</Text><Text className='contact-copy'>发送申请后，只有卖家明确同意才会展示微信号。</Text><Button className='contact-button' onClick={onRequest}>申请交换微信</Button></View>
  }
  if (request.status === 'pending' && role === 'seller') return <View className='contact-panel'><Text className='contact-title'>买家申请交换微信</Text><Text className='contact-copy'>申请理由：{request.reason}</Text><View className='contact-review-actions'><Button onClick={onReject}>拒绝</Button><Button className='contact-button' onClick={onApprove}>同意</Button></View></View>
  if (request.status === 'pending') return <View className='contact-panel'><Text className='contact-title'>等待卖家同意</Text><Text className='contact-copy'>申请理由：{request.reason}</Text></View>
  return <View className='contact-panel contact-approved'><Text className='contact-title'>卖家已同意交换微信</Text><Text className='contact-copy'>微信号：{request.wechatId || '卖家尚未设置'}</Text>{request.wechatId && <Button className='contact-button' onClick={onCopy}>复制微信号</Button>}<Text className='contact-revoke' onClick={onRevoke}>撤回授权</Text><Text className='contact-warning'>离开平台后的沟通与付款风险由双方自行判断，请勿提前转账。</Text></View>
}
