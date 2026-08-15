import { Button, Image, Swiper, SwiperItem, Text, View } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import shareIcon from '@/assets/icons/share.svg'
import starActiveIcon from '@/assets/icons/star-active.svg'
import starIcon from '@/assets/icons/star.svg'
import { NearbyGroupCard } from '@/components/community'
import { backendEnabled, favoriteApi, itemApi } from '@/services/backend'
import { getEntry } from '@/services/groupPool'
import { mapBackendItem, seedListings } from '@/services/market'
import type { Listing } from '@/types/market'
import './index.scss'

const quickQuestions = ['还在吗？', '今天方便拿吗？', '能便宜点吗？', '尺寸多大？']
const isWechatMiniProgram = process.env.TARO_ENV === 'weapp'

export default function DetailPage() {
  const router = useRouter()
  const seedItem = useMemo(() => seedListings.find((listing) => listing.id === router.params.id) ?? seedListings[0], [router.params.id])
  const [item, setItem] = useState<Listing>(seedItem)
  const [favorite, setFavorite] = useState(false)
  const [isMine, setIsMine] = useState(false)

  useEffect(() => {
    setItem(seedItem)
    const storedFavoriteIds = Taro.getStorageSync<string[]>('community_favorite_ids') || []
    setFavorite(storedFavoriteIds.includes(seedItem.id))
    const listingId = router.params.id
    if (!backendEnabled || !listingId) return
    itemApi.detail(listingId)
      .then((result) => {
        setItem(mapBackendItem(result.item))
        setFavorite(result.isFavorite)
        updateLocalFavorite(listingId, result.isFavorite)
        setIsMine(result.isMine)
      })
      .catch((error: any) => Taro.showToast({ title: error.message || '商品加载失败', icon: 'none' }))
  }, [router.params.id, seedItem])

  function openChat(question?: string) {
    const query = question ? `&draft=${encodeURIComponent(question)}` : ''
    Taro.navigateTo({ url: `/pages/chat/index?listingId=${item.id}${query}` })
  }

  async function toggleFavorite() {
    const next = !favorite
    if (backendEnabled && router.params.id) {
      try {
        const result = await favoriteApi.toggle(router.params.id)
        setFavorite(result.favorited)
        updateLocalFavorite(router.params.id, result.favorited)
        Taro.showToast({ title: result.favorited ? '已收藏' : '已取消收藏', icon: 'none' })
      } catch (error: any) {
        Taro.showToast({ title: error.message || '收藏失败', icon: 'none' })
      }
      return
    }
    setFavorite(next)
    updateLocalFavorite(item.id, next)
    Taro.showToast({ title: next ? '已收藏' : '已取消收藏', icon: 'none' })
  }

  const galleryImages = item.images || [item.image]
  const nearbyGroupEntry = useMemo(() => getEntry({
    geoCircleId: item.geoCircleId,
    geoCircleName: item.geoCircleName,
    communityName: item.community,
    distance: item.distance ?? formatDistance(item.distanceKm),
    locationLabel: item.locationLabel || item.location,
  }), [item.community, item.distance, item.distanceKm, item.geoCircleId, item.geoCircleName, item.location, item.locationLabel])

  useShareAppMessage(() => ({
    title: `${item.title} · ¥${item.price}`,
    path: `/pages/detail/index?id=${encodeURIComponent(item.id)}`,
    imageUrl: galleryImages[0],
  }))

  return (
    <View className='detail-page'>
      {!isWechatMiniProgram && <View className='detail-topbar'><Text className='detail-back' onClick={() => Taro.navigateBack()}>‹</Text></View>}
      <View className='detail-gallery'>
        <Swiper className='detail-swiper' circular={galleryImages.length > 1} indicatorDots={galleryImages.length > 1} indicatorColor='rgba(34,34,34,.2)' indicatorActiveColor='#FF7433'>
          {galleryImages.map((image, index) => <SwiperItem key={`${image}-${index}`}><Image className='detail-image' src={image} mode='aspectFill' /></SwiperItem>)}
        </Swiper>
        <Text className='detail-gallery-count'>1/{galleryImages.length}</Text>
      </View>
      <View className='detail-content'>
        <View className='detail-title-row'>
          <View>
            <Text className='detail-title'>{item.title}</Text>
            <Text className='detail-price'>¥{item.price}</Text>
          </View>
          <Text className='detail-condition'>{item.condition}</Text>
        </View>
        <View className='detail-seller-card'>
          <Image className='detail-seller-avatar' src={item.sellerAvatar || ''} mode='aspectFill' />
          <View className='detail-seller-copy'>
            <Text className='detail-seller-name'>{item.seller}</Text>
            <Text className='detail-seller-community'>{item.community} · {formatDistance(item.distanceKm)}</Text>
          </View>
          <Text className='detail-seller-action' onClick={() => isMine ? Taro.navigateTo({ url: '/pages/mine/index' }) : openChat()}>{isMine ? '管理闲置 ›' : '问问卖家 ›'}</Text>
        </View>
        <View className='detail-section'>
          <Text className='detail-section-title'>商品描述</Text>
          <Text className='detail-description'>{item.description}</Text>
        </View>
        <View className='detail-info-card'>
          <View><Text className='detail-info-label'>成色</Text><Text className='detail-info-value'>{item.condition}</Text></View>
          <View><Text className='detail-info-label'>自取方式</Text><Text className='detail-info-value'>仅支持自提</Text></View>
          <View><Text className='detail-info-label'>可取时间</Text><Text className='detail-info-value'>周末全天</Text></View>
          <View><Text className='detail-info-label'>发布位置</Text><Text className='detail-info-value'>{item.community}</Text></View>
        </View>
        <View className='detail-section detail-location' onClick={() => Taro.showToast({ title: '仅展示社区级位置，具体位置请在聊天中确认', icon: 'none' })}>
          <View><Text className='detail-section-title'>面交位置</Text><Text className='detail-description'>{item.community} · {item.location} · 距你约 {formatDistance(item.distanceKm)}</Text></View>
          <Text className='detail-location-arrow'>›</Text>
        </View>
        <NearbyGroupCard entry={nearbyGroupEntry} />
        <View className='detail-quick-row'>
          <Text className='detail-quick-label'>快速提问</Text>
          {quickQuestions.map((question) => <Text key={question} className='detail-quick-chip' onClick={() => openChat(question)}>{question}</Text>)}
        </View>
      </View>
      <View className='detail-bottom-action'>
        <View className='detail-bottom-actions-left'>
          <Button className='detail-bottom-icon-action' onClick={() => { void toggleFavorite() }}>
            <Image className='detail-bottom-icon' src={favorite ? starActiveIcon : starIcon} mode='aspectFit' />
            <Text>收藏</Text>
          </Button>
          <Button className='detail-bottom-icon-action' openType='share' onClick={() => { if (!isWechatMiniProgram) Taro.showToast({ title: '请在微信中分享商品', icon: 'none' }) }}>
            <Image className='detail-bottom-icon' src={shareIcon} mode='aspectFit' />
            <Text>分享</Text>
          </Button>
        </View>
        <Button className='detail-chat-button' onClick={() => isMine ? Taro.navigateTo({ url: '/pages/mine/index' }) : openChat()}>{isMine ? '管理闲置' : '问问卖家'}</Button>
      </View>
    </View>
  )
}

function updateLocalFavorite(id: string, favorited: boolean) {
  const current = Taro.getStorageSync<string[]>('community_favorite_ids') || []
  const next = favorited ? Array.from(new Set([...current, id])) : current.filter((favoriteId) => favoriteId !== id)
  Taro.setStorageSync('community_favorite_ids', next)
}

function formatDistance(distanceKm?: number) {
  if (distanceKm === undefined) return '附近'
  return `${Math.round(distanceKm * 1000)}m`
}
