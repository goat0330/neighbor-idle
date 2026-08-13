import { Button, Input, ScrollView, Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState } from 'react'
import { contactExchange, type ContactRequest } from '@/services/contactExchange'
import './index.scss'

type ChatMessage = { id: string; side: 'mine' | 'peer'; text: string }

export default function ChatPage() {
  const router = useRouter()
  const conversationId = router.params.conversationId || `listing-${router.params.listingId || 'demo'}`
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', side: 'peer', text: '你好，物品还在，可以小区东门自提。' },
    { id: '2', side: 'mine', text: '可以便宜一点吗？今晚 7 点方便。' },
  ])
  const [draft, setDraft] = useState('')
  const [contactRequest, setContactRequest] = useState<ContactRequest | undefined>(() => contactExchange.get(conversationId))
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactReason, setContactReason] = useState('方便自提时联系')

  function send() {
    const text = draft.trim()
    if (!text) return
    setMessages((current) => [...current, { id: String(Date.now()), side: 'mine', text }])
    setDraft('')
  }

  function requestWechat() {
    setShowContactForm(true)
  }

  function submitContactRequest() {
    setContactRequest(contactExchange.request(conversationId, contactReason.trim() || '方便自提时联系'))
    setShowContactForm(false)
  }

  function approveDemo() {
    setContactRequest(contactExchange.approve(conversationId))
    Taro.showToast({ title: '卖家已同意', icon: 'success' })
  }

  function copyWechat() {
    if (!contactRequest?.wechatId) return
    Taro.setClipboardData({ data: contactRequest.wechatId })
  }

  return (
    <View className='chat-page'>
      <View className='trade-strip'><Text>我想要</Text><Text>›</Text><Text className='trade-strip-active'>聊天议价</Text><Text>›</Text><Text>约定自提</Text></View>
      <ScrollView scrollY className='chat-messages'>
        <View className='chat-safety'>请勿提前转账；建议在小区公共区域验货后成交</View>
        {messages.map((item) => <View key={item.id} className={`bubble-row bubble-row-${item.side}`}><Text className={`bubble bubble-${item.side}`}>{item.text}</Text></View>)}
        <ContactPanel request={contactRequest} onRequest={requestWechat} onApprove={approveDemo} onCopy={copyWechat} />
      </ScrollView>
      <View className='quick-actions'><Text onClick={() => setDraft('可以少一点吗？')}>议价</Text><Text onClick={() => setDraft('今晚 19:00 东门自提可以吗？')}>约自提</Text><Text onClick={requestWechat}>申请加微信</Text></View>
      <View className='chat-composer'><Input value={draft} onInput={(event) => setDraft(event.detail.value)} confirmType='send' onConfirm={send} placeholder='友好沟通，描述清楚时间和地点' /><Button onClick={send}>发送</Button></View>
      {showContactForm && <View className='contact-modal-mask' onClick={() => setShowContactForm(false)}><View className='contact-modal' onClick={(event) => event.stopPropagation()}><Text className='contact-modal-title'>申请交换微信</Text><Text className='contact-copy'>说明用途，卖家同意后双方才可查看联系方式。</Text><Input value={contactReason} maxlength={60} onInput={(event) => setContactReason(event.detail.value)} placeholder='例如：方便自提时联系' /><View className='contact-modal-actions'><Button onClick={() => setShowContactForm(false)}>取消</Button><Button className='confirm' onClick={submitContactRequest}>发送申请</Button></View></View></View>}
    </View>
  )
}

function ContactPanel({ request, onRequest, onApprove, onCopy }: { request?: ContactRequest; onRequest: () => void; onApprove: () => void; onCopy: () => void }) {
  if (!request || request.status === 'rejected' || request.status === 'revoked') return <View className='contact-panel'><Text className='contact-title'>需要转到微信继续联系？</Text><Text className='contact-copy'>发送申请后，只有卖家明确同意才会展示微信号。</Text><Button className='contact-button' onClick={onRequest}>申请交换微信</Button></View>
  if (request.status === 'pending') return <View className='contact-panel'><Text className='contact-title'>等待卖家同意</Text><Text className='contact-copy'>申请理由：{request.reason}</Text><Button className='contact-button contact-button-demo' onClick={onApprove}>演示：卖家同意</Button></View>
  return <View className='contact-panel contact-approved'><Text className='contact-title'>双方已同意交换联系方式</Text><Text className='contact-copy'>微信号：{request.wechatId}</Text><Button className='contact-button' onClick={onCopy}>复制微信号</Button><Text className='contact-warning'>离开平台后的沟通与付款风险由双方自行判断，请勿提前转账。</Text></View>
}
