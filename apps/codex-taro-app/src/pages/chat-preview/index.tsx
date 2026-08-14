import { ScrollView, Text, View } from '@tarojs/components'
import { useState } from 'react'
import ChatBubble from '../../components/community/ChatBubble'
import ChatComposer from '../../components/community/ChatComposer'
import ContactExchangeSheet from '../../components/community/ContactExchangeSheet'
import ProductChatAnchor from '../../components/community/ProductChatAnchor'
import QuickQuestionChips from '../../components/community/QuickQuestionChips'
import type { ContactExchangeStatus } from '../../components/community/ContactExchangeAction'
import './index.scss'

import productDeskImage from '@/assets/mock/product-desk.png'
import avatarOrange from '@/assets/mock/avatar-orange.png'
import avatarBlue from '@/assets/mock/avatar-blue.png'

type PreviewMessage = {
  id: string
  side: 'incoming' | 'outgoing'
  avatar: string
  text: string
  time: string
  read?: boolean
}

const INITIAL_MESSAGES: PreviewMessage[] = [
  { id: 'message-0', side: 'outgoing', avatar: avatarOrange, text: '书桌还在吗？', time: '18:36', read: true },
  { id: 'message-1', side: 'incoming', avatar: avatarBlue, text: '还在，可以自提。', time: '18:37' },
  { id: 'message-2', side: 'outgoing', avatar: avatarOrange, text: '今晚方便拿吗？', time: '18:38', read: true },
  { id: 'message-3', side: 'incoming', avatar: avatarBlue, text: '可以，七点以后都在。', time: '18:39' },
  { id: 'message-4', side: 'outgoing', avatar: avatarOrange, text: '好的，我七点半左右到。', time: '18:40', read: true },
]

export default function ChatPreviewPage() {
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<PreviewMessage[]>(INITIAL_MESSAGES)
  const [contactStatus, setContactStatus] = useState<ContactExchangeStatus>('available')
  const [sheetOpen, setSheetOpen] = useState(false)

  function sendMessage() {
    const text = draft.trim()
    if (!text) return

    setMessages((current) => [
      ...current,
      {
        id: `message-${current.length}`,
        side: 'outgoing',
        avatar: avatarOrange,
        text,
        time: '19:01',
        read: false,
      },
    ])
    setDraft('')
  }

  function openContactSheet() {
    if (contactStatus !== 'available') return
    setContactStatus('pending')
    setSheetOpen(true)
  }

  function rejectContactExchange() {
    setSheetOpen(false)
    setContactStatus('available')
  }

  function approveContactExchange() {
    setSheetOpen(false)
    setContactStatus('approved')
  }

  return (
    <View className='chat-preview'>
      <View className='chat-preview__viewport'>
        <View className='chat-preview__header'>
          <Text className='chat-preview__back'>‹</Text>
          <View className='chat-preview__header-copy'>
            <Text className='chat-preview__title'>小橘子</Text>
            <Text className='chat-preview__community'>金水花园</Text>
          </View>
          <Text className='chat-preview__more'>•••</Text>
        </View>

        <View className='chat-preview__body'>
          <ScrollView scrollY className='chat-preview__scroll'>
            <View className='chat-preview__anchor'>
              <ProductChatAnchor
                image={productDeskImage}
                title='宜家书桌'
                price={50}
                communityName='金水花园'
              />
            </View>
            <View className='chat-preview__messages'>
              {messages.map((message) => (
                <View key={message.id} id={message.id}>
                  <ChatBubble
                    side={message.side}
                    avatar={message.avatar}
                    text={message.text}
                    time={message.time}
                    read={message.read}
                  />
                </View>
              ))}
              {contactStatus === 'approved' && (
                <View className='chat-preview__approved-card'>
                  <Text className='chat-preview__approved-title'>已交换联系方式</Text>
                  <Text className='chat-preview__approved-line'>微信号：kejihaixiaoming</Text>
                  <Text className='chat-preview__approved-line'>手机号：138 **** 5678</Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View className='chat-preview__composer-wrap'>
            <QuickQuestionChips onSelect={setDraft} />
            <ChatComposer
              value={draft}
              onInput={setDraft}
              onSend={sendMessage}
              contactStatus={contactStatus}
              onContactRequest={openContactSheet}
            />
          </View>
        </View>

        <ContactExchangeSheet
          open={sheetOpen}
          counterpartName='小橘子'
          wechatMasked='kejihaixiaoming'
          phoneMasked='138 **** 5678'
          onClose={() => setSheetOpen(false)}
          onReject={rejectContactExchange}
          onApprove={approveContactExchange}
        />
      </View>
    </View>
  )
}
