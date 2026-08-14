import { Button, Image, Text, View } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro'
import { useMemo } from 'react'
import productDesk from '@/assets/mock/product-desk.png'
import './index.scss'

export default function PublishSuccessPage() {
  const router = useRouter()
  const title = decodeRouteParam(router.params.title) || '你的闲置'
  const price = decodeRouteParam(router.params.price) || '0'
  const location = decodeRouteParam(router.params.location) || '金水花园'
  const image = decodeRouteParam(router.params.image) || productDesk
  const itemId = decodeRouteParam(router.params.id)
  const needsAudit = router.params.audit === '1'
  const shareTitle = `${title} · ¥${price}`
  const sharePath = useMemo(() => itemId ? `/pages/detail/index?id=${encodeURIComponent(itemId)}` : '/pages/home/index', [itemId])

  useShareAppMessage(() => ({
    title: shareTitle,
    path: sharePath,
    imageUrl: image,
  }))

  return (
    <View className='publish-success-page'>
      <View className='publish-success-header'><Text className='publish-success-back' onClick={() => Taro.navigateBack()}>‹</Text><Text className='publish-success-title'>发布成功</Text><Text className='publish-success-more'>···</Text></View>
      <View className='publish-success-hero'>
        <View className='publish-success-check'>✓</View>
        <Text className='publish-success-heading'>{needsAudit ? '已提交审核' : '已成功发布'}</Text>
        <Text className='publish-success-subtitle'>{needsAudit ? '审核通过后会进入社区商品池' : '你的闲置已进入社区商品池'}</Text>
      </View>
      <View className='publish-success-card'>
        <Image src={image} mode='aspectFill' />
        <View className='publish-success-card-copy'>
          <Text className='publish-success-item-title'>{title}</Text>
          <Text className='publish-success-price'>¥{price}</Text>
          <Text className='publish-success-location'>⌾ {location}</Text>
        </View>
      </View>
      <Text className='publish-success-share-heading'>分享预览</Text>
      <Text className='publish-success-share-copy'>分享卡片会带上商品名称、价格和社区位置</Text>
      <View className='publish-success-preview'>
        <View className='publish-success-preview-head'><Text>⌂</Text><Text>金水花园社区群</Text><Text className='publish-success-mini-program'>小程序</Text></View>
        <View className='publish-success-preview-card'><Image src={image} mode='aspectFill' /><View><Text>{title}</Text><Text className='publish-success-preview-price'>¥{price}</Text><Text>金水花园 · 点击查看</Text></View></View>
      </View>
      <Button className='publish-success-share' openType='share'>分享到社区群</Button>
      <Text className='publish-success-later' onClick={() => Taro.reLaunch({ url: '/pages/home/index' })}>稍后再说</Text>
    </View>
  )
}

function decodeRouteParam(value?: string) {
  if (!value) return ''
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
