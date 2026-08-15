import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import {
  BottomNav,
  CategoryTabs,
  PublishActionSheet,
  SearchLocationBar,
  WantedCard,
  type BottomNavTab,
  type CategoryTab,
} from '@/components/community'
import { backendEnabled, wantApi } from '@/services/backend'
import { backendCategoryKey, mapBackendWant, seedWants } from '@/services/market'
import type { WantPost } from '@/types/market'
import './index.scss'

const categoryTabs: CategoryTab[] = ['全部', '家具', '家电', '数码', '母婴', '图书', '其他'].map((label) => ({ key: label, label }))

export default function WantPage() {
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('全部')
  const [showPublishSheet, setShowPublishSheet] = useState(false)
  const [remoteWants, setRemoteWants] = useState<WantPost[]>([])
  const [loading, setLoading] = useState(backendEnabled)
  const [loadError, setLoadError] = useState('')
  const wants = useMemo(() => (backendEnabled ? remoteWants : seedWants).filter((item) => {
    const normalized = keyword.trim().toLowerCase()
    const matchKeyword = !normalized || `${item.title}${item.description}${item.community}`.toLowerCase().includes(normalized)
    const matchCategory = category === '全部' || item.category === category
    return matchKeyword && matchCategory
  }), [category, keyword, remoteWants])

  useEffect(() => {
    if (!backendEnabled) return
    let active = true
    setLoading(true)
    setLoadError('')
    wantApi.list({ category: category === '全部' ? 'all' : backendCategoryKey(category), page: 1, pageSize: 20 })
      .then((result) => {
        if (active) setRemoteWants(result.list.map(mapBackendWant))
      })
      .catch((error: any) => {
        if (active) setLoadError(error.message || '求购加载失败')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [category])

  function changeNavigation(key: BottomNavTab) {
    if (key === 'wanted') return
    const routes = {
      idle: '/pages/home/index',
      messages: '/pages/messages/index',
      me: '/pages/mine/index',
    } as const
    Taro.reLaunch({ url: routes[key] })
  }

  function getSelectedWant(id: string) {
    return wants.find((want) => want.id === id)
  }

  function buildWantQuery(want: WantPost) {
    return [
      `wantId=${encodeURIComponent(want.id)}`,
      `wantTitle=${encodeURIComponent(want.title)}`,
      `wantBudget=${encodeURIComponent(want.budget)}`,
      `wantCommunity=${encodeURIComponent(want.community)}`,
      `wantAuthor=${encodeURIComponent(want.author)}`,
      `wantCategory=${encodeURIComponent(want.category)}`,
      `wantDescription=${encodeURIComponent(want.description)}`,
      `wantAvatar=${encodeURIComponent(want.authorAvatar || '')}`,
      `wantTime=${encodeURIComponent(want.publishedAtText || '刚刚')}`,
    ].join('&')
  }

  function openWantDetail(id: string) {
    const selected = getSelectedWant(id)
    if (!selected) return
    Taro.navigateTo({ url: `/pages/want-detail/index?${buildWantQuery(selected)}` })
  }

  return (
    <View className='want-page'>
      <View className='want-content'>
        <SearchLocationBar
          value={keyword}
          placeholder='搜索求购'
          communityName='金水花园'
          onInput={setKeyword}
          onSearch={setKeyword}
        />
        <CategoryTabs value={category} items={categoryTabs} onChange={setCategory} />
        <View className='want-list'>
          {loading && wants.length === 0 ? <View className='want-empty'><Text>正在加载附近求购…</Text></View> : wants.map((item) => (
            <WantedCard
              key={item.id}
              id={item.id}
              avatar={item.authorAvatar || ''}
              nickname={item.author}
              title={item.title}
              budgetText={item.budget}
              communityName={item.community}
              publishedAtText={item.publishedAtText || '刚刚'}
              description={item.description}
              onOpen={openWantDetail}
              onOffer={(id) => {
                const selected = getSelectedWant(id)
                const query = [
                  `wantId=${encodeURIComponent(id)}`,
                  `wantTitle=${encodeURIComponent(selected?.title || item.title)}`,
                  `wantBudget=${encodeURIComponent(selected?.budget || item.budget)}`,
                  `wantCommunity=${encodeURIComponent(selected?.community || item.community)}`,
                  `wantAuthor=${encodeURIComponent(selected?.author || item.author)}`,
                ].join('&')
                Taro.navigateTo({ url: `/pages/chat/index?${query}` })
              }}
            />
          ))}
          {!loading && !wants.length && (
            <View className='want-empty'>
              <Text>{loadError || '附近暂无这类求购'}</Text>
              <Text className='want-empty-action' onClick={() => { setLoadError(''); setKeyword(''); setCategory('全部') }}>{loadError ? '重新加载' : '查看全部'}</Text>
            </View>
          )}
        </View>
      </View>
      <BottomNav active='wanted' onChange={changeNavigation} onPublish={() => setShowPublishSheet(true)} />
      <PublishActionSheet
        open={showPublishSheet}
        onClose={() => setShowPublishSheet(false)}
        onPublishProduct={() => Taro.navigateTo({ url: '/pages/publish/index' })}
        onPublishWanted={() => Taro.navigateTo({ url: '/pages/request-publish/index' })}
      />
    </View>
  )
}
