import { Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { BottomNav, ProductCard, PublishActionSheet, type BottomNavTab } from '@/components/community'
import { backendEnabled, favoriteApi } from '@/services/backend'
import { mapBackendItem, seedListings } from '@/services/market'
import type { Listing } from '@/types/market'
import './index.scss'

export default function FavoritesPage() {
  const [items, setItems] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [showPublishSheet, setShowPublishSheet] = useState(false)

  useDidShow(() => {
    setLoading(true)
    if (!backendEnabled) {
      const ids = Taro.getStorageSync<string[]>('community_favorite_ids') || []
      setItems(seedListings.filter((item) => ids.includes(item.id)))
      setLoading(false)
      return
    }
    favoriteApi.list({ page: 1, pageSize: 50 })
      .then((result) => setItems(result.list.map(mapBackendItem)))
      .catch((error: any) => Taro.showToast({ title: error.message || '收藏加载失败', icon: 'none' }))
      .finally(() => setLoading(false))
  })

  function changeNavigation(key: BottomNavTab) {
    if (key === 'me') return
    const routes = {
      idle: '/pages/home/index',
      wanted: '/pages/want/index',
      messages: '/pages/messages/index',
    } as const
    Taro.reLaunch({ url: routes[key] })
  }

  async function toggleFavorite(id: string, next: boolean) {
    if (!next) setItems((current) => current.filter((item) => item.id !== id))
    if (!backendEnabled) {
      const current = Taro.getStorageSync<string[]>('community_favorite_ids') || []
      Taro.setStorageSync('community_favorite_ids', next ? Array.from(new Set([...current, id])) : current.filter((itemId) => itemId !== id))
      Taro.showToast({ title: '已取消收藏', icon: 'none' })
      return
    }
    try {
      const result = await favoriteApi.toggle(id)
      if (result.favorited !== next) {
        setItems((current) => result.favorited ? current : current.filter((item) => item.id !== id))
      }
      Taro.showToast({ title: result.favorited ? '已收藏' : '已取消收藏', icon: 'none' })
    } catch (error: any) {
      if (!next) {
        const restored = seedListings.find((item) => item.id === id)
        if (restored) setItems((current) => current.some((item) => item.id === id) ? current : [...current, restored])
      }
      Taro.showToast({ title: error.message || '收藏操作失败', icon: 'none' })
    }
  }

  return (
    <View className='favorites-page'>
      <View className='favorites-heading'>
        <Text className='favorites-title'>我的收藏</Text>
        <Text className='favorites-count'>{items.length} 件</Text>
      </View>
      {loading ? <View className='favorites-empty'><Text>正在加载收藏…</Text></View> : items.length ? (
        <View className='favorites-grid'>
          {items.map((item) => <ProductCard
            key={item.id}
            id={item.id}
            image={item.image}
            title={item.title}
            price={item.price}
            seller={{ avatar: item.sellerAvatar || '', nickname: item.seller }}
            communityName={item.community}
            distanceM={item.distanceKm === undefined ? undefined : Math.round(item.distanceKm * 1000)}
            status={item.status === '已售出' ? 'sold' : 'selling'}
            favorited
            onOpen={(id) => Taro.navigateTo({ url: `/pages/detail/index?id=${encodeURIComponent(id)}` })}
            onContact={(id) => Taro.navigateTo({ url: `/pages/chat/index?listingId=${encodeURIComponent(id)}` })}
            onFavorite={(id, next) => { void toggleFavorite(id, next) }}
          />)}
        </View>
      ) : <View className='favorites-empty'><Text>还没有收藏闲置</Text><Text className='favorites-empty-action' onClick={() => Taro.reLaunch({ url: '/pages/home/index' })}>去逛逛</Text></View>}
      <BottomNav active='me' onChange={changeNavigation} onPublish={() => setShowPublishSheet(true)} />
      <PublishActionSheet
        open={showPublishSheet}
        onClose={() => setShowPublishSheet(false)}
        onPublishProduct={() => Taro.navigateTo({ url: '/pages/publish/index' })}
        onPublishWanted={() => Taro.navigateTo({ url: '/pages/request-publish/index' })}
      />
    </View>
  )
}
