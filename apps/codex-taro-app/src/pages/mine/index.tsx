import { Button, Image, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import {
  BottomNav,
  ListingManageRow,
  PublishActionSheet,
  WechatContactSetupSheet,
  WechatQuickProfileSheet,
  type BottomNavTab,
} from '@/components/community'
import { backendEnabled, favoriteApi, itemApi, updateProfileWithAvatar, userApi, type UserProfile } from '@/services/backend'
import { mapBackendItem, seedListings } from '@/services/market'
import type { Listing } from '@/types/market'
import avatarOrange from '@/assets/mock/avatar-orange.png'
import phoneIcon from '@/assets/icons/phone.svg'
import storeIcon from '@/assets/icons/store-active.svg'
import checkIcon from '@/assets/icons/circle-check-active.svg'
import starIcon from '@/assets/icons/star-active.svg'
import helpIcon from '@/assets/icons/circle-help.svg'
import fileTextIcon from '@/assets/icons/file-text.svg'
import infoIcon from '@/assets/icons/info.svg'
import chevronRightIcon from '@/assets/icons/chevron-right.svg'
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
  { label: '帮助与反馈', icon: helpIcon },
  { label: '社区规则', icon: fileTextIcon },
  { label: '关于我们', icon: infoIcon },
]

type MineStats = {
  onSale: number
  sold: number
  favorites: number
}

