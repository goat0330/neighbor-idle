import { Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import {
  BottomNav,
  CategoryTabs,
  NearbyGroupCard,
  ProductCard,
  PublishActionSheet,
  SearchLocationBar,
  type BottomNavTab,
  type CategoryTab,
} from '@/components/community'
import { backendEnabled, favoriteApi, itemApi } from '@/services/backend'
import { getEntry } from '@/services/groupPool'
import { mapBackendItem, backendCategoryKey, searchListings } from '@/services/market'
import type { Listing } from '@/types/market'
import { locationService, type UserLocation } from '@/services/location'
import { distanceMeters } from '@/utils/distance'
import './index.scss'

const categoryTabs: CategoryTab[] = ['全部', '家具', '家电', '数码', '母婴', '图书', '其他'].map((label) => ({ key: label, label }))

const serviceCategoryByTab: Record<string, string> = {
  全部: '全部',
  家具: '家具',
  家电: '家电',
  数码: '数码',
  母婴: '母婴',
  图书: '图书',
  其他: '其他',
}

const nearbyGroupEntry = getEntry({
  geoCircleName: '金水花园附近',
  communityName: '金水花园',
  distance: '约3km',
  locationLabel: '金水花园',
})

export default function HomePage() {
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('全部')
  const [showPublishSheet, setShowPublishSheet] = useState(false)
  const [soldIds] = useState<string[]>(() => Taro.getStorageSync<string[]>('community_sold_ids') || [])
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => Taro.getStorageSync<string[]>('community_favorite_ids') || [])
  const [remoteListings, setRemoteListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(backendEnabled)
  const [loadError, setLoadError] = useState('')
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const listings = useMemo(
    () => {
      if (!backendEnabled) return searchListings(keyword, serviceCategoryByTab[category] ?? '全部').filter((item) => !soldIds.includes(item.id))
      const normalized = keyword.trim().toLowerCase()
      return remoteListings.filter((item) => {
        const matchKeyword = !normalized || `${item.title}${item.category}${item.description}`.toLowerCase().includes(normalized)
        const matchCategory = category === '全部' || item.category === category
        return matchKeyword && matchCategory
      })
    },
    [category, keyword, remoteListings, soldIds],
  )

  useEffect(() => {
    if (!backendEnabled) return
    let active = true
    const timer = setTimeout(() => {
      setLoading(true)
      setLoadError('')
      const request = keyword.trim()
        ? itemApi.search({ keyword: keyword.trim(), page: 1, pageSize: 20 })
        : itemApi.list({ category: category === '全部' ? 'all' : backendCategoryKey(category), page: 1, pageSize: 20 })
      request
        .then((result) => {
          if (active) setRemoteListings(result.list.map(mapBackendItem))
        })
        .catch((error: any) => {
          if (active) setLoadError(error.message || '附近闲置加载失败')
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 220)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [category, keyword])

  useDidShow(() => {
    if (!backendEnabled) return
    favoriteApi.list({ page: 1, pageSize: 100 })
      .then((result) => {
        const ids = result.list.map((item) => item.id || item._id).filter((id): id is string => Boolean(id))
        setFavoriteIds(ids)
        Taro.setStorageSync('community_favorite_ids', ids)
      })
      .catch(() => undefined)
  })

  async function locate() {
    try {
      // 首页点击定位时主动刷新，避免继续使用旧的 5 分钟位置缓存。
      const location = await locationService.getCurrentLocation(true)
      setUserLocation(location)
      Taro.showToast({ title: '已更新附近距离', icon: 'success' })
    } catch {
      Taro.showModal({
        title: '需要定位权限',
        content: '授权定位后，商品卡片会显示与你的距离。',
        confirmText: '去授权',
      })
    }
  }

  function openDetail(id: string) {
    Taro.navigateTo({ url: `/pages/detail/index?id=${encodeURIComponent(id)}` })
  }

  function openChat(id: string) {
    Taro.navigateTo({ url: `/pages/chat/index?listingId=${encodeURIComponent(id)}` })
  }

  async function toggleFavorite(id: string, next: boolean) {
    setFavoriteIds((current) => {
      const nextIds = next ? Array.from(new Set([...current, id])) : current.filter((favoriteId) => favoriteId !== id)
      Taro.setStorageSync('community_favorite_ids', nextIds)
      return nextIds
    })
    if (!backendEnabled) {
      Taro.showToast({ title: next ? '已收藏' : '已取消收藏', icon: 'none' })
      return
    }
    try {
      const result = await favoriteApi.toggle(id)
      setFavoriteIds((current) => {
        const nextIds = result.favorited ? Array.from(new Set([...current, id])) : current.filter((favoriteId) => favoriteId !== id)
        Taro.setStorageSync('community_favorite_ids', nextIds)
        return nextIds
      })
      Taro.showToast({ title: result.favorited ? '已收藏' : '已取消收藏', icon: 'none' })
    } catch (error: any) {
      setFavoriteIds((current) => {
        const previous = !next
        const nextIds = previous ? Array.from(new Set([...current, id])) : current.filter((favoriteId) => favoriteId !== id)
        Taro.setStorageSync('community_favorite_ids', nextIds)
        return nextIds
      })
      Taro.showToast({ title: error.message || '收藏失败', icon: 'none' })
    }
  }

  function changeNavigation(key: BottomNavTab) {
    if (key === 'idle') return
    const routes = {
      wanted: '/pages/want/index',
      messages: '/pages/messages/index',
      me: '/pages/mine/index',
    } as const
    Taro.reLaunch({ url: routes[key] })
  }

  function publishProduct() {
    setShowPublishSheet(false)
    Taro.navigateTo({ url: '/pages/publish/index' })
  }

  function publishWanted() {
    setShowPublishSheet(false)
    Taro.navigateTo({ url: '/pages/request-publish/index' })
  }

  return (
    <View className='home-page'>
      <View className='home-content'>
        <SearchLocationBar
          value={keyword}
          communityName='金水花园'
          onInput={setKeyword}
          onSearch={setKeyword}
          onOpenCommunity={() => { void locate() }}
        />
        <CategoryTabs value={category} items={categoryTabs} onChange={setCategory} />

        {loading && listings.length === 0 ? (
          <View className='home-loading-state'><Text>正在加载附近闲置…</Text></View>
        ) : listings.length > 0 ? (
          <View className='product-grid'>
            {listings.map((item) => (
              (() => {
                const hasItemLocation = Number.isFinite(item.latitude) && Number.isFinite(item.longitude)
                  && item.latitude !== 0 && item.longitude !== 0
                const distanceM = userLocation && hasItemLocation
                  ? distanceMeters(userLocation, { latitude: item.latitude, longitude: item.longitude })
                  : item.distanceKm === undefined ? undefined : Math.round(item.distanceKm * 1000)
                return (
              <ProductCard
                key={item.id}
                id={item.id}
                image={item.image}
                title={item.title}
                price={item.price}
                seller={{ avatar: item.sellerAvatar || '', nickname: item.seller }}
                communityName={item.community}
                distanceM={distanceM}
                status={item.status === '已售出' ? 'sold' : 'selling'}
                favorited={favoriteIds.includes(item.id)}
                onOpen={openDetail}
                onContact={openChat}
                onFavorite={(id, next) => { void toggleFavorite(id, next) }}
              />
                )
              })()
            ))}
          </View>
        ) : (
          <View className='home-empty-state'>
            <Text className='home-empty-title'>{loadError || '暂时没有匹配的闲置'}</Text>
            <Text className='home-empty-copy' onClick={() => { setLoadError(''); setKeyword(''); setCategory('全部') }}>{loadError ? '重新加载' : '清空条件，查看全部'}</Text>
          </View>
        )}
        <NearbyGroupCard entry={nearbyGroupEntry} />
      </View>

      <BottomNav active='idle' onChange={changeNavigation} onPublish={() => setShowPublishSheet(true)} />
      <PublishActionSheet
        open={showPublishSheet}
        onClose={() => setShowPublishSheet(false)}
        onPublishProduct={publishProduct}
        onPublishWanted={publishWanted}
      />
    </View>
  )
}
