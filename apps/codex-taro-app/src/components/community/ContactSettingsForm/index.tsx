import { Button, Text, View } from '@tarojs/components'
import WechatIdInput from '../WechatIdInput'
import WechatPhoneAuthorizeButton from '../WechatPhoneAuthorizeButton'
import type { PreferredContact } from '../contactTypes'
import './index.scss'

export type ContactSettingsFormProps = {
  phoneMasked?: string
  phoneVerified: boolean
  wechatId: string
  preferredContact?: PreferredContact
  saving?: boolean
  onWechatIdChange: (value: string) => void
  onPreferredContactChange: (value: PreferredContact) => void
  onRequestPhone: (code: string) => void
  onSave: () => void
}

export default function ContactSettingsForm({
  phoneMasked,
  phoneVerified,
  wechatId,
  preferredContact,
  saving = false,
  onWechatIdChange,
  onPreferredContactChange,
  onRequestPhone,
  onSave,
}: ContactSettingsFormProps) {
  const selectedContact = preferredContact || 'phone'

  return (
    <View className='contact-settings-form'>
      <View className='contact-settings-form__heading'>
        <Text className='contact-settings-form__title'>联系方式设置</Text>
        <Text className='contact-settings-form__subtitle'>手机号默认优先，微信号可作为补充</Text>
      </View>

      <WechatPhoneAuthorizeButton
        phoneMasked={phoneMasked}
        verified={phoneVerified}
        onPhoneCode={onRequestPhone}
      />

      <WechatIdInput value={wechatId} onChange={onWechatIdChange} />

      <View className='contact-settings-form__preference'>
        <Text className='contact-settings-form__preference-label'>优先联系方式</Text>
        <View className='contact-settings-form__options'>
          {(['phone', 'wechat'] as const).map((contact) => (
            <View
              key={contact}
              className={`contact-settings-form__option ${selectedContact === contact ? 'contact-settings-form__option--selected' : ''}`}
              onClick={() => onPreferredContactChange(contact)}
            >
              <Text className='contact-settings-form__radio'>{selectedContact === contact ? '●' : '○'}</Text>
              <Text>{contact === 'phone' ? '手机号' : '微信号'}</Text>
            </View>
          ))}
        </View>
      </View>

      <Button
        className='contact-settings-form__save'
        loading={saving}
        disabled={saving}
        onClick={onSave}
      >
        {saving ? '保存中...' : '保存'}
      </Button>
    </View>
  )
}
