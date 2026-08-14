import { APP_CONFIG } from '@config/index'
import { cloud } from './cloud'

export const backendEnabled = Boolean(APP_CONFIG.CLOUD_ENV)

export type UserProfile = {
  id: string
  nickname: string
  avatarUrl: string
  communityId: string
  communityName: string
  building: string
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected'
  hasWechat: boolean
  hasPhone?: boolean
  phoneMasked?: string
  creditScore: number
  status: string
}

export type ConversationSummary = {
  id: string
  itemId: string
  itemTitle: string
  itemImage: string
  peerName: string
  peerAvatar: string
  role: 'buyer' | 'seller'
  lastMessage: string
  lastMessageAt: number
  unread: number
  status: string
}

export type ConversationMessage = {
  id: string
  side: 'mine' | 'peer'
  type: 'text' | 'system'
  text: string
  read: boolean
  createdAt: number
}

export const userApi = {
  me: () => cloud.call<UserProfile>('user', 'me'),
  updateProfile: (data: { nickname?: string; avatarUrl?: string }) => cloud.call<UserProfile>('user', 'updateProfile', data),
  setWechat: (wechatId: string) => cloud.call<{ hasWechat: boolean }>('user', 'setWechat', { wechatId }),
  setPhone: (code: string) => cloud.call<UserProfile>('user', 'setPhone', { code }),
  bindCommunity: (data: { communityId: string; communityName: string; building?: string }) => cloud.call<UserProfile>('user', 'bindCommunity', data),
}

export const conversationApi = {
  open: (itemId: string) => cloud.call<ConversationSummary>('conversation', 'open', { itemId }),
  detail: (conversationId: string) => cloud.call<ConversationSummary>('conversation', 'detail', { conversationId }),
  list: () => cloud.call<{ list: ConversationSummary[]; hasMore: boolean }>('conversation', 'list'),
  messages: (conversationId: string) => cloud.call<{ list: ConversationMessage[]; hasMore: boolean }>('conversation', 'messages', { conversationId }),
  send: (conversationId: string, content: string) => cloud.call<ConversationMessage>('conversation', 'send', { conversationId, content }),
  markRead: (conversationId: string) => cloud.call<{ conversationId: string }>('conversation', 'markRead', { conversationId }),
  unread: () => cloud.call<{ count: number }>('conversation', 'unread'),
}
