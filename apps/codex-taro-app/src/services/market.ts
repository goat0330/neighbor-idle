import { Conversation, Listing, ListingStatus, WantPost } from '@/types/market'
import type { BackendItem, BackendWant } from './backend'
import productAirpods from '@/assets/mock-optimized/product-airpods.jpg'
import productBag from '@/assets/mock-optimized/product-bag.jpg'
import productBicycle from '@/assets/mock-optimized/product-bicycle.jpg'
import productBooks from '@/assets/mock-optimized/product-books.jpg'
import productDesk from '@/assets/mock-optimized/product-desk.jpg'
import productRiceCooker from '@/assets/mock-optimized/product-rice-cooker.jpg'
import productSofa from '@/assets/mock-optimized/product-sofa.jpg'
import productStroller from '@/assets/mock-optimized/product-stroller.jpg'
import productWasher from '@/assets/mock-optimized/product-washer.jpg'
import avatarBlue from '@/assets/mock/avatar-blue.png'
import avatarBrown from '@/assets/mock/avatar-brown.png'
import avatarGreen from '@/assets/mock/avatar-green.png'
import avatarOrange from '@/assets/mock/avatar-orange.png'

export const seedListings: Listing[] = [
  {
    id: 'desk-01',
    title: '宜家书桌',
    price: 50,
    originalPrice: 399,
    image: productDesk,
    category: '家具',
    condition: '几乎全新',
    community: '金水花园',
    location: '周末全天自提',
    latitude: 31.2304,
    longitude: 121.4737,
    distanceKm: 0.32,
    seller: '小橘子',
    sellerAvatar: avatarOrange,
    sellerCredit: 98,
    status: '在售',
    description: '宜家简约书桌，实木桌面，搭配金属桌腿，稳固耐用。使用约1年，无明显划痕，适合书房、卧室或办公使用。',
    views: 28,
    favorites: 2,
    updatedAtText: '昨天更新',
  },
  {
    id: 'washer-02',
    title: '小天鹅洗衣机 6.5kg',
    price: 300,
    image: productWasher,
    category: '家电',
    condition: '几乎全新',
    community: '金水花园',
    location: '金水花园二期',
    latitude: 31.235,
    longitude: 121.477,
    distanceKm: 0.45,
    seller: '阿青',
    sellerAvatar: avatarGreen,
    sellerCredit: 96,
    status: '在售',
    description: '容量 6.5kg，功能正常，搬家出闲置，支持小区内自提。',
    views: 19,
    favorites: 1,
    updatedAtText: '今天更新',
  },
  {
    id: 'sofa-03',
    title: '双人布艺沙发',
    price: 120,
    image: productSofa,
    category: '家具',
    condition: '成色不错',
    community: '金水花园',
    location: '金水花园',
    latitude: 31.224,
    longitude: 121.469,
    distanceKm: 0.28,
    seller: '木木',
    sellerAvatar: avatarBlue,
    sellerCredit: 100,
    status: '在售',
    description: '双人布艺沙发，坐感舒适，整体成色良好，适合小户型客厅。',
    views: 34,
    favorites: 3,
    updatedAtText: '2天前更新',
  },
  {
    id: 'books-04',
    title: '《人间值得》全新',
    price: 10,
    image: productBooks,
    category: '图书',
    condition: '全新',
    community: '金水花园南区',
    location: '金水花园南区',
    latitude: 31.229,
    longitude: 121.466,
    distanceKm: 0.18,
    seller: '阿禾',
    sellerAvatar: avatarBrown,
    sellerCredit: 97,
    status: '在售',
    description: '全新未拆封，适合想读书的邻居，支持附近自取。',
    views: 12,
    favorites: 1,
    updatedAtText: '昨天更新',
  },
  {
    id: 'rice-cooker-05',
    title: '苏泊尔电饭煲 3L',
    price: 60,
    image: productRiceCooker,
    category: '家电',
    condition: '几乎全新',
    community: '金水花园',
    location: '金水花园',
    latitude: 31.229,
    longitude: 121.466,
    distanceKm: 0.52,
    seller: '七喜',
    sellerAvatar: avatarGreen,
    sellerCredit: 99,
    status: '在售',
    description: '3L 电饭煲，功能正常，内胆干净，搬家后闲置。',
    views: 21,
    favorites: 0,
    updatedAtText: '3天前更新',
  },
  {
    id: 'stroller-06',
    title: '婴儿推车可折叠',
    price: 80,
    image: productStroller,
    category: '母婴',
    condition: '成色不错',
    community: '金水花园二期',
    location: '金水花园二期',
    latitude: 31.229,
    longitude: 121.466,
    distanceKm: 0.36,
    seller: '可可妈',
    sellerAvatar: avatarBrown,
    sellerCredit: 99,
    status: '在售',
    description: '可折叠婴儿推车，收纳方便，适合附近邻居自取。',
    views: 18,
    favorites: 2,
    updatedAtText: '3天前更新',
  },
  {
    id: 'airpods-07',
    title: 'Apple AirPods Pro 2代',
    price: 900,
    image: productAirpods,
    category: '数码',
    condition: '几乎全新',
    community: '金水花园',
    location: '金水花园',
    latitude: 31.229,
    longitude: 121.466,
    distanceKm: 0.62,
    seller: '科技宅小明',
    sellerAvatar: avatarBlue,
    sellerCredit: 98,
    status: '在售',
    description: '功能正常，成色很新，可当面验货。',
    views: 28,
    favorites: 2,
    updatedAtText: '昨天更新',
  },
  {
    id: 'bag-08',
    title: '复古帆布单肩包',
    price: 65,
    image: productBag,
    category: '其他',
    condition: '成色不错',
    community: '金水花园',
    location: '金水花园',
    latitude: 31.229,
    longitude: 121.466,
    distanceKm: 0.41,
    seller: '麦克斯',
    sellerAvatar: avatarOrange,
    sellerCredit: 97,
    status: '在售',
    description: '容量合适，肩带完整，适合日常通勤。',
    views: 12,
    favorites: 1,
    updatedAtText: '2天前更新',
  },
  {
    id: 'bicycle-09',
    title: '山地自行车 捷安特',
    price: 900,
    image: productBicycle,
    category: '其他',
    condition: '成色不错',
    community: '金水花园',
    location: '金水花园',
    latitude: 31.229,
    longitude: 121.466,
    distanceKm: 0.74,
    seller: '骑行爱好者',
    sellerAvatar: avatarGreen,
    sellerCredit: 99,
    status: '在售',
    description: '车况良好，适合通勤和周末骑行。',
    views: 56,
    favorites: 3,
    updatedAtText: '3天前更新',
  },
]

