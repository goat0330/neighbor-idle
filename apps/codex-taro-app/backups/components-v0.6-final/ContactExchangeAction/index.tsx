import { Text, View } from '@tarojs/components'
import './index.scss'

export type ContactExchangeStatus = 'available' | 'pending' | 'approved'

export type ContactExchangeActionProps = {
  status: ContactExchangeStatus
  onRequest?: () => void
}

const STATUS_LABELS: Record<ContactExchangeStatus, string> = {
  available: '申请交换联系方式',
  pending: '已申请，等待确认',
  approved: '已交换联系方式',
}

export default function ContactExchangeAction({ status, onRequest }: ContactExchangeActionProps) {
  return (
    <View
      className={`contact-exchange-action contact-exchange-action--${status}`}
      onClick={() => {
        if (status === 'available') onRequest?.()
      }}
    >
      <Text>{STATUS_LABELS[status]}</Text>
    </View>
  )
}
