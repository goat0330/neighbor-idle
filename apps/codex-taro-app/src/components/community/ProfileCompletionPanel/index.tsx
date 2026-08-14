import { Button, Text, View } from '@tarojs/components'
import WechatAvatarPicker from '../WechatAvatarPicker'
import WechatIdInput from '../WechatIdInput'
import WechatNicknameInput from '../WechatNicknameInput'
import WechatPhoneAuthorizeButton from '../WechatPhoneAuthorizeButton'
import './index.scss'

export type ProfileCompletionPanelProps = {
  open: boolean
  avatarUrl?: string
  nickname: string
  phoneMasked?: string
  phoneVerified?: boolean
  wechatId: string
  avatarUploading?: boolean
  phoneLoading?: boolean
  completing?: boolean
  disabled?: boolean
  onChooseAvatar: (tempAvatarUrl: string) => void
  onNicknameChange: (value: string) => void
  onPhoneCode: (code: string) => void
  onWechatIdChange: (value: string) => void
  onComplete: () => void
  onPhoneError?: (message: string) => void
  onClose?: () => void
}

export default function ProfileCompletionPanel({
  open,
  avatarUrl,
  nickname,
  phoneMasked,
  phoneVerified = false,
  wechatId,
  avatarUploading = false,
  phoneLoading = false,
  completing = false,
  disabled = false,
  onChooseAvatar,
  onNicknameChange,
  onPhoneCode,
  onWechatIdChange,
  onComplete,
  onPhoneError,
  onClose,
}: ProfileCompletionPanelProps) {
  if (!open) return null

  const contentDisabled = disabled || completing

  return (
    <View className='profile-completion-panel'>
      <View className='profile-completion-panel__overlay' onClick={onClose} />
      <View className='profile-completion-panel__sheet' onClick={(event) => event.stopPropagation()}>
        <View className='profile-completion-panel__handle' />
        <View className='profile-completion-panel__heading'>
          <View>
            <Text className='profile-completion-panel__title'>完善资料</Text>
            <Text className='profile-completion-panel__subtitle'>需要交易时再填写，随时可以稍后补充</Text>
          </View>
          {onClose && <Text className='profile-completion-panel__close' onClick={onClose}>×</Text>}
        </View>

        <View className='profile-completion-panel__avatar'>
          <WechatAvatarPicker
            avatarUrl={avatarUrl}
            uploading={avatarUploading}
            disabled={contentDisabled}
            onChooseAvatar={onChooseAvatar}
          />
        </View>

        <WechatNicknameInput
          value={nickname}
          disabled={contentDisabled}
          onChange={onNicknameChange}
        />

        <WechatPhoneAuthorizeButton
          phoneMasked={phoneMasked}
          verified={phoneVerified}
          loading={phoneLoading}
          disabled={contentDisabled}
          onPhoneCode={onPhoneCode}
          onError={onPhoneError}
        />

        <WechatIdInput value={wechatId} onChange={onWechatIdChange} />

        <Button
          className='profile-completion-panel__complete'
          loading={completing}
          disabled={contentDisabled}
          onClick={onComplete}
        >
          {completing ? '保存中...' : '完成'}
        </Button>
      </View>
    </View>
  )
}
