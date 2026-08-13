import { Input, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useMemo, useState } from 'react'
import SectionHeading from '@/components/SectionHeading'
import { seedWants } from '@/services/market'
import './index.scss'

const categories = ['全部', '家具家电', '家居用品', '母婴玩具', '数码产品']

export default function WantPage() {
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('全部')
  const wants = useMemo(() => seedWants.filter((item) => {
    const matchKeyword = !keyword.trim() || `${item.title}${item.description}`.includes(keyword.trim())
    return matchKeyword && (category === '全部' || item.category === category)
  }), [keyword, category])

  return (
    <View className='page-shell want-page'>
      <SectionHeading eyebrow='NEIGHBOR WANTS' title='求购广场' action='我要求购' onAction={() => Taro.navigateTo({ url: '/pages/request-publish/index' })} />
      <Text className='want-intro'>你有需求，邻居来响应。发布想买的东西，等待附近的好消息。</Text>
      <View className='search-box want-search'><Input value={keyword} onInput={(event) => setKeyword(event.detail.value)} placeholder='搜索求购内容' /></View>
      <View className='category-row'>
        {categories.map((item) => <Text key={item} className={`category-pill ${category === item ? 'category-pill-active' : ''}`} onClick={() => setCategory(item)}>{item}</Text>)}
      </View>
      <View className='want-list'>
        {wants.map((item) => (
          <View className='want-card' key={item.id}>
            <View className='want-card-top'><Text className='want-card-title'>{item.title}</Text><Text className='want-budget'>{item.budget}</Text></View>
            <Text className='want-description'>{item.description}</Text>
            <View className='want-card-bottom'><Text>{item.community} · {item.author}</Text><View className='want-contact' onClick={() => Taro.navigateTo({ url: `/pages/chat/index?wantId=${item.id}` })}>留言响应</View></View>
          </View>
        ))}
      </View>
    </View>
  )
}

