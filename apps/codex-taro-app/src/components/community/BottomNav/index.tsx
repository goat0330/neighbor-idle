import { Image, Text, View } from '@tarojs/components'
import PublishFAB from '../PublishFAB'
import shoppingBagIcon from '@/assets/icons/shopping-bag.svg'
import shoppingBagActiveIcon from '@/assets/icons/shopping-bag-active.svg'
import searchIcon from '@/assets/icons/search.svg'
import searchActiveIcon from '@/assets/icons/search-active.svg'
import messageIcon from '@/assets/icons/message-circle.svg'
import messageActiveIcon from '@/assets/icons/message-circle-active.svg'
import userIcon from '@/assets/icons/user-round.svg'
import userActiveIcon from '@/assets/icons/user-round-active.svg'
import './index.scss'

export type TabKey = 'idle' | 'wanted' | 'publish' | 'messages' | 'me'
export type BottomNavTab = Exclude<TabKey, 'publish'>

export type BottomNavProps = {
  active: BottomNavTab
  onChange: (key: BottomNavTab) => void
  onPublish: () => void
}

const navIcons: Record<BottomNavTab, { normal: string; active: string }> = {
  idle: { normal: shoppingBagIcon, active: shoppingBagActiveIcon },
  wanted: { normal: searchIcon, active: searchActiveIcon },
  messages: { normal: messageIcon, active: messageActiveIcon },
  me: { normal: userIcon, active: userActiveIcon },
}

type NavItemProps = {
  label: string
  icon: BottomNavTab
  active: boolean
  onClick: () => void
}

export default function BottomNav({ active, onChange, onPublish }: BottomNavProps) {
  return (
    <View className='bottom-nav'>
      <View className='bottom-nav-inner'>
        <NavItem label='闲置' icon='idle' active={active === 'idle'} onClick={() => onChange('idle')} />
        <NavItem label='求购' icon='wanted' active={active === 'wanted'} onClick={() => onChange('wanted')} />
        <PublishFAB onClick={onPublish} />
        <NavItem label='消息' icon='messages' active={active === 'messages'} onClick={() => onChange('messages')} />
        <NavItem label='我的' icon='me' active={active === 'me'} onClick={() => onChange('me')} />
      </View>
    </View>
  )
}

function NavItem({ label, icon, active, onClick }: NavItemProps) {
  return (
    <View className={`bottom-nav-item ${active ? 'bottom-nav-item-active' : ''}`} onClick={onClick}>
      <Image className='bottom-nav-icon' src={navIcons[icon][active ? 'active' : 'normal']} mode='aspectFit' />
      <Text className='bottom-nav-label'>{label}</Text>
    </View>
  )
}
