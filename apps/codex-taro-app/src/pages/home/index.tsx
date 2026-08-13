import { Input, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useMemo, useState } from 'react'
import ListingCard from '@/components/ListingCard'
import SectionHeading from '@/components/SectionHeading'
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
          <Text className='eyebrow'>NEIGHBOR · MARKET</Text>
          <Text className='page-title'>附近闲置</Text>
        </View>
        <Text className='home-location' onClick={locate}>{located ? '已定位' : '定位'} ↗</Text>
      </View>
      <View className='search-box'>
        <Text className='search-icon'>⌕</Text>
        <Input value={keyword} onInput={(event) => setKeyword(event.detail.value)} placeholder='搜索你想要的东西' />
      </View>
      <View className='category-row'>
        {categories.map((item) => <Text key={item} className={`category-pill ${category === item ? 'category-pill-active' : ''}`} onClick={() => setCategory(item)}>{item}</Text>)}
      </View>
      <View className='trust-banner'>
        <Text className='trust-dot'>●</Text>
        <Text>{located ? '已按距离排序，优先展示附近邻居' : '开启定位，显示“同小区 / 距你 800m”'}</Text>
        {!located && <Text className='trust-link' onClick={locate}>开启</Text>}
      </View>
      <SectionHeading eyebrow='TODAY · NEARBY' title={`${listings.length} 件好东西`} action='发布闲置' onAction={() => Taro.switchTab({ url: '/pages/publish/index' })} />
      <View className='view-switch'>
        <Text className={viewMode === 'list' ? 'view-switch-active' : ''} onClick={() => setViewMode('list')}>双列列表</Text>
        <Text className={viewMode === 'map' ? 'view-switch-active' : ''} onClick={() => setViewMode('map')}>地图找货</Text>
      </View>
      {viewMode === 'list' ? (
        <View className='listing-grid'>{listings.map((item) => <ListingCard key={item.id} item={item} />)}</View>
      ) : (
        <NearbyMap items={mapItems} height='760rpx' onItemClick={(item) => Taro.navigateTo({ url: `/pages/detail/index?id=${item.id}` })} />
      )}
      {!listings.length && <View className='empty-state'><Text>暂时没有匹配的闲置，去求购广场发布需求？</Text></View>}
    </View>
  )
}
