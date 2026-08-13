import { Conversation, Listing, WantPost } from '@/types/market'

export const seedListings: Listing[] = [
  {
    id: 'desk-01',
    title: '原木色书桌，搬家低价出',
    price: 80,
    originalPrice: 399,
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6b7?auto=format&fit=crop&w=900&q=80',
    category: '家具家电',
    condition: '9成新',
    community: '云杉里小区',
    location: '3号楼附近自提',
    latitude: 31.2304,
    longitude: 121.4737,
    distanceKm: 0.8,
    seller: '小区住户 A',
    sellerCredit: 98,
    status: '在售',
    description: '尺寸 100×50cm，桌面干净稳固，适合书房或儿童房。',
  },
  {
    id: 'chair-02',
    title: '人体工学椅，久坐很舒服',
    price: 220,
    originalPrice: 899,
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=900&q=80',
    category: '家具家电',
    condition: '8成新',
    community: '云杉里小区',
    location: '东门门卫旁',
    latitude: 31.235,
    longitude: 121.477,
    distanceKm: 1.2,
    seller: '小区住户 B',
    sellerCredit: 96,
    status: '在售',
    description: '可调节扶手和腰靠，使用痕迹已如实拍照。',
  },
  {
    id: 'toy-03',
    title: '儿童积木整套，适合 3-6 岁',
    price: 35,
    image: 'https://images.unsplash.com/photo-1594784055977-2b8a7d2eebc3?auto=format&fit=crop&w=900&q=80',
    category: '母婴玩具',
    condition: '近全新',
    community: '云杉里小区',
    location: '社区活动室',
    latitude: 31.224,
    longitude: 121.469,
    distanceKm: 1.8,
    seller: '小区住户 C',
    sellerCredit: 100,
    status: '在售',
    description: '已清洁消毒，零件齐全，优先小区内自提。',
  },
  {
    id: 'lamp-04',
    title: '奶油风落地灯',
    price: 60,
    originalPrice: 169,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
    category: '家居用品',
    condition: '9成新',
    community: '云杉里小区',
    location: '5号楼大厅',
    latitude: 31.229,
    longitude: 121.466,
    distanceKm: 2.4,
    seller: '小区住户 D',
    sellerCredit: 97,
    status: '在售',
    description: '暖光灯泡，开关正常，搬家后闲置。',
  },
]

export const seedWants: WantPost[] = [
  { id: 'want-01', title: '求购儿童餐椅', budget: '100 元以内', category: '母婴玩具', community: '云杉里小区', description: '成色好、没有异味，周末可自提。', author: '邻居小林' },
  { id: 'want-02', title: '求一台小型电饭煲', budget: '50 元以内', category: '家具家电', community: '云杉里小区', description: '一两个人使用即可，功能正常就行。', author: '邻居阿敏' },
]

export const seedConversations: Conversation[] = [
  { id: 'conversation-01', title: '原木色书桌，搬家低价出', peer: '小区住户 A', preview: '可以 60 元吗？今晚方便自提', unread: 2, listingId: 'desk-01' },
  { id: 'conversation-02', title: '人体工学椅，久坐很舒服', peer: '小区住户 B', preview: '已约定明天 19:00 东门见', unread: 0, listingId: 'chair-02' },
]

export function searchListings(keyword: string, category = '全部') {
  const normalized = keyword.trim().toLowerCase()
  return seedListings.filter((item) => {
    const matchKeyword = !normalized || `${item.title}${item.category}${item.description}`.toLowerCase().includes(normalized)
    const matchCategory = category === '全部' || item.category === category
    return matchKeyword && matchCategory
  })
}

