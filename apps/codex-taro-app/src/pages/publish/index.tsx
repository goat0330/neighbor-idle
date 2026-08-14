import { Button, Image, Input, Text, Textarea, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { MapPicker, type SelectedLocation } from '@components/Map'
import { WechatQuickProfileSheet } from '@/components/community'
import { preflightContentCheck } from '@services/contentSafety'
import { backendEnabled, itemApi, updateProfileWithAvatar, userApi } from '@/services/backend'
import { cloud } from '@/services/cloud'
import { backendCategoryKey } from '@/services/market'
import avatarOrange from '@/assets/mock/avatar-orange.png'
import './index.scss'

const categories = ['家具', '家电', '图书', '数码', '母婴', '其他']

export default function PublishPage() {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [pickupLocation, setPickupLocation] = useState<SelectedLocation | null>(null)
  const [showProfileSheet, setShowProfileSheet] = useState(false)
  const [profileReady, setProfileReady] = useState(false)
  const [profileAvatar, setProfileAvatar] = useState(avatarOrange)
  const [profileNickname, setProfileNickname] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!backendEnabled) return
    userApi.me().then((profile) => {
      setProfileAvatar(profile.avatarUrl || avatarOrange)
      setProfileNickname(profile.nickname || '')
      setProfileReady(Boolean(profile.avatarUrl && profile.nickname))
    }).catch(() => undefined)
  }, [])

  async function chooseImage() {
    try {
      const result = await Taro.chooseMedia({ count: Math.max(1, 9 - images.length), mediaType: ['image'], sourceType: ['album', 'camera'] })
      setImages((current) => [...current, ...result.tempFiles.map((file) => file.tempFilePath)].slice(0, 9))
    } catch {
      // 用户取消选择时保持当前表单。
    }
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, currentIndex) => currentIndex !== index))
  }

  async function submit() {
    if (!title.trim() || !price.trim()) {
      Taro.showToast({ title: '请填写物品名称和价格', icon: 'none' })
      return
    }
    if (!images.length) {
      Taro.showToast({ title: '请至少添加一张实物图', icon: 'none' })
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
    if (!profileReady) {
      setShowProfileSheet(true)
      return
    }
    await finishPublish()
  }

  async function completeProfile() {
    if (!profileNickname.trim()) {
      Taro.showToast({ title: '请先填写昵称', icon: 'none' })
      return
    }
    setSavingProfile(true)
    try {
      if (backendEnabled) await updateProfileWithAvatar({ avatarUrl: profileAvatar, nickname: profileNickname.trim() })
      setProfileReady(true)
      setShowProfileSheet(false)
      await finishPublish()
    } catch (error: any) {
      Taro.showToast({ title: error.message || '资料保存失败', icon: 'none' })
    } finally {
      setSavingProfile(false)
    }
  }

  async function finishPublish() {
    setSubmitting(true)
    try {
      const imageUrls = backendEnabled ? await cloud.uploadImages(images) : images
      const result = backendEnabled
        ? await itemApi.create({
            title: title.trim(),
            desc: description.trim(),
            images: imageUrls,
            price: Number(price),
            condition: 'almost',
            category: backendCategoryKey(category),
            communityId: 'jinshui',
            communityName: pickupLocation?.name || '金水花园',
            location: pickupLocation?.address || pickupLocation?.name || '社区公共点自提',
            latitude: pickupLocation?.latitude,
            longitude: pickupLocation?.longitude,
          })
        : { needAudit: false }
      const itemId = 'id' in result && result.id ? result.id : `local-${Date.now()}`
      const previewImage = imageUrls[0] || images[0] || ''
      const query = [
        `id=${encodeURIComponent(itemId)}`,
        `title=${encodeURIComponent(title.trim())}`,
        `price=${encodeURIComponent(price.trim())}`,
        `location=${encodeURIComponent(pickupLocation?.name || '金水花园')}`,
        `image=${encodeURIComponent(previewImage)}`,
        result.needAudit ? 'audit=1' : '',
      ].filter(Boolean).join('&')
      await Taro.redirectTo({ url: `/pages/publish-success/index?${query}` })
    } catch (error: any) {
      Taro.showToast({ title: error.message || '发布失败，请稍后再试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className='publish-page'>
      <View className='publish-header'><Text className='publish-back' onClick={() => Taro.navigateBack()}>‹</Text><Text className='publish-title'>发布闲置</Text><Text className='publish-more'>···</Text></View>
      <View className='publish-content'>
        <Text className='publish-tip'>先上传真实照片，更容易卖出</Text>
        <View className='publish-photo-grid'>
          {images.map((image, index) => (
            <View className='publish-photo' key={`${image}-${index}`}>
              <Image src={image} mode='aspectFill' />
              <Text className='publish-photo-remove' onClick={() => removeImage(index)}>×</Text>
            </View>
          ))}
          {images.length < 9 && <View className='publish-photo publish-photo-add' onClick={() => { void chooseImage() }}><Text>＋</Text><Text>添加照片</Text></View>}
        </View>
        <View className='publish-form'>
          <FormField label='标题' counter={`${title.length}/30`}><Input maxlength={30} value={title} onInput={(event) => setTitle(event.detail.value)} placeholder='例如：宜家书桌' /></FormField>
          <FormField label='价格'><Input type='digit' value={price} onInput={(event) => setPrice(event.detail.value)} placeholder='¥ 0' /></FormField>
          <View className='publish-field'><Text className='publish-field-label'>分类</Text><View className='publish-category-row'>{categories.map((item) => <Text key={item} className={`publish-category ${category === item ? 'is-active' : ''}`} onClick={() => setCategory(item)}>{item}</Text>)}</View></View>
          <FormField label='成色' value='9成新' />
          <View className='publish-field'><Text className='publish-field-label'>补充描述 <Text className='publish-field-muted'>（选填）</Text></Text><Textarea className='publish-textarea' value={description} onInput={(event) => setDescription(event.detail.value)} maxlength={500} placeholder='写清楚成色、尺寸和交易方式，方便邻居直接判断' /><Text className='publish-counter'>{description.length}/500</Text></View>
          <View className='publish-location-row' onClick={() => setShowMapPicker(true)}><Text className='publish-field-label'>所在地</Text><Text className='publish-location-value'>{pickupLocation?.name || '金水花园'} ›</Text></View>
        </View>
      </View>
      <View className='publish-submit-wrap'><Button className='publish-submit' loading={submitting} onClick={() => { void submit() }}>{submitting ? '发布中...' : '发布'}</Button></View>
      <MapPicker visible={showMapPicker} onClose={() => setShowMapPicker(false)} onConfirm={setPickupLocation} />
      <WechatQuickProfileSheet
        open={showProfileSheet}
        avatarUrl={profileAvatar}
        nickname={profileNickname}
        saving={savingProfile}
        onChooseAvatar={setProfileAvatar}
        onNicknameChange={setProfileNickname}
        onComplete={() => { void completeProfile() }}
        onClose={() => setShowProfileSheet(false)}
      />
    </View>
  )
}

function FormField({ label, counter, value, children }: { label: string; counter?: string; value?: string; children?: ReactNode }) {
  return <View className='publish-field'><View className='publish-field-heading'><Text className='publish-field-label'>{label}</Text>{counter && <Text className='publish-counter'>{counter}</Text>}</View>{children || <Text className='publish-field-value'>{value}</Text>}</View>
}