export const seedWants: WantPost[] = [
  { id: 'want-01', title: '求一个小书桌', budget: '¥80 – ¥120', category: '家具', community: '金水花园', description: '求一张小书桌，尺寸不要太大，八成新以上，带抽屉更好。', author: '阿辉', authorAvatar: avatarBlue, publishedAtText: '10分钟前' },
  { id: 'want-02', title: '求儿童自行车', budget: '¥100 – ¥180', category: '其他', community: '金水花园', description: '孩子6岁，求16寸左右的儿童自行车，最好九成新。', author: '小鱼', authorAvatar: avatarBrown, publishedAtText: '25分钟前' },
  { id: 'want-03', title: '求显示器', budget: '¥200 – ¥400', category: '数码', community: '金水花园', description: '求24–27寸显示器，1080P或以上，护眼不闪屏。', author: '大熊', authorAvatar: avatarGreen, publishedAtText: '1小时前' },
  { id: 'want-04', title: '求电风扇', budget: '¥50 – ¥100', category: '家电', community: '金水花园', description: '求购静音台扇或落地扇，能正常使用即可。', author: '夏天', authorAvatar: avatarOrange, publishedAtText: '2小时前' },
  { id: 'want-05', title: '求婴儿餐椅', budget: '¥80 – ¥150', category: '母婴', community: '金水花园', description: '宝宝快吃辅食了，求一把稳固易清洗的餐椅。', author: '可可妈', authorAvatar: avatarBrown, publishedAtText: '3小时前' },
]

