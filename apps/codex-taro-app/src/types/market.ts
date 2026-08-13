export type ListingStatus = '在售' | '已约定' | '已售出'

export type Listing = {
  id: string
  title: string
  price: number
  originalPrice?: number
  image: string
  category: string
  condition: string
  community: string
  location: string
  latitude: number
  longitude: number
  distanceKm?: number
  seller: string
  sellerCredit: number
  status: ListingStatus
  description: string
}

export type WantPost = {
  id: string
  title: string
  budget: string
  category: string
  community: string
  description: string
  author: string
}

export type Conversation = {
  id: string
  title: string
  peer: string
  preview: string
  unread: number
  listingId: string
}

