import { Image, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Listing } from '@/types/market'
import './index.scss'

type ListingCardProps = {
  item: Listing
}

export default function ListingCard({ item }: ListingCardProps) {
  return (
    <View className='listing-card' onClick={() => Taro.navigateTo({ url: `/pages/detail/index?id=${item.id}` })}>
      <Image className='listing-image' src={item.image} mode='aspectFill' lazyLoad />
      <View className='listing-content'>
        <Text className='listing-title'>{item.title}</Text>
        <View className='listing-meta'>
          <Text className='listing-price'>¥{item.price}</Text>
          <Text className='listing-distance'>{item.distanceKm ? `${item.distanceKm.toFixed(1)}km` : '定位后显示距离'}</Text>
        </View>
        <View className='listing-tags'>
          <Text className='listing-tag'>{item.condition}</Text>
          <Text className='listing-tag'>{item.community}</Text>
        </View>
      </View>
    </View>
  )
}

