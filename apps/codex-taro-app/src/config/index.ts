/**
 * 公开仓库配置。
 * 腾讯地图浏览器端 Key 会进入编译产物，因此必须在腾讯位置服务控制台限制授权 AppID、接口和配额。
 * 真实 Key 只写入本机 `.env.local`，该文件已由 Git 忽略。
 */

export const APP_CONFIG = {
  TENCENT_MAP_KEY: process.env.TARO_APP_TENCENT_MAP_KEY ?? '',
  TENCENT_MAP_BASE: 'https://apis.map.qq.com',
  CLOUD_ENV: process.env.TARO_APP_CLOUD_ENV ?? '',
  NEARBY_RADIUS: 5000,
  NEARBY_PAGE_SIZE: 20,
} as const

export const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'digital', label: '数码' },
  { key: 'appliance', label: '家电' },
  { key: 'furniture', label: '家具' },
  { key: 'baby', label: '母婴' },
  { key: 'clothing', label: '服饰' },
  { key: 'book', label: '图书' },
  { key: 'other', label: '其他' },
] as const

export const CONDITIONS = [
  { key: 'new', label: '全新' },
  { key: 'almost', label: '几乎全新' },
  { key: 'good', label: '成色不错' },
  { key: 'used', label: '有使用痕迹' },
  { key: 'flaw', label: '有瑕疵' },
] as const
