import { Button, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import WechatIdInput from '../WechatIdInput'
import WechatPhoneAuthorizeButton from '../WechatPhoneAuthorizeButton'
import './index.scss'

export type WechatContactSetupSheetProps = {
  open: boolean
  phoneMasked?: string
  phoneVerified?: boolean
  wechatId: string
  saving?: boolean
  phoneLoading?: boolean
  onPhoneCode: (code: string) => void
  onPhoneError?: (message: string) => void
  onWechatIdChange: (value: string) => void
  onSave: () => void
  onClose: () => void
}

export default function WechatContactSetupSheet({
  open,
  phoneMasked,
  phoneVerified = false,
  wechatId,
  saving = false,
  phoneLoading = false,
  onPhoneCode,
  onPhoneError,
  onWechatIdChange,
  onSave,
  onClose,
}: WechatContactSetupSheetProps) {
  if (!open) return null

  return (
    <View className='wechat-contact-setup-sheet'>
      <View className='wechat-contact-setup-sheet__overlay' onClick={onClose} />
      <View className='wechat-contact-setup-sheet__panel' onClick={(event) => event.stopPropagation()}>
        <View className='wechat-contact-setup-sheet__handle' />
        <Text className='wechat-contact-setup-sheet__title'>交换联系方式</Text>
        <Text className='wechat-contact-setup-sheet__subtitle'>手机号优先，微信号选填；只有双方同意后才会展示</Text>
        <WechatPhoneAuthorizeButton
          phoneMasked={phoneMasked}
          verified={phoneVerified}
          loading={phoneLoading}
          disabled={saving}
          onPhoneCode={onPhoneCode}
          onError={(message) => {
            onPhoneError?.(message)
            if (!onPhoneError) Taro.showToast({ title: message, icon: 'none' })
          }}
        />
        <WechatIdInput value={wechatId} onChange={onWechatIdChange} />
        <Button className='wechat-contact-setup-sheet__submit' loading={saving} disabled={saving} onClick={onSave}>
          {saving ? '保存中...' : '保存并继续'}
        </Button>
      </View>
    </View>
  )
}
