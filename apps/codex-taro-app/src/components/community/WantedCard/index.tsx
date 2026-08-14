import { Image, Text, View } from '@tarojs/components'
import './index.scss'

export type WantedCardProps = {
  id: string
  avatar: string
  nickname: string
  title: string
  budgetText?: string
  communityName: string
  publishedAtText: string
  description?: string
  onOffer: (id: string) => void
}

export default function WantedCard({
  id,
  avatar,
  nickname,
  title,
  budgetText,
  communityName,
  publishedAtText,
  description,
  onOffer,
}: WantedCardProps) {
  return (
    <View className='wanted-card'>
      {avatar
        ? <Image className='wanted-card-avatar' src={avatar} mode='aspectFill' />
        : <View className='wanted-card-avatar wanted-card-avatar-fallback'>{nickname.slice(0, 1) || '邻'}</View>}
      <View className='wanted-card-content'>
        <View className='wanted-card-meta'>
          <Text className='wanted-card-nickname'>{nickname}</Text>
          <Text className='wanted-card-time'>{publishedAtText}</Text>
        </View>
        <Text className='wanted-card-title'>{title}</Text>
        <View className='wanted-card-detail'>
          {budgetText && <Text>预算 <Text className='wanted-card-budget'>{budgetText}</Text></Text>}
          <Text className='wanted-card-community'>{communityName}</Text>
        </View>
        {description && <Text className='wanted-card-description'>{description}</Text>}
      </View>
      <View className='wanted-card-offer' onClick={() => onOffer(id)}>
        <Text>我有这个</Text>
      </View>
      <Text className='wanted-card-chevron'>›</Text>
    </View>
  )
}
