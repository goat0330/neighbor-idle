import { Button, Text, View } from '@tarojs/components'
import WechatAvatarPicker from '../WechatAvatarPicker'
import WechatNicknameInput from '../WechatNicknameInput'
import { useSheetMotion } from '../useSheetMotion'
import './index.scss'

export type WechatQuickProfileSheetProps = {
  open: boolean
  avatarUrl?: string
  nickname: string
  saving?: boolean
  onChooseAvatar: (tempAvatarUrl: string) => void
  onNicknameChange: (value: string) => void
  onComplete: () => void
  onClose: () => void
}

export default function WechatQuickProfileSheet({
  open,
  avatarUrl,
  nickname,
  saving = false,
  onChooseAvatar,
  onNicknameChange,
  onComplete,
  onClose,
}: WechatQuickProfileSheetProps) {
  const { rendered, entered } = useSheetMotion(open)
  if (!rendered) return null

  return (
    <View className={`wechat-quick-profile-sheet ${entered ? 'wechat-quick-profile-sheet--entered' : ''}`}>
      <View className='wechat-quick-profile-sheet__overlay' onClick={onClose} />
      <View className='wechat-quick-profile-sheet__panel' onClick={(event) => event.stopPropagation()}>
        <View className='wechat-quick-profile-sheet__handle' />
        <Text className='wechat-quick-profile-sheet__title'>完善一下资料</Text>
        <Text className='wechat-quick-profile-sheet__subtitle'>发布和聊天时使用，之后也可以再修改</Text>
        <View className='wechat-quick-profile-sheet__avatar'>
          <WechatAvatarPicker avatarUrl={avatarUrl} onChooseAvatar={onChooseAvatar} />
        </View>
        <WechatNicknameInput value={nickname} onChange={onNicknameChange} />
        <Button className='wechat-quick-profile-sheet__submit' loading={saving} disabled={saving} onClick={onComplete}>
          {saving ? '保存中...' : '继续'}
        </Button>
      </View>
    </View>
  )
}
