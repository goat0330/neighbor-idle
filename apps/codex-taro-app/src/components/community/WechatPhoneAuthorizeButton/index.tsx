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
  const isWechatMiniProgram = process.env.TARO_ENV === 'weapp'

  const handlePhoneNumber = (event: { detail?: { code?: string; errMsg?: string } }) => {
    const code = event.detail?.code
    if (typeof code === 'string' && code) {
      // The code is intentionally forwarded immediately. It is one-time data
      // and must not be persisted or sent through a normal profile API.
      onPhoneCode(code)
      return
    }
    onError?.(event.detail?.errMsg || '未能获取手机号，请在微信小程序中重试')
  }

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
        isWechatMiniProgram ? (
          <Button
            className='wechat-phone-authorize-button__action'
            openType='getPhoneNumber'
            loading={loading}
            disabled={buttonDisabled}
            onGetPhoneNumber={handlePhoneNumber}
          >
            {loading ? '正在获取...' : '使用微信绑定手机号'}
          </Button>
        ) : (
          <View className='wechat-phone-authorize-button__unavailable'>
            请在微信小程序中点击授权手机号
          </View>
        )
      )}
    </View>
  )
}
