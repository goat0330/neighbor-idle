import { Button, Image, Text, View } from '@tarojs/components'
import './index.scss'

export type WechatAvatarPickerProps = {
  avatarUrl?: string
  size?: number
  disabled?: boolean
  uploading?: boolean
  onChooseAvatar: (tempAvatarUrl: string) => void
}

const DEFAULT_AVATAR_SIZE = 112

export default function WechatAvatarPicker({
  avatarUrl,
  size = DEFAULT_AVATAR_SIZE,
  disabled = false,
  uploading = false,
  onChooseAvatar,
}: WechatAvatarPickerProps) {
  const pickerDisabled = disabled || uploading
  const avatarStyle = { width: `${size}rpx`, height: `${size}rpx` }

  return (
    <View className={`wechat-avatar-picker ${pickerDisabled ? 'wechat-avatar-picker--disabled' : ''}`}>
      <Button
        className='wechat-avatar-picker__button'
        openType='chooseAvatar'
        disabled={pickerDisabled}
        onChooseAvatar={(event) => {
          const tempAvatarUrl = event.detail?.avatarUrl
          if (typeof tempAvatarUrl === 'string' && tempAvatarUrl) onChooseAvatar(tempAvatarUrl)
        }}
      >
        <View className='wechat-avatar-picker__avatar' style={avatarStyle}>
          {avatarUrl
            ? <Image className='wechat-avatar-picker__image' src={avatarUrl} mode='aspectFill' />
            : <Text className='wechat-avatar-picker__placeholder'>头像</Text>}
          {uploading && (
            <View className='wechat-avatar-picker__loading'>
              <Text>处理中</Text>
            </View>
          )}
        </View>
      </Button>
      <Text className='wechat-avatar-picker__caption'>
        {uploading ? '处理中...' : avatarUrl ? '更换头像' : '点击选择头像'}
      </Text>
    </View>
  )
}