export const seedConversations: Conversation[] = [
  { id: 'conversation-01', title: '宜家书桌', peer: '小橘子', preview: '请问书桌还在吗？', unread: 2, listingId: 'desk-01', itemImage: productDesk, peerAvatar: avatarOrange, lastMessageAt: Date.now() - 12 * 60 * 1000 },
  { id: 'conversation-02', title: 'Apple AirPods Pro 2代', peer: '科技宅小明', preview: '可以交换微信吗？方便细聊', unread: 0, listingId: 'airpods-07', itemImage: productAirpods, peerAvatar: avatarBlue, lastMessageAt: Date.now() - 90 * 60 * 1000 },
]

export function searchListings(keyword: string, category = '全部') {
  const normalized = keyword.trim().toLowerCase()
  return seedListings.filter((item) => {
    const matchKeyword = !normalized || `${item.title}${item.category}${item.description}`.toLowerCase().includes(normalized)
    const matchCategory = category === '全部' || item.category === category
    return matchKeyword && matchCategory
  })
}

const categoryLabels: Record<string, string> = {
  all: '全部',
  furniture: '家具',
  appliance: '家电',
  digital: '数码',
  baby: '母婴',
  book: '图书',
  other: '其他',
  家具: '家具',
  家电: '家电',
  数码: '数码',
  母婴: '母婴',
  图书: '图书',
  其他: '其他',
}

const categoryKeys: Record<string, string> = {
  家具: 'furniture',
  家电: 'appliance',
  数码: 'digital',
  母婴: 'baby',
  图书: 'book',
  其他: 'other',
}

const conditionLabels: Record<string, string> = {
  new: '全新',
  almost: '几乎全新',
  good: '成色不错',
  used: '有使用痕迹',
  flaw: '有瑕疵',
  全新: '全新',
  '9成新': '几乎全新',
  '8成新': '成色不错',
  '7成新': '有使用痕迹',
  '6成新': '有瑕疵',
}

export function backendCategoryKey(label: string) {
  return categoryKeys[label] || label
}

export function mapBackendItem(item: BackendItem): Listing {
  const id = item.id || item._id || `remote-${item.title}`
  const image = item.images?.[0] || productDesk
  const sellerName = item.seller?.nickname || '邻居'
  const community = item.communityName || item.seller?.communityName || '金水花园'
  const status: ListingStatus = item.status === 'sold' || item.status === 'off' ? '已售出' : item.status === 'reserved' ? '已约定' : '在售'
  return {
    id,
    title: item.title,
    price: Number(item.price || 0),
    originalPrice: item.originalPrice,
    image,
    images: item.images?.length ? item.images : [image],
    category: categoryLabels[item.category] || item.category || '其他',
    condition: conditionLabels[item.condition || ''] || item.condition || '成色不错',
    community,
    communityId: item.communityId,
    communityName: item.communityName || community,
    location: item.location || '社区公共点自提',
    latitude: Number(item.latitude || 0),
    longitude: Number(item.longitude || 0),
    geoCircleId: item.geoCircleId,
    geoCircleName: item.geoCircleName,
    distance: item.distance,
    locationLabel: item.locationLabel,
    seller: sellerName,
    sellerAvatar: item.seller?.avatarUrl || avatarOrange,
    sellerCredit: Number(item.seller?.creditScore || 100),
    status,
    description: item.desc || '',
    views: Number(item.views || 0),
    favorites: Number(item.favoritesCount || 0),
    updatedAtText: formatRelativeTime(item.updatedAt || item.createdAt),
  }
}

export function mapBackendWant(item: BackendWant): WantPost {
  const id = item.id || item._id || `remote-want-${item.title}`
  return {
    id,
    title: item.title,
    budget: item.priceRange || '价格面议',
    category: categoryLabels[item.category] || item.category || '其他',
    community: item.publisher?.communityName || '金水花园',
    description: item.desc || '',
    author: item.publisher?.nickname || '邻居',
    authorAvatar: item.publisher?.avatarUrl || avatarBlue,
    publishedAtText: formatRelativeTime(item.createdAt),
  }
}

function formatRelativeTime(timestamp?: number) {
  if (!timestamp) return '刚刚'
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000))
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  return `${Math.floor(hours / 24)}天前`
}
