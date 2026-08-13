import { Button, Image, Input, Picker, Text, Textarea, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { MapPicker, type SelectedLocation } from '@components/Map'
import { preflightContentCheck } from '@services/contentSafety'
import './index.scss'

const categories = ['家具家电', '家居用品', '母婴玩具', '数码产品', '其他']

export default function PublishPage() {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [pickupLocation, setPickupLocation] = useState<SelectedLocation | null>(null)

  async function chooseImage() {
    const result = await Taro.chooseMedia({ count: Math.max(1, 9 - images.length), mediaType: ['image'], sourceType: ['album', 'camera'] })
    const next = [...images, ...result.tempFiles.map((file) => file.tempFilePath)].slice(0, 9)
    setImages(next)
    setImage(next[0] ?? '')
  }

  async function submit() {
    if (!title.trim() || !price.trim()) {
      Taro.showToast({ title: '请填写物品名称和价格', icon: 'none' })
      return
    }
    if (!images.length) {
      Taro.showToast({ title: '请至少拍摄或选择一张实物图', icon: 'none' })
      return
    }
    if (!pickupLocation) {
      Taro.showToast({ title: '请选择自提位置', icon: 'none' })
      return
    }
    const safety = await preflightContentCheck(title, description, category)
    if (!safety.safe) {
      Taro.showModal({ title: '暂时无法发布', content: `内容可能涉及${safety.reason}，请修改后再试。`, showCancel: false })
      return
    }
    Taro.showModal({ title: '已保存发布草稿', content: '正式接入云函数后，这里会进入内容审核并通知你审核结果。', showCancel: false })
  }

  return (
    <View className='page-shell publish-page'>
      <Text className='eyebrow'>MAKE ROOM FOR NEW</Text>
      <Text className='page-title'>发布一件闲置</Text>
      <Text className='publish-intro'>信息尽量写完整，邻居更容易快速判断和联系你。</Text>
      <View className='publish-form'>
        <View className='image-picker' onClick={chooseImage}>
          {image ? <Image className='image-preview' src={image} mode='aspectFill' /> : <><Text className='image-plus'>＋</Text><Text>拍摄或从相册选择（0/9）</Text></>}
        </View>
        {images.length > 0 && <Text className='image-count'>已选择 {images.length}/9 张，首图作为封面</Text>}
        <FormField label='物品名称' hint='例如：原木色书桌，搬家低价出'><Input value={title} onInput={(event) => setTitle(event.detail.value)} placeholder='把名称写完整，卡片会完整显示' /></FormField>
        <View className='form-row'>
          <FormField label='价格'><Input type='digit' value={price} onInput={(event) => setPrice(event.detail.value)} placeholder='0' /></FormField>
          <FormField label='原价'><Input type='digit' placeholder='选填' /></FormField>
        </View>
        <FormField label='分类'><Picker mode='selector' range={categories} onChange={(event) => setCategory(categories[Number(event.detail.value)])}><View className='picker-value'>{category}<Text>⌄</Text></View></Picker></FormField>
        <FormField label='自提地点'><View className='picker-value' onClick={() => setShowMapPicker(true)}><Text>{pickupLocation?.name || '在地图选择小区或公共自提点'}</Text><Text>地图选点 ›</Text></View></FormField>
        <FormField label='补充描述' hint='成色、购买时间、尺寸、交易方式'><Textarea className='large-textarea' value={description} onInput={(event) => setDescription(event.detail.value)} maxlength={500} placeholder='写清楚成色、尺寸和交易方式，方便邻居直接判断' /></FormField>
        <View className='privacy-note'><Text>●</Text><Text>仅展示小区和模糊距离，不公开完整门牌或手机号</Text></View>
        <Button className='button-primary' onClick={submit}>发布到小区</Button>
      </View>
      <MapPicker visible={showMapPicker} onClose={() => setShowMapPicker(false)} onConfirm={setPickupLocation} />
    </View>
  )
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <View className='form-field'><View className='field-label-row'><Text className='field-label'>{label}</Text>{hint && <Text className='field-hint'>{hint}</Text>}</View>{children}</View>
}
