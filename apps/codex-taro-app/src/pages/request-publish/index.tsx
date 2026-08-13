import { Button, Input, Picker, Text, Textarea, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { preflightContentCheck } from '@services/contentSafety'
import './index.scss'

const categories = ['家具家电', '家居用品', '母婴玩具', '数码产品', '其他']

export default function RequestPublishPage() {
  const [category, setCategory] = useState(categories[0])
  const [title, setTitle] = useState('')
  const [budget, setBudget] = useState('')
  const [description, setDescription] = useState('')

  async function submit() {
    if (!title.trim()) {
      Taro.showToast({ title: '请填写想买的物品', icon: 'none' })
      return
    }
    const safety = await preflightContentCheck(title, description, category)
    if (!safety.safe) {
      Taro.showModal({ title: '暂时无法发布', content: `内容可能涉及${safety.reason}，请修改后再试。`, showCancel: false })
      return
    }
    Taro.showModal({ title: '求购已保存', content: '有邻居响应时会出现在消息中心，并按授权规则提醒你。', showCancel: false })
  }

  return (
    <View className='page-shell request-publish-page'>
      <Text className='eyebrow'>WANTED · NEIGHBORS</Text>
      <Text className='page-title'>发布求购</Text>
      <Text className='request-intro'>把需求写清楚，也许邻居家正好有。</Text>
      <View className='request-form'>
        <View className='form-field'><Text className='field-label'>想买什么</Text><Input value={title} onInput={(event) => setTitle(event.detail.value)} placeholder='例如：儿童餐椅' /></View>
        <View className='form-field'><Text className='field-label'>预算范围</Text><Input value={budget} onInput={(event) => setBudget(event.detail.value)} placeholder='例如：100 元以内' /></View>
        <View className='form-field'><Text className='field-label'>分类</Text><Picker mode='selector' range={categories} onChange={(event) => setCategory(categories[Number(event.detail.value)])}><View className='picker-value'>{category}<Text>⌄</Text></View></Picker></View>
        <View className='form-field'><Text className='field-label'>补充说明</Text><Textarea className='large-textarea' value={description} onInput={(event) => setDescription(event.detail.value)} maxlength={500} placeholder='成色要求、尺寸、可接受的自提时间等' /></View>
        <View className='privacy-note'><Text>●</Text><Text>仅对已认证邻居展示，响应后可在站内聊天</Text></View>
        <Button className='button-primary' onClick={submit}>发布求购</Button>
      </View>
    </View>
  )
}
