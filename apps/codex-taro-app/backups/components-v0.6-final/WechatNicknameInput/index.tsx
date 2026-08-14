import { Input, Text, View } from '@tarojs/components'
import './index.scss'

export type WechatNicknameInputProps = {
  value: string
  placeholder?: string
  maxLength?: number
  disabled?: boolean
  onChange: (value: string) => void
}

export default function WechatNicknameInput({
  value,
  placeholder = '输入你的昵称',
  maxLength = 24,
  disabled = false,
  onChange,
}: WechatNicknameInputProps) {
  return (
    <View className={`wechat-nickname-input ${disabled ? 'wechat-nickname-input--disabled' : ''}`}>
      <Text className='wechat-nickname-input__label'>昵称</Text>
      <Input
        className='wechat-nickname-input__field'
        type='nickname'
        value={value}
        placeholder={placeholder}
        maxlength={maxLength}
        disabled={disabled}
        onInput={(event) => onChange(event.detail.value)}
      />
    </View>
  )
}
