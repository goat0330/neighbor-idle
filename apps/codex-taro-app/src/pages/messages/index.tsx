import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { seedConversations } from '@/services/market'
import './index.scss'

export default function MessagesPage() {
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
        {seedConversations.map((item) => (
          <View className='conversation-card' key={item.id} onClick={() => Taro.navigateTo({ url: `/pages/chat/index?conversationId=${item.id}&listingId=${item.listingId}` })}>
            <View className='conversation-avatar'>{item.peer.slice(-1)}</View>
            <View className='conversation-main'><View className='conversation-title-row'><Text className='conversation-peer'>{item.peer}</Text><Text className='conversation-time'>刚刚</Text></View><Text className='conversation-listing'>{item.title}</Text><Text className='conversation-preview'>{item.preview}</Text></View>
            {item.unread > 0 && <Text className='unread-badge'>{item.unread}</Text>}
          </View>
        ))}
      </View>
    </View>
  )
}

