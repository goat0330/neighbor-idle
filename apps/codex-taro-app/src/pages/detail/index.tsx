import { Button, Image, Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useMemo } from 'react'
import { seedListings } from '@/services/market'
import './index.scss'

export default function DetailPage() {
  const router = useRouter()
  const item = useMemo(() => seedListings.find((listing) => listing.id === router.params.id) ?? seedListings[0], [router.params.id])

  return (
    <View className='detail-page'>
      <Image className='detail-image' src={item.image} mode='aspectFill' />
      <View className='detail-body'>
        <View className='detail-status'><Text>{item.status}</Text><Text>{item.condition}</Text></View>
        <Text className='detail-title'>{item.title}</Text>
        <View className='detail-price-row'><Text className='detail-price'>¥{item.price}</Text>{item.originalPrice && <Text className='detail-original'>原价 ¥{item.originalPrice}</Text>}</View>
        <Text className='detail-description'>{item.description}</Text>
        <View className='detail-divider' />
        <View className='seller-card'>
          <View className='seller-avatar'>邻</View>
          <View><Text className='seller-name'>{item.seller}</Text><Text className='seller-credit'>同小区认证 · 信用 {item.sellerCredit}</Text></View>
        </View>
        <View className='location-card'>
          <View><Text className='location-title'>建议公共区域面交</Text><Text className='location-copy'>{item.community} · {item.location} · 距你约 {item.distanceKm?.toFixed(1)}km</Text></View>
          <Text className='location-arrow'>›</Text>
        </View>
        <View className='trade-steps'>
          <Text className='trade-step trade-step-active'>1 我想要</Text><Text className='trade-arrow'>→</Text><Text className='trade-step'>2 聊天议价</Text><Text className='trade-arrow'>→</Text><Text className='trade-step'>3 约定自提</Text>
        </View>
        <Button className='button-primary detail-action' onClick={() => Taro.navigateTo({ url: `/pages/chat/index?listingId=${item.id}` })}>我想要，去聊聊</Button>
        <Text className='detail-safety'>平台不代收款，交易前请核验物品并在公共区域见面</Text>
      </View>
    </View>
  )
}

