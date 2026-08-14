import { Image, Text, View } from '@tarojs/components'
import './index.scss'

export type ProductChatAnchorProps = {
  image: string
  title: string
  price: number | string
  communityName: string
  onOpen?: () => void
}

export default function ProductChatAnchor({
  image,
  title,
  price,
  communityName,
  onOpen,
}: ProductChatAnchorProps) {
  return (
    <View className='product-chat-anchor' onClick={() => onOpen?.()}>
      <Image className='product-chat-anchor__image' src={image} mode='aspectFill' />
      <View className='product-chat-anchor__copy'>
        <Text className='product-chat-anchor__title'>{title}</Text>
        <Text className='product-chat-anchor__price'>¥{price}</Text>
        <Text className='product-chat-anchor__location'>{communityName}</Text>
      </View>
      <Text className='product-chat-anchor__action'>查看商品 <Text className='product-chat-anchor__arrow'>›</Text></Text>
    </View>
  )
}
