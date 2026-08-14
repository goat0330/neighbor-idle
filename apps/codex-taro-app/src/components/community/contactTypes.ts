export type PreferredContact = 'wechat' | 'phone'

export type ContactCardData = {
  wechatId?: string
  phone?: string
}

export type UserProfileDTO = {
  id: string
  nickname?: string
  avatarUrl?: string
  phoneMasked?: string
  phoneVerified: boolean
  wechatId?: string
  preferredContact?: PreferredContact
}
