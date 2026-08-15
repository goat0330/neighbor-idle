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
  itemPrice?: number
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

export type BackendItem = {
  _id?: string
  id?: string
  title: string
  desc?: string
  images?: string[]
  price: number
  originalPrice?: number
  category: string
  condition?: string
  communityId?: string
  communityName?: string
  geoCircleId?: string
  geoCircleName?: string
  distance?: string | number
  locationLabel?: string
  location?: string
  latitude?: number | null
  longitude?: number | null
  status: string
  views?: number
  favoritesCount?: number
  createdAt?: number
  updatedAt?: number
  seller?: {
    nickname?: string
    avatarUrl?: string
    communityName?: string
    building?: string
    creditScore?: number
  }
}

export type BackendWant = {
  _id?: string
  id?: string
  title: string
  desc?: string
  category: string
  priceRange?: string
  status?: string
  createdAt?: number
  updatedAt?: number
  publisher?: {
    nickname?: string
    avatarUrl?: string
    communityName?: string
  }
}

export type ItemCreateInput = {
  title: string
  desc?: string
  images: string[]
  price: number
  originalPrice?: number
  condition?: string
  category: string
  communityId?: string
  communityName?: string
  geoCircleId?: string
  geoCircleName?: string
  location?: string
  latitude?: number
  longitude?: number
  free?: boolean
}

export type WantCreateInput = {
  title: string
  desc?: string
  category: string
  priceRange?: string
}

export const userApi = {
  me: () => cloud.call<UserProfile>('user', 'me'),
  updateProfile: (data: { nickname?: string; avatarUrl?: string }) => cloud.call<UserProfile>('user', 'updateProfile', data),
  setWechat: (wechatId: string) => cloud.call<{ hasWechat: boolean }>('user', 'setWechat', { wechatId }),
  setPhone: (code: string) => cloud.call<UserProfile>('user', 'setPhone', { code }),
  bindCommunity: (data: { communityId: string; communityName: string; building?: string }) => cloud.call<UserProfile>('user', 'bindCommunity', data),
}

export async function updateProfileWithAvatar(data: { nickname?: string; avatarUrl?: string }) {
  const payload: { nickname?: string; avatarUrl?: string } = { nickname: data.nickname }
  const avatarUrl = data.avatarUrl || ''
  if (/^(cloud:\/\/|https:\/\/)/.test(avatarUrl)) {
    payload.avatarUrl = avatarUrl
  } else if (/^(wxfile:\/\/|tmp\/|tmp_)/.test(avatarUrl)) {
    const [uploaded] = await cloud.uploadImages([avatarUrl], 'avatars')
    payload.avatarUrl = uploaded
  }
  return userApi.updateProfile(payload)
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

export const itemApi = {
  list: (data: { page?: number; pageSize?: number; category?: string } = {}) =>
    cloud.call<{ list: BackendItem[]; page: number; hasMore: boolean }>('item', 'list', data),
  search: (data: { keyword: string; page?: number; pageSize?: number }) =>
    cloud.call<{ list: BackendItem[]; page: number; hasMore: boolean }>('item', 'search', data),
  detail: (id: string) => cloud.call<{ item: BackendItem; isFavorite: boolean; isMine: boolean }>('item', 'detail', { id }),
  create: (data: ItemCreateInput) => cloud.call<{ id: string; status: string; needAudit: boolean }>('item', 'create', data),
  update: (id: string, data: Partial<ItemCreateInput> & { status?: string }) => cloud.call<{ id: string }>('item', 'update', { id, ...data }),
  my: (data: { page?: number; pageSize?: number } = {}) =>
    cloud.call<{ list: BackendItem[]; page: number; hasMore: boolean; stats: { onSale: number; sold: number } }>('item', 'my', data),
}

export const wantApi = {
  list: (data: { page?: number; pageSize?: number; category?: string } = {}) =>
    cloud.call<{ list: BackendWant[]; page: number; hasMore: boolean }>('want', 'list', data),
  create: (data: WantCreateInput) => cloud.call<{ id: string }>('want', 'create', data),
  my: () => cloud.call<{ list: BackendWant[] }>('want', 'my'),
  close: (id: string) => cloud.call<{ id: string }>('want', 'close', { id }),
}

export const favoriteApi = {
  toggle: (itemId: string) => cloud.call<{ favorited: boolean }>('favorite', 'toggle', { itemId }),
  list: (data: { page?: number; pageSize?: number } = {}) =>
    cloud.call<{ list: BackendItem[]; page: number; hasMore: boolean }>('favorite', 'list', data),
  stats: () => cloud.call<{ count: number }>('favorite', 'stats'),
}
