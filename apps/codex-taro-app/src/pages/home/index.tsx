import { Input, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useMemo, useState } from 'react'
import ListingCard from '@/components/ListingCard'
import { requestUserLocation } from '@/services/location'
import { searchListings } from '@/services/market'
import { NearbyMap, type NearbyItem } from '@components/Map'
import './index.scss'

const categories = ['全部', '家具家电', '家居用品', '母婴玩具', '数码产品']

export default function HomePage() {
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('全部')
  const [located, setLocated] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const listings = useMemo(() => searchListings(keyword, category), [keyword, category])
  const mapItems: NearbyItem[] = listings.map((item) => ({
    id: item.id,
    title: item.title,
    price: item.price,
    coverImage: item.image,
    location: { latitude: item.latitude, longitude: item.longitude },
  }))

  async function locate() {
    const location = await requestUserLocation()
    if (location) {
      setLocated(true)
      Taro.showToast({ title: '已更新附近距离', icon: 'success' })
    } else {
      Taro.showModal({ title: '需要定位权限', content: '授权定位后，商品卡片会显示与你的距离。', confirmText: '去授权' })
    }
  }

  return (
    <View className='page-shell home-page'>
      <View className='home-header'>
        <View>
          <Text className='page-title'>附近闲置</Text>
          <Text className='home-promise'>看附近 · 当面验 · 直接拿走</Text>
        </View>
        <View className='home-header-actions'>
          <Text className='home-location' onClick={locate}>{located ? '已定位' : '定位'}</Text>
          <Text className='home-mine' onClick={() => Taro.navigateTo({ url: '/pages/mine/index' })}>我</Text>
        </View>
      </View>
      <View className='search-box'>
        <Text className='search-icon'>⌕</Text>
        <Input value={keyword} onInput={(event) => setKeyword(event.detail.value)} placeholder='搜索你想要的东西' />
      </View>
      <View className='category-row'>
        {categories.map((item) => <Text key={item} className={`category-pill ${category === item ? 'category-pill-active' : ''}`} onClick={() => setCategory(item)}>{item}</Text>)}
      </View>
      <View className='core-actions'>
        <View className='core-action core-action-primary' onClick={() => Taro.switchTab({ url: '/pages/publish/index' })}>
          <Text className='core-action-title'>卖一件闲置</Text>
          <Text className='core-action-copy'>拍照，定价，发布</Text>
        </View>
        <View className='core-action core-action-secondary' onClick={() => Taro.navigateTo({ url: '/pages/request-publish/index' })}>
          <Text className='core-action-title'>没找到？求购</Text>
          <Text className='core-action-copy'>让邻居来响应</Text>
        </View>
      </View>
      <View className='result-heading'>
        <View><Text className='result-title'>离你最近</Text><Text className='result-count'>{located ? `${listings.length} 件` : '定位后按距离排序'}</Text></View>
        <View className='view-switch'>
          <Text className={viewMode === 'list' ? 'view-switch-active' : ''} onClick={() => setViewMode('list')}>列表</Text>
          <Text className={viewMode === 'map' ? 'view-switch-active' : ''} onClick={() => setViewMode('map')}>地图</Text>
        </View>
      </View>
      {viewMode === 'list' ? (
        <View className='listing-grid'>{listings.map((item) => <ListingCard key={item.id} item={item} />)}</View>
      ) : (
        <NearbyMap items={mapItems} height='760rpx' onItemClick={(item) => Taro.navigateTo({ url: `/pages/detail/index?id=${item.id}` })} />
      )}
      {!listings.length && <View className='empty-state' onClick={() => Taro.navigateTo({ url: '/pages/request-publish/index' })}><Text>没找到？直接发布求购</Text></View>}
    </View>
  )
}
