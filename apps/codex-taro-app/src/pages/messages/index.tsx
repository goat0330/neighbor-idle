import { Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { seedConversations } from '@/services/market'
import { backendEnabled, conversationApi, type ConversationSummary } from '@/services/backend'
import './index.scss'

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>(() => demoConversations())

  useDidShow(() => {
    if (!backendEnabled) return
    conversationApi.list()
      .then((result) => setConversations(result.list))
      .catch((error) => Taro.showToast({ title: error.message || '消息加载失败', icon: 'none' }))
  })

  async function subscribe() {
    await Taro.showModal({
      title: '开启交易提醒',
      content: '正式版将在用户主动授权后，按留言、联系方式申请和自提约定逐次发送订阅消息；微信不允许小程序随意主动推送。',
      showCancel: false,
    })
  }

  return (
    <View className='page-shell messages-page'>
      <View className='messages-header'><View><Text className='eyebrow'>CONVERSATIONS</Text><Text className='page-title'>消息中心</Text></View><Text className='subscribe-link' onClick={subscribe}>开启提醒</Text></View>
      <View className='message-tabs'><Text className='message-tab-active'>会话</Text><Text>系统通知</Text></View>
      <View className='conversation-list'>
        {conversations.map((item) => (
          <View className='conversation-card' key={item.id} onClick={() => Taro.navigateTo({ url: `/pages/chat/index?conversationId=${item.id}&listingId=${item.itemId}` })}>
            <View className='conversation-avatar'>{item.peerName.slice(-1)}</View>
            <View className='conversation-main'><View className='conversation-title-row'><Text className='conversation-peer'>{item.peerName}</Text><Text className='conversation-time'>{formatTime(item.lastMessageAt)}</Text></View><Text className='conversation-listing'>{item.itemTitle}</Text><Text className='conversation-preview'>{item.lastMessage}</Text></View>
            {item.unread > 0 && <Text className='unread-badge'>{item.unread}</Text>}
          </View>
        ))}
        {!conversations.length && <View className='conversation-empty'><Text>还没有交易消息</Text><Text>在闲置详情点击“我想要”开始聊天</Text></View>}
      </View>
    </View>
  )
}

function demoConversations(): ConversationSummary[] {
  return seedConversations.map((item) => ({ id: item.id, itemId: item.listingId, itemTitle: item.title, itemImage: '', peerName: item.peer, peerAvatar: '', role: 'buyer', lastMessage: item.preview, lastMessageAt: Date.now(), unread: item.unread, status: 'active' }))
}

function formatTime(timestamp: number) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
