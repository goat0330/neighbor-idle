import { Button, Image, Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useMemo } from 'react'
import { seedWants } from '@/services/market'
import type { WantPost } from '@/types/market'
import './index.scss'

const isWechatMiniProgram = process.env.TARO_ENV === 'weapp'

export default function WantDetailPage() {
  const router = useRouter()
  const want = useMemo(() => resolveWant(router.params), [
    router.params.wantAuthor,
    router.params.wantAvatar,
    router.params.wantBudget,
    router.params.wantCategory,
    router.params.wantCommunity,
    router.params.wantDescription,
    router.params.wantId,
    router.params.wantTime,
    router.params.wantTitle,
  ])

  function openChat() {
    const query = [
      `wantId=${encodeURIComponent(want.id)}`,
      `wantTitle=${encodeURIComponent(want.title)}`,
      `wantBudget=${encodeURIComponent(want.budget)}`,
      `wantCommunity=${encodeURIComponent(want.community)}`,
      `wantAuthor=${encodeURIComponent(want.author)}`,
    ].join('&')
    Taro.navigateTo({ url: `/pages/chat/index?${query}` })
  }

  return (
    <View className='want-detail-page'>
      {!isWechatMiniProgram && (
        <View className='want-detail-header'>
          <Text className='want-detail-back' onClick={() => Taro.navigateBack()}>‹</Text>
          <Text className='want-detail-header-title'>需求详情</Text>
          <Text className='want-detail-more'>···</Text>
        </View>
      )}
      <View className='want-detail-content'>
        <View className='want-detail-card'>
          <View className='want-detail-profile'>
            <View className={`want-detail-avatar ${want.authorAvatar && needsMockAvatarCrop(want.authorAvatar) ? 'want-detail-avatar-crop' : ''}`}>
              {want.authorAvatar
                ? <Image className='want-detail-avatar-image' src={want.authorAvatar} mode='aspectFill' />
                : <Text className='want-detail-avatar-fallback'>{want.author.slice(0, 1) || '邻'}</Text>}
            </View>
            <View className='want-detail-profile-copy'>
              <View className='want-detail-meta'>
                <Text className='want-detail-author'>{want.author}</Text>
                <Text className='want-detail-time'>{want.publishedAtText || '刚刚'}</Text>
              </View>
              <Text className='want-detail-community'>{want.community}</Text>
            </View>
          </View>
          <Text className='want-detail-title'>{want.title}</Text>
          <View className='want-detail-facts'>
            <View><Text className='want-detail-fact-label'>预算</Text><Text className='want-detail-fact-value'>{want.budget}</Text></View>
            <View><Text className='want-detail-fact-label'>分类</Text><Text className='want-detail-fact-value'>{want.category}</Text></View>
          </View>
          <View className='want-detail-description-block'>
            <Text className='want-detail-section-title'>补充说明</Text>
            <Text className='want-detail-description'>{want.description || '暂无补充说明'}</Text>
          </View>
        </View>
        <View className='want-detail-hint'>
          <Text>如果你有合适的物品，可以直接联系发布者沟通。</Text>
        </View>
      </View>
      <View className='want-detail-bottom-action'>
        <Button className='want-detail-contact-button' onClick={openChat}>我有这个</Button>
      </View>
    </View>
  )
}

function needsMockAvatarCrop(avatar: string) {
  return avatar.includes('avatar-blue') || avatar.includes('avatar-brown')
}

function resolveWant(params: Record<string, string | undefined>): WantPost {
  const known = seedWants.find((want) => want.id === params.wantId)
  if (known) return known
  return {
    id: params.wantId || 'want-preview',
    title: decodeRouteParam(params.wantTitle) || '求购物品',
    budget: decodeRouteParam(params.wantBudget) || '价格面议',
    category: decodeRouteParam(params.wantCategory) || '其他',
    community: decodeRouteParam(params.wantCommunity) || '金水花园',
    description: decodeRouteParam(params.wantDescription),
    author: decodeRouteParam(params.wantAuthor) || '邻居',
    authorAvatar: decodeRouteParam(params.wantAvatar),
    publishedAtText: decodeRouteParam(params.wantTime) || '刚刚',
  }
}

function decodeRouteParam(value?: string) {
  if (!value) return ''
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
