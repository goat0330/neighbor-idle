import { Button, Input, Text, Textarea, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { MapPicker, type SelectedLocation } from '@components/Map'
import { WechatQuickProfileSheet } from '@/components/community'
import { backendEnabled, updateProfileWithAvatar, userApi, wantApi } from '@/services/backend'
import { backendCategoryKey } from '@/services/market'
import { preflightContentCheck } from '@services/contentSafety'
import avatarOrange from '@/assets/mock/avatar-orange.png'
import './index.scss'

const categories = ['家具', '家电', '图书', '数码', '母婴', '其他']

export default function RequestPublishPage() {
  const isWechatMiniProgram = process.env.TARO_ENV === 'weapp'
  const [category, setCategory] = useState(categories[0])
  const [title, setTitle] = useState('')
  const [budget, setBudget] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState<SelectedLocation | null>(null)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [showProfileSheet, setShowProfileSheet] = useState(false)
  const [profileAvatar, setProfileAvatar] = useState(avatarOrange)
  const [profileNickname, setProfileNickname] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileReady, setProfileReady] = useState(false)

  useEffect(() => {
    if (!backendEnabled) return
    userApi.me().then((profile) => {
      setProfileAvatar(profile.avatarUrl || avatarOrange)
      setProfileNickname(profile.nickname || '')
      setProfileReady(Boolean(profile.avatarUrl && profile.nickname))
    }).catch(() => undefined)
  }, [])

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
    if (backendEnabled) {
      await wantApi.create({
        title: title.trim(),
        desc: description.trim(),
        category: backendCategoryKey(category),
        priceRange: budget.trim(),
      })
    }
    await Taro.showModal({ title: '求购已发布', content: '附近邻居看到后，可以在消息里联系你。', showCancel: false, confirmText: '回到求购' })
    Taro.reLaunch({ url: '/pages/want/index' })
  }

  return (
      <View className='request-publish-page'>
      {!isWechatMiniProgram && <View className='request-header'><Text className='request-back' onClick={() => Taro.navigateBack()}>‹</Text><Text className='request-title'>发布求购</Text><Text className='request-more'>···</Text></View>}
      <View className='request-content'>
        <View className='request-form'>
          <View className='request-field request-title-field'><Text className='request-field-label'>标题</Text><Input maxlength={30} value={title} onInput={(event) => setTitle(event.detail.value)} placeholder='求一个小书桌' /><Text className='request-counter'>{title.length}/30</Text></View>
          <View className='request-field'><Text className='request-field-label'>预算</Text><Input value={budget} onInput={(event) => setBudget(event.detail.value)} placeholder='¥50–100' /></View>
          <View className='request-field'><Text className='request-field-label'>分类</Text><View className='request-category-row'>{categories.map((item) => <Text key={item} className={`request-category ${category === item ? 'is-active' : ''}`} onClick={() => setCategory(item)}>{item}</Text>)}</View></View>
          <View className='request-field request-description-field'><Text className='request-field-label'>补充要求 <Text className='request-muted'>（选填）</Text></Text><Textarea value={description} onInput={(event) => setDescription(event.detail.value)} maxlength={200} placeholder='例如：希望尺寸不超过 100cm，成色较新，无明显划痕，自提优先，谢谢～' /><Text className='request-counter'>{description.length}/200</Text></View>
          <View className='request-location-row' onClick={() => setShowMapPicker(true)}><Text className='request-field-label'>所在地</Text><Text className='request-location-value'>{location?.name || '金水花园'} ›</Text></View>
        </View>
      </View>
      <View className='request-submit-wrap'><Button className='request-submit' onClick={() => { void submit() }}>发布求购</Button></View>
      <MapPicker visible={showMapPicker} onClose={() => setShowMapPicker(false)} onConfirm={setLocation} />
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
