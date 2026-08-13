// utils/config.js 全局常量配置

// 商品分类(与首页筛选联动)
const CATEGORIES = [
  { id: 'all', name: '全部' },
  { id: 'furniture', name: '家具' },
  { id: 'digital', name: '数码' },
  { id: 'appliance', name: '家电' },
  { id: 'baby', name: '母婴' },
  { id: 'clothes', name: '服饰' },
  { id: 'books', name: '图书' },
  { id: 'sports', name: '运动' },
  { id: 'other', name: '其他' }
]

// 成色
const CONDITIONS = [
  { id: 'new', name: '全新' },
  { id: 'like-new', name: '几乎全新' },
  { id: 'good', name: '九成新' },
  { id: 'used', name: '八成新' },
  { id: 'old', name: '旧/瑕疵' }
]

// 商品状态
const ITEM_STATUS = {
  PENDING: 'pending',   // 待审核
  ON_SALE: 'on_sale',   // 在售
  RESERVED: 'reserved', // 已预约
  SOLD: 'sold',         // 已售出
  OFF: 'off'            // 已下架
}

const STATUS_TEXT = {
  pending: '审核中',
  on_sale: '在售',
  reserved: '已预约',
  sold: '已售出',
  off: '已下架'
}

// 管理员的 openid 列表(审核权限),部署后请替换为你的 openid
const ADMIN_OPENIDS = ['REPLACE_WITH_YOUR_OPENID']

module.exports = {
  CATEGORIES,
  CONDITIONS,
  ITEM_STATUS,
  STATUS_TEXT,
  ADMIN_OPENIDS
}
