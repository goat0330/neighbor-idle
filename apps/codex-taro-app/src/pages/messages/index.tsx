import { Image, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { BottomNav, PublishActionSheet, type BottomNavTab } from '@/components/community'
import { backendEnabled, conversationApi, type ConversationSummary } from '@/services/backend'
import { seedConversations, seedListings } from '@/services/market'
import './index.scss'

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>(() => demoConversations())
  const [showPublishSheet, setShowPublishSheet] = useState(false)

  function changeNavigation(key: BottomNavTab) {
    if (key === 'messages') return
    const routes = {
      idle: '/pages/home/index',
      wanted: '/pages/want/index',
      me: '/pages/mine/index',
    } as const
    Taro.reLaunch({ url: routes[key] })
  }

  useDidShow(() => {
    if (!backendEnabled) return
    conversationApi.list()
      .then((result) => setConversations(result.list))
      .catch((error) => Taro.showToast({ title: error.message || '消息加载失败', icon: 'none' }))
  })

  return (
    <View className='messages-page'>
      <View className='messages-content'>
        <View className='messages-title-row'>
          <Text className='messages-title'>消息</Text>
          <Text className='messages-title-action'>···</Text>
        </View>
        <View className='conversation-list'>
          {conversations.map((item) => (
            <View
              className='conversation-row'
              key={item.id}
              onClick={() => Taro.navigateTo({ url: `/pages/chat/index?conversationId=${item.id}&listingId=${item.itemId}` })}
            >
              {item.itemImage
                ? <Image className='conversation-item-image' src={item.itemImage} mode='aspectFill' />
                : <View className='conversation-item-image conversation-item-image-fallback'><Text>闲置</Text></View>}
              <View className='conversation-main'>
                <View className='conversation-title-row'>
                  <Text className='conversation-item-title'>{item.itemTitle}</Text>
                  <Text className='conversation-time'>{formatTime(item.lastMessageAt)}</Text>
                </View>
                <View className='conversation-price-row'>
                  <Text className='conversation-price'>{item.itemPrice === undefined ? '' : `¥${item.itemPrice}`}</Text>
                  <Text className={`conversation-status conversation-status-${item.status === 'approved' ? 'approved' : 'pending'}`}>
                    {item.status === 'approved' ? '已交换联系方式' : '沟通中'}
                  </Text>
                </View>
                <View className='conversation-preview-row'>
                  {item.peerAvatar
                    ? <Image className='conversation-avatar' src={item.peerAvatar} mode='aspectFill' />
                    : <View className='conversation-avatar conversation-avatar-fallback'>{item.peerName.slice(0, 1)}</View>}
                  <View className='conversation-preview-copy'>
                    <Text className='conversation-peer'>{item.peerName}</Text>
                    <Text className='conversation-preview'>{item.lastMessage}</Text>
                  </View>
                </View>
              </View>
              {item.unread > 0 && <View className='conversation-unread' />}
            </View>
          ))}
          {!conversations.length && <View className='conversation-empty'><Text>暂无消息</Text></View>}
        </View>
      </View>
      <BottomNav active='messages' onChange={changeNavigation} onPublish={() => setShowPublishSheet(true)} />
      <PublishActionSheet
        open={showPublishSheet}
        onClose={() => setShowPublishSheet(false)}
        onPublishProduct={() => Taro.navigateTo({ url: '/pages/publish/index' })}
        onPublishWanted={() => Taro.navigateTo({ url: '/pages/request-publish/index' })}
      />
    </View>
  )
}

function demoConversations(): ConversationSummary[] {
  return seedConversations.map((item) => ({
    id: item.id,
    itemId: item.listingId,
    itemTitle: item.title,
    itemPrice: seedListings.find((listing) => listing.id === item.listingId)?.price,
    itemImage: item.itemImage || '',
    peerName: item.peer,
    peerAvatar: item.peerAvatar || '',
    role: 'buyer',
    lastMessage: item.preview,
    lastMessageAt: item.lastMessageAt || Date.now(),
    unread: item.unread,
    status: 'active',
  }))
}

function formatTime(timestamp: number) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