const demoOwnedIds = ['airpods-07', 'bag-08', 'bicycle-09']

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
  const [listingFilter, setListingFilter] = useState<'all' | 'onSale' | 'sold'>('all')
  const [stats, setStats] = useState<MineStats>(() => {
    const localSoldIds = Taro.getStorageSync<string[]>('community_sold_ids') || []
    const localFavoriteIds = Taro.getStorageSync<string[]>('community_favorite_ids') || []
    const soldCount = demoOwnedIds.filter((id) => localSoldIds.includes(id)).length
    return { onSale: demoOwnedIds.length - soldCount, sold: soldCount, favorites: localFavoriteIds.length }
  })

  const listings = useMemo<Listing[]>(() => {
    if (backendEnabled) return remoteListings
    return ['airpods-07', 'bag-08', 'bicycle-09']
      .map((id) => seedListings.find((item) => item.id === id))
      .filter((item): item is Listing => Boolean(item))
  }, [remoteListings])

  const visibleListings = useMemo(() => {
    if (listingFilter === 'onSale') return listings.filter((item) => !isSoldListing(item))
    if (listingFilter === 'sold') return listings.filter((item) => isSoldListing(item))
    return listings
  }, [listingFilter, listings, soldIds])

  function changeNavigation(key: BottomNavTab) {
    if (key === 'me') return
    const routes = {
      idle: '/pages/home/index',
      wanted: '/pages/want/index',
      messages: '/pages/messages/index',
    } as const
    Taro.reLaunch({ url: routes[key] })
  }

  useDidShow(() => {
    if (!backendEnabled) return
    Promise.all([userApi.me(), itemApi.my()])
      .then(async ([result, itemResult]) => {
        const favoriteResult = await favoriteApi.stats()
        setProfile(result)
        setProfileAvatar(result.avatarUrl || avatarOrange)
        setProfileNickname(result.nickname)
        setRemoteListings(itemResult.list.map(mapBackendItem))
        setStats({
          onSale: itemResult.stats?.onSale ?? itemResult.list.filter((item) => item.status === 'on_sale').length,
          sold: itemResult.stats?.sold ?? itemResult.list.filter((item) => item.status === 'sold').length,
          favorites: favoriteResult.count,
        })
      })
      .catch((error) => Taro.showToast({ title: error.message || '资料加载失败', icon: 'none' }))
  })

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

  function isSoldListing(item: Listing) {
    return backendEnabled ? item.status === '已售出' : soldIds.includes(item.id) || item.status === '已售出'
  }

  async function toggleSold(id: string) {
    const listing = listings.find((item) => item.id === id)
    if (!listing) return
    const sold = isSoldListing(listing)
    const confirmation = await Taro.showModal({
      title: sold ? '取消标记？' : '标记已出？',
      content: sold ? '取消后商品会重新回到闲置首页。' : '标记后商品会从闲置首页下架，但仍保留在我的页面，可随时取消标记。',
      confirmText: sold ? '确认取消' : '确认标记',
    })
    if (!confirmation.confirm) return
    try {
      if (backendEnabled) {
        await itemApi.update(id, { status: sold ? 'on_sale' : 'sold' })
        setRemoteListings((current) => current.map((item) => item.id === id ? { ...item, status: sold ? '在售' : '已售出' } : item))
      } else {
        setSoldIds((current) => {
          const next = sold ? current.filter((itemId) => itemId !== id) : Array.from(new Set([...current, id]))
          Taro.setStorageSync('community_sold_ids', next)
          return next
        })
      }
      setStats((current) => ({
        ...current,
        onSale: current.onSale + (sold ? 1 : -1),
        sold: current.sold + (sold ? -1 : 1),
      }))
      Taro.showToast({ title: sold ? '已取消标记，商品已重新上架' : '已标记已出，商品已下架', icon: 'success' })
    } catch (error: any) {
      Taro.showToast({ title: error.message || (sold ? '取消标记失败' : '标记失败'), icon: 'none' })
    }
  }

  return (
    <View className='mine-page'>
      <View className='mine-profile-card'>
        <Image className='mine-avatar' src={profile.avatarUrl || avatarOrange} mode='aspectFill' onClick={() => setShowProfileSheet(true)} />
        <View className='mine-profile-copy' onClick={() => setShowProfileSheet(true)}>
          <Text className='mine-name'>{profile.nickname}</Text>
          <Text className='mine-community'>{profile.communityName || '金水花园'}</Text>
          <Text className='mine-trust'>诚信交易 · 友善社区</Text>
        </View>
        <View className='mine-contact-entry' onClick={() => setShowContactSheet(true)}>
          <Image className='mine-contact-icon' src={phoneIcon} mode='aspectFit' />
          <Text className='mine-contact-label'>联系方式设置</Text>
          <Image className='mine-contact-arrow' src={chevronRightIcon} mode='aspectFit' />
        </View>
      </View>
      <View className='mine-stats'>
        <Stat value={String(stats.onSale)} label='在售' icon={storeIcon} onClick={() => setListingFilter('onSale')} />
        <Stat value={String(stats.sold)} label='已出' icon={checkIcon} onClick={() => setListingFilter('sold')} />
        <Stat value={String(stats.favorites)} label='收藏' icon={starIcon} onClick={() => Taro.navigateTo({ url: '/pages/favorites/index' })} />
      </View>
      <View className='mine-selling-card'>
        <View className='mine-section-heading'><Text>{listingFilter === 'sold' ? '已出物品' : '我的在售'}（{visibleListings.length}）</Text><Text className='mine-manage-link' onClick={() => setListingFilter('onSale')}>管理在售 ›</Text></View>
        {visibleListings.map((item) => (
          <ListingManageRow
            key={item.id}
            id={item.id}
            image={item.image}
            title={item.title}
            price={item.price}
            views={item.views}
            favorites={item.favorites}
            updatedAtText={item.updatedAtText}
            sold={isSoldListing(item)}
            onOpen={(id) => Taro.navigateTo({ url: `/pages/detail/index?id=${id}` })}
            onMarkSold={(id) => { void toggleSold(id) }}
          />
        ))}
        {!visibleListings.length && <View className='mine-empty'><Text>{listingFilter === 'sold' ? '暂无已出物品' : '暂无在售物品'}</Text></View>}
      </View>
      <View className='mine-menu-card'>
        {entries.map(({ label, icon }) => <View className='mine-menu-row' key={label} onClick={() => Taro.showToast({ title: `${label}即将开放`, icon: 'none' })}><Image className='mine-menu-icon' src={icon} mode='aspectFit' /> <Text>{label}</Text><Image className='mine-menu-arrow' src={chevronRightIcon} mode='aspectFit' /></View>)}
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

function Stat({ value, label, icon, onClick }: { value: string; label: string; icon: string; onClick?: () => void }) {
  return <View className='mine-stat' onClick={onClick}><Image className='mine-stat-icon' src={icon} mode='aspectFit' /> <Text className='mine-stat-value'>{label} {value}</Text></View>
}
