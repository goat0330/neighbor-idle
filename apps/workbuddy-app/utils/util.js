// utils/util.js 通用工具函数

// 相对时间:刚刚 / x分钟前 / x小时前 / x天前 / 日期
function timeAgo(ts) {
  if (!ts) return ''
  const diff = Date.now() - ts
  const min = 60 * 1000
  const hour = 60 * min
  const day = 24 * hour
  if (diff < min) return '刚刚'
  if (diff < hour) return Math.floor(diff / min) + '分钟前'
  if (diff < day) return Math.floor(diff / hour) + '小时前'
  if (diff < 7 * day) return Math.floor(diff / day) + '天前'
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

// 两经纬度距离(米),返回数字
function distanceMeters(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null
  const rad = d => (d * Math.PI) / 180
  const R = 6371000
  const dLat = rad(lat2 - lat1)
  const dLng = rad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

// 两经纬度距离(米),返回格式化文本
function formatDistance(lat1, lng1, lat2, lng2) {
  const dist = distanceMeters(lat1, lng1, lat2, lng2)
  if (dist === null) return ''
  if (dist < 1000) return `${dist}m`
  return `${(dist / 1000).toFixed(1)}km`
}

// 分类名
function categoryName(id) {
  const map = {
    furniture: '家具', digital: '数码', appliance: '家电', baby: '母婴',
    clothes: '服饰', books: '图书', sports: '运动', other: '其他'
  }
  return map[id] || '其他'
}

// 成色名
function conditionName(id) {
  const map = {
    new: '全新', 'like-new': '几乎全新', good: '九成新',
    used: '八成新', old: '旧/瑕疵'
  }
  return map[id] || ''
}

// 价格显示
function priceText(p) {
  if (p === 0 || p === null || p === undefined || p === '') return '免费送'
  return '¥' + Number(p).toFixed(0)
}

// 手机号脱敏 138****8888
function maskPhone(phone) {
  if (!phone || phone.length < 7) return phone || ''
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

// 简单防抖
function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

module.exports = {
  timeAgo,
  distanceMeters,
  formatDistance,
  categoryName,
  conditionName,
  priceText,
  maskPhone,
  debounce
}
