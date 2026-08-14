import { Image, Text, View } from '@tarojs/components'
import './index.scss'

export type ChatBubbleSide = 'incoming' | 'outgoing'

export type ChatBubbleProps = {
  side: ChatBubbleSide
  avatar?: string
  text: string
  time?: string
  read?: boolean
}

export default function ChatBubble({ side, avatar, text, time, read }: ChatBubbleProps) {
  const incoming = side === 'incoming'

  return (
    <View className={`chat-bubble-row ${incoming ? 'is-incoming' : 'is-outgoing'}`}>
      {incoming && avatar && <Image className='chat-bubble-row__avatar' src={avatar} mode='aspectFill' />}
      <View className='chat-bubble-row__stack'>
        <View className='chat-bubble-row__bubble'><Text>{text}</Text></View>
        {(time || (!incoming && read)) && (
          <View className='chat-bubble-row__meta'>
            {time && <Text className='chat-bubble-row__time'>{time}</Text>}
            {!incoming && read && <Text className='chat-bubble-row__read'>已读</Text>}
          </View>
        )}
      </View>
      {!incoming && avatar && <Image className='chat-bubble-row__avatar' src={avatar} mode='aspectFill' />}
    </View>
  )
}
