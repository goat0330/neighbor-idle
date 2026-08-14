import { Button, Image, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import {
  BottomNav,
  ListingManageRow,
  PublishActionSheet,
  WechatContactSetupSheet,
  WechatQuickProfileSheet,
  type BottomNavTab,
} from '@/components/community'
import { backendEnabled, itemApi, updateProfileWithAvatar, userApi, type UserProfile } from '@/services/backend'
import { mapBackendItem, seedListings } from '@/services/market'
import type { Listing } from '@/types/market'
import avatarOrange from '@/assets/mock/avatar-orange.png'
import './index.scss'

const defaultProfile: UserProfile = {
  id: 'demo',
  nickname: '麦克斯',
  avatarUrl: avatarOrange,
  communityId: 'jinshui',
  communityName: '金水花园',
  building: '',
  verificationStatus: 'verified',
  hasWechat: false,
  hasPhone: false,
  phoneMasked: '',
  creditScore: 100,
  status: 'active',
}

const entries = [
  ['我发布的闲置', 'paper-plane'],
  ['浏览记录', 'clock'],
  ['帮助与反馈', 'question'],
  ['社区规则', 'document'],
  ['关于我们', 'info'],
]

export default function MinePage() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [showProfileSheet, setShowProfileSheet] = useState(false)
  const [showContactSheet, setShowContactSheet] = useState(false)
  const [showPublishSheet, setShowPublishSheet] = useState(false)
  const [profileAvatar, setProfileAvatar] = useState(defaultProfile.avatarUrl)
  const [profileNickname, setProfileNickname] = useState(defaultProfile.nickname)
  const [wechatId, setWechatId] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingContact, setSavingContact] = useState(false)
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [soldIds, setSoldIds] = useState<string[]>(() => Taro.getStorageSync<string[]>('community_sold_ids') || [])
  const [remoteListings, setRemoteListings] = useState<Listing[]>([])

  const listings = useMemo<Listing[]>(() => {
    if (backendEnabled) return remoteListings
    return ['airpods-07', 'bag-08', 'bicycle-09']
      .map((id) => seedListings.find((item) => item.id === id))
      .filter((item): item is Listing => Boolean(item))
  }, [remoteListings])

  function changeNavigation(key: BottomNavTab) {
    if (key === 'me') return
    const routes = {
      idle: '/pages/home/index',
      wanted: '/pages/want/index',
      messages: '/pages/messages/index',
    } as const
    Taro.reLaunch({ url: routes[key] })
  }

  useEffect(() => {
    if (!backendEnabled) return
    Promise.all([userApi.me(), itemApi.my()])
      .then(([result, itemResult]) => {
        setProfile(result)
        setProfileAvatar(result.avatarUrl || avatarOrange)
        setProfileNickname(result.nickname)
        setRemoteListings(itemResult.list.map(mapBackendItem))
      })
      .catch((error) => Taro.showToast({ title: error.message || '资料加载失败', icon: 'none' }))
  }, [])

  async function completeProfile() {
    if (!profileNickname.trim()) {
      Taro.showToast({ title: '请先填写昵称', icon: 'none' })
      return
    }
    setSavingProfile(true)
    try {
      const result = backendEnabled
        ? await updateProfileWithAvatar({ avatarUrl: profileAvatar, nickname: profileNickname.trim() })
        : { ...profile, avatarUrl: profileAvatar, nickname: profileNickname.trim() }
      setProfile(result)
      setShowProfileSheet(false)
      Taro.showToast({ title: '资料已更新', icon: 'success' })
    } catch (error: any) {
      Taro.showToast({ title: error.message || '资料保存失败', icon: 'none' })
    } finally {
      setSavingProfile(false)
    }
  }

  async function receivePhoneCode(code: string) {
    setPhoneLoading(true)
    try {
      const result = backendEnabled ? await userApi.setPhone(code) : { ...profile, hasPhone: true, phoneMasked: '138 **** 5678' }
      setProfile(result)
      Taro.showToast({ title: '手机号已授权', icon: 'success' })
    } catch (error: any) {
      Taro.showToast({ title: error.message || '手机号授权失败', icon: 'none' })
    } finally {
      setPhoneLoading(false)
    }
  }

  async function saveWechat() {
    if (!wechatId.trim() && !profile.hasPhone) {
      Taro.showToast({ title: '请授权手机号或填写微信号', icon: 'none' })
      return
    }
    setSavingContact(true)
    try {
      if (wechatId.trim()) {
        if (backendEnabled) await userApi.setWechat(wechatId.trim())
        setProfile((current) => ({ ...current, hasWechat: true }))
      }
      setShowContactSheet(false)
      Taro.showToast({ title: '联系方式已保存', icon: 'success' })
    } catch (error: any) {
      Taro.showToast({ title: error.message || '保存失败', icon: 'none' })
    } finally {
      setSavingContact(false)
    }
  }

  async function markSold(id: string) {
    const listing = listings.find((item) => item.id === id)
    if (!listing || soldIds.includes(id) || listing.status === '已售出') return
    const confirmation = await Taro.showModal({ title: '标记已出？', content: '标记后会从闲置首页隐藏，之后仍可在我的页面查看。', confirmText: '确认标记' })
    if (!confirmation.confirm) return
    try {
      if (backendEnabled) await itemApi.update(id, { status: 'sold' })
      setSoldIds((current) => {
        const next = current.includes(id) ? current : [...current, id]
        if (!backendEnabled) Taro.setStorageSync('community_sold_ids', next)
        return next
      })
      Taro.showToast({ title: '已标记已出', icon: 'success' })
    } catch (error: any) {
      Taro.showToast({ title: error.message || '标记失败', icon: 'none' })
    }
  }

  return (
    <View className='mine-page'>
      <View className='mine-topbar'><Text className='mine-topbar-icon'>⌾</Text><Text className='mine-topbar-icon'>▢</Text></View>
      <View className='mine-profile-card'>
        <Image className='mine-avatar' src={profile.avatarUrl || avatarOrange} mode='aspectFill' onClick={() => setShowProfileSheet(true)} />
        <View className='mine-profile-copy' onClick={() => setShowProfileSheet(true)}>
          <Text className='mine-name'>{profile.nickname}</Text>
          <Text className='mine-community'>{profile.communityName || '金水花园'}</Text>
          <Text className='mine-trust'>诚信交易 · 友善社区</Text>
        </View>
        <Text className='mine-contact-entry' onClick={() => setShowContactSheet(true)}>⌕ 联系方式设置 ›</Text>
      </View>
      <View className='mine-stats'>
        <Stat value='3' label='在售' icon='store' />
        <Stat value='7' label='已出' icon='check' />
        <Stat value='28' label='收藏' icon='star' />
      </View>
      <View className='mine-selling-card'>
        <View className='mine-section-heading'><Text>我的在售（{listings.filter((item) => !soldIds.includes(item.id) && item.status !== '已售出').length}）</Text><Text className='mine-manage-link'>管理在售 ›</Text></View>
        {listings.map((item) => (
          <ListingManageRow
            key={item.id}
            id={item.id}
            image={item.image}
            title={item.title}
            price={item.price}
            views={item.views}
            favorites={item.favorites}
            updatedAtText={item.updatedAtText}
            sold={soldIds.includes(item.id) || item.status === '已售出'}
            onOpen={(id) => Taro.navigateTo({ url: `/pages/detail/index?id=${id}` })}
            onMarkSold={(id) => { void markSold(id) }}
          />
        ))}
      </View>
      <View className='mine-menu-card'>
        {entries.map(([label, icon]) => <View className='mine-menu-row' key={label} onClick={() => Taro.showToast({ title: `${label}即将开放`, icon: 'none' })}><Text className={`mine-menu-icon mine-menu-icon-${icon}`} /> <Text>{label}</Text><Text className='mine-menu-arrow'>›</Text></View>)}
      </View>
      <BottomNav active='me' onChange={changeNavigation} onPublish={() => setShowPublishSheet(true)} />
      <PublishActionSheet
        open={showPublishSheet}
        onClose={() => setShowPublishSheet(false)}
        onPublishProduct={() => Taro.navigateTo({ url: '/pages/publish/index' })}
        onPublishWanted={() => Taro.navigateTo({ url: '/pages/request-publish/index' })}
      />
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
      <WechatContactSetupSheet
        open={showContactSheet}
        phoneMasked={profile.phoneMasked}
        phoneVerified={Boolean(profile.hasPhone)}
        wechatId={wechatId}
        phoneLoading={phoneLoading}
        saving={savingContact}
        onPhoneCode={(code) => { void receivePhoneCode(code) }}
        onWechatIdChange={setWechatId}
        onSave={() => { void saveWechat() }}
        onClose={() => setShowContactSheet(false)}
      />
    </View>
  )
}

function Stat({ value, label, icon }: { value: string; label: string; icon: string }) {
  return <View className='mine-stat'><Text className={`mine-stat-icon mine-stat-icon-${icon}`} /> <Text className='mine-stat-value'>{label} {value}</Text></View>
}
