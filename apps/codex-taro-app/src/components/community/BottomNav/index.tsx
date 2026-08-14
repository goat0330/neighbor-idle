import { Text, View } from '@tarojs/components'
import PublishFAB from '../PublishFAB'
import './index.scss'

export type TabKey = 'idle' | 'wanted' | 'publish' | 'messages' | 'me'
export type BottomNavTab = Exclude<TabKey, 'publish'>

export type BottomNavProps = {
  active: BottomNavTab
  onChange: (key: BottomNavTab) => void
  onPublish: () => void
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
      <View className={`bottom-nav-icon bottom-nav-icon-${icon}`} />
      <Text className='bottom-nav-label'>{label}</Text>
    </View>
  )
}
