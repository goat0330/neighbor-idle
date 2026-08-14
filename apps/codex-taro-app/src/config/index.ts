/**
 * 公开仓库配置。
 * 腾讯地图 Key 只允许在 H5 本地预览时进入编译产物；微信小程序一律通过 CloudBase 云函数访问。
 * 真实 Key 只写入本机 `.env.local` 或云函数环境变量，该文件已由 Git 忽略。
 */

const buildEnv = typeof process !== 'undefined' && process.env ? process.env : {}
const isH5Build = buildEnv.TARO_ENV === 'h5'

export const APP_CONFIG = {
  TENCENT_MAP_KEY: isH5Build ? buildEnv.TARO_APP_TENCENT_MAP_KEY ?? '' : '',
  TENCENT_MAP_BASE: 'https://apis.map.qq.com',
  CLOUD_ENV: buildEnv.TARO_APP_CLOUD_ENV ?? '',
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
