import { Input, Text, View } from '@tarojs/components'
import ContactExchangeAction, { type ContactExchangeStatus } from '../ContactExchangeAction'
import './index.scss'

export type ChatComposerProps = {
  value: string
  placeholder?: string
  contactStatus?: ContactExchangeStatus
  onInput: (value: string) => void
  onSend: () => void
  onContactRequest?: () => void
}

export default function ChatComposer({
  value,
  placeholder = '输入消息…',
  contactStatus = 'available',
  onInput,
  onSend,
  onContactRequest,
}: ChatComposerProps) {
  return (
    <View className='chat-composer-r2'>
      <View className='chat-composer-r2__bar'>
        <Input
          className='chat-composer-r2__input'
          value={value}
          placeholder={placeholder}
          placeholderClass='chat-composer-r2__placeholder'
          onInput={(event) => onInput(event.detail.value)}
          confirmType='send'
          onConfirm={onSend}
        />
        <View className={`chat-composer-r2__send ${value.trim() ? 'is-enabled' : ''}`} onClick={onSend}>
          <Text>发送</Text>
        </View>
      </View>
      {onContactRequest && (
        <ContactExchangeAction status={contactStatus} onRequest={onContactRequest} />
      )}
    </View>
  )
}
