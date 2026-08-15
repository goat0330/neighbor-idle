export type ListingStatus = '在售' | '已约定' | '已售出'

export type Listing = {
  id: string
  title: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  category: string
  condition: string
  community: string
  communityId?: string
  communityName?: string
  location: string
  latitude: number
  longitude: number
  distanceKm?: number
  geoCircleId?: string
  geoCircleName?: string
  distance?: string | number
  locationLabel?: string
  seller: string
  sellerAvatar?: string
  sellerCredit: number
  status: ListingStatus
  description: string
  views?: number
  favorites?: number
  updatedAtText?: string
}

export type WantPost = {
  id: string
  title: string
  budget: string
  category: string
  community: string
  description: string
  author: string
  authorAvatar?: string
  publishedAtText?: string
}

export type Conversation = {
  id: string
  title: string
  peer: string
  preview: string
  unread: number
  listingId: string
  itemImage?: string
  peerAvatar?: string
  lastMessageAt?: number
}
