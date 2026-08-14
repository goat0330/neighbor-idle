import { Button, Text, View } from '@tarojs/components'
import './index.scss'

export type WechatPhoneAuthorizeButtonProps = {
  verified?: boolean
  phoneMasked?: string
  loading?: boolean
  disabled?: boolean
  onPhoneCode: (code: string) => void
  onError?: (message: string) => void
}

export default function WechatPhoneAuthorizeButton({
  verified = false,
  phoneMasked,
  loading = false,
  disabled = false,
  onPhoneCode,
  onError,
}: WechatPhoneAuthorizeButtonProps) {
  const buttonDisabled = disabled || loading

  return (
    <View className={`wechat-phone-authorize-button ${buttonDisabled ? 'wechat-phone-authorize-button--disabled' : ''}`}>
      <View className='wechat-phone-authorize-button__summary'>
        <View>
          <Text className='wechat-phone-authorize-button__label'>手机号</Text>
          <Text className='wechat-phone-authorize-button__value'>{phoneMasked || '尚未绑定'}</Text>
        </View>
        {verified && <Text className='wechat-phone-authorize-button__verified'>已验证</Text>}
      </View>
      {!verified && (
        <Button
          className='wechat-phone-authorize-button__action'
          openType='getPhoneNumber'
          loading={loading}
          disabled={buttonDisabled}
          onGetPhoneNumber={(event) => {
            const code = event.detail?.code
            if (typeof code === 'string' && code) {
              onPhoneCode(code)
              return
            }
            onError?.(event.detail?.errMsg || '未能获取手机号，请稍后重试')
          }}
        >
          {loading ? '正在获取...' : '使用微信绑定手机号'}
        </Button>
      )}
    </View>
  )
}
