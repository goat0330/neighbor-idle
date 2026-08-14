import { Input, Text, View } from '@tarojs/components'
import './index.scss'

export type WechatIdInputProps = {
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

export default function WechatIdInput({
  value,
  placeholder = '填写微信号（选填）',
  onChange,
}: WechatIdInputProps) {
  return (
    <View className='wechat-id-input'>
      <View className='wechat-id-input__row'>
        <Text className='wechat-id-input__label'>微信号</Text>
        <Input
          className='wechat-id-input__field'
          type='text'
          value={value}
          placeholder={placeholder}
          maxlength={20}
          onInput={(event) => onChange(event.detail.value)}
        />
      </View>
      <Text className='wechat-id-input__hint'>用于双方同意交换联系方式后展示</Text>
    </View>
  )
}
