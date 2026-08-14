import { Text, View } from '@tarojs/components'
import './index.scss'

export type ContactExchangeSheetProps = {
  open: boolean
  counterpartName: string
  wechatMasked?: string
  phoneMasked?: string
  onReject: () => void
  onApprove: () => void
  onClose: () => void
}

export default function ContactExchangeSheet({
  open,
  counterpartName,
  wechatMasked = '已保存',
  phoneMasked = '未填写',
  onReject,
  onApprove,
  onClose,
}: ContactExchangeSheetProps) {
  if (!open) return null

  return (
    <View className='contact-exchange-sheet'>
      <View className='contact-exchange-sheet__overlay' onClick={onClose} />
      <View className='contact-exchange-sheet__panel' onClick={(event) => event.stopPropagation()}>
        <View className='contact-exchange-sheet__handle' />
        <View className='contact-exchange-sheet__heading'>
          <View className='contact-exchange-sheet__emblem'><Text>✓</Text></View>
          <Text className='contact-exchange-sheet__title'>申请交换联系方式</Text>
        </View>
        <Text className='contact-exchange-sheet__desc'>
          {counterpartName} 希望与你交换联系方式，以便更方便地沟通交易细节。{`\n`}同意后，你保存的微信号或手机号将展示给对方。
        </Text>
        <View className='contact-exchange-sheet__preview'>
          <View className='contact-exchange-sheet__preview-row'>
            <Text className='contact-exchange-sheet__label'>微信号</Text>
            <Text className='contact-exchange-sheet__value'>{wechatMasked}</Text>
          </View>
          <View className='contact-exchange-sheet__preview-row'>
            <Text className='contact-exchange-sheet__label'>手机号</Text>
            <Text className='contact-exchange-sheet__value'>{phoneMasked}</Text>
          </View>
        </View>
        <Text className='contact-exchange-sheet__hint'>联系方式仅用于本次交易，不会泄露给第三方</Text>
        <View className='contact-exchange-sheet__actions'>
          <View className='contact-exchange-sheet__button contact-exchange-sheet__button--secondary' onClick={onReject}>
            <Text>暂不同意</Text>
          </View>
          <View className='contact-exchange-sheet__button contact-exchange-sheet__button--primary' onClick={onApprove}>
            <Text>同意交换</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
