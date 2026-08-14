import { Button, Text, View } from '@tarojs/components'
import type { ContactCardData } from '../contactTypes'
import './index.scss'

export type ContactCardProps = {
  data: ContactCardData
  showCopy?: boolean
  onCopyWechatId?: (wechatId: string) => void
  onCopyPhone?: (phone: string) => void
}

export default function ContactCard({
  data,
  showCopy = false,
  onCopyWechatId,
  onCopyPhone,
}: ContactCardProps) {
  const wechatId = data.wechatId
  const phone = data.phone

  if (!wechatId && !phone) return null

  return (
    <View className='contact-card'>
      {wechatId && (
        <View className='contact-card__row'>
          <Text className='contact-card__label'>微信号</Text>
          <Text className='contact-card__value'>{wechatId}</Text>
          {showCopy && onCopyWechatId && (
            <Button className='contact-card__copy' onClick={(event) => { event.stopPropagation(); onCopyWechatId(wechatId) }}>
              复制
            </Button>
          )}
        </View>
      )}
      {phone && (
        <View className='contact-card__row'>
          <Text className='contact-card__label'>手机号</Text>
          <Text className='contact-card__value'>{phone}</Text>
          {showCopy && onCopyPhone && (
            <Button className='contact-card__copy' onClick={(event) => { event.stopPropagation(); onCopyPhone(phone) }}>
              复制
            </Button>
          )}
        </View>
      )}
    </View>
  )
}
