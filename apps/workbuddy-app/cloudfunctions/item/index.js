// 云函数 item:商品核心业务(列表/详情/发布/编辑/删除/搜索/审核)
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const items = db.collection('items')
const users = db.collection('users')
const favorites = db.collection('favorites')
const messages = db.collection('messages')

const ok = data => ({ code: 0, data })
const fail = msg => ({ code: -1, msg })

// 管理员 openid —— 部署后在云开发控制台查看你的 openid 并替换
const ADMIN_OPENIDS = ['REPLACE_WITH_YOUR_OPENID']
const needAudit = () => ADMIN_OPENIDS[0] !== 'REPLACE_WITH_YOUR_OPENID'

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const action = event.action
  try {
    switch (action) {
      case 'list': return await list(event)
      case 'detail': return await detail(event, OPENID)
      case 'create': return await create(event, OPENID)
      case 'update': return await update(event, OPENID)
      case 'remove': return await remove(event, OPENID)
      case 'my': return await my(event, OPENID)
      case 'search': return await search(event)
      case 'auditList': return await auditList(OPENID)
      case 'audit': return await audit(event, OPENID)
      default: return fail('未知操作: ' + action)
    }
  } catch (e) {
    console.error(e)
    return fail(e.message || '服务异常')
  }
}

// 商品列表(在售,按时间倒序;附近排序可后续建地理索引)
async function list(event) {
  const { page = 1, pageSize = 10, category = 'all' } = event
  const where = { status: 'on_sale' }
  if (category && category !== 'all') where.category = category
  const res = await items.where(where)
    .orderBy('createdAt', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  return ok({ list: await enrichItems(res.data), page: Number(page), hasMore: res.data.length === pageSize })
}

// 商品详情 + 浏览量 + 收藏状态
async function detail(event, OPENID) {
  const { id } = event
  if (!id) return fail('参数错误')
  let item
  try {
    item = (await items.doc(id).get()).data
  } catch (e) {
    return fail('商品不存在或已删除')
  }
  await items.doc(id).update({ data: { views: _.inc(1) } })
  item.views = (item.views || 0) + 1

  const uRes = await users.where({ openid: item.openid }).get()
  const u = uRes.data[0] || {}
  item.seller = {
    nickname: u.nickname || '',
    avatarUrl: u.avatarUrl || '',
    communityName: u.communityName || '',
    building: u.building || '',
    creditScore: u.creditScore || 100
  }

  let isFavorite = false
  let isMine = false
  if (OPENID) {
    isMine = item.openid === OPENID
    const fav = await favorites.where({ openid: OPENID, itemId: id }).get()
    isFavorite = fav.data.length > 0
  }
  return ok({ item: publicItemView(item), isFavorite, isMine })
}

// 发布闲置
async function create(event, OPENID) {
  const { title, desc, images = [], price, originalPrice, condition, category, communityId, communityName, location, latitude, longitude, free } = event
  if (!title || title.trim().length < 4) return fail('标题请至少填写4个字')
  if (images.length === 0) return fail('请至少上传一张实物图片')
  if (category === 'all' || !category) return fail('请选择分类')
  if (!free && (price === '' || price === null || price === undefined || Number(price) < 0)) return fail('请填写价格,或勾选免费送')
  if (/(处方药|香烟|烟草|电子烟|管制刀具|枪支|弹药|赌博|外挂)/i.test(`${title} ${desc || ''}`)) return fail('内容可能涉及违禁品，请修改后再发布')

  const uRes = await users.where({ openid: OPENID }).get()
  const user = uRes.data[0] || {}
  const auditOn = needAudit()
  const now = Date.now()
  const doc = {
    openid: OPENID,
    title: title.trim(),
    desc: (desc || '').trim(),
    images,
    price: free ? 0 : Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : 0,
    condition: condition || 'good',
    category: category || 'other',
    communityId: communityId || user.communityId || '',
    communityName: communityName || user.communityName || '',
    location: location || '',
    latitude: latitude || null,
    longitude: longitude || null,
    status: auditOn ? 'pending' : 'on_sale',
    views: 0,
    favoritesCount: 0,
    createdAt: now,
    updatedAt: now
  }
  const addRes = await items.add({ data: doc })
  return ok({ id: addRes._id, status: doc.status, needAudit: auditOn })
}

// 编辑/上下架/标记已售(仅本人或管理员)
async function update(event, OPENID) {
  const { id } = event
  if (!id) return fail('参数错误')
  const item = await getItem(id)
  if (!item) return fail('商品不存在')
  if (item.openid !== OPENID && !isAdmin(OPENID)) return fail('无权操作')

  const allowed = ['title', 'desc', 'images', 'price', 'originalPrice', 'condition', 'category', 'status', 'location', 'latitude', 'longitude']
  const data = { updatedAt: Date.now() }
  allowed.forEach(k => { if (event[k] !== undefined) data[k] = event[k] })
  await items.doc(id).update({ data })
  return ok({ id })
}

// 删除(仅本人或管理员)
async function remove(event, OPENID) {
  const { id } = event
  const item = await getItem(id)
  if (!item) return fail('商品不存在')
  if (item.openid !== OPENID && !isAdmin(OPENID)) return fail('无权操作')
  await items.doc(id).remove()
  await favorites.where({ itemId: id }).remove()
  return ok({ id })
}

// 我的发布
async function my(event, OPENID) {
  const { page = 1, pageSize = 10 } = event
  const res = await items.where({ openid: OPENID })
    .orderBy('createdAt', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  return ok({ list: res.data, page: Number(page), hasMore: res.data.length === pageSize })
}

// 关键词搜索(标题/描述)
async function search(event) {
  const { keyword = '', page = 1, pageSize = 10 } = event
  if (!keyword.trim()) return ok({ list: [], hasMore: false })
  const reg = db.RegExp({ regexp: keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), options: 'i' })
  const res = await items.where(_.or([
    { title: reg, status: 'on_sale' },
    { desc: reg, status: 'on_sale' }
  ]))
    .orderBy('createdAt', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  return ok({ list: await enrichItems(res.data), page: Number(page), hasMore: res.data.length === pageSize })
}

// ===== 审核(管理员) =====
async function auditList(OPENID) {
  if (!isAdmin(OPENID)) return fail('无权限')
  const res = await items.where({ status: 'pending' }).orderBy('createdAt', 'asc').limit(50).get()
  return ok({ list: await enrichItems(res.data) })
}

async function audit(event, OPENID) {
  if (!isAdmin(OPENID)) return fail('无权限')
  const { id, pass, reason } = event
  const item = await getItem(id)
  if (!item) return fail('商品不存在')
  const status = pass ? 'on_sale' : 'off'
  await items.doc(id).update({ data: { status, auditReason: pass ? '' : (reason || '不符合平台规范'), updatedAt: Date.now() } })
  // 站内通知发布者
  await messages.add({
    data: {
      toOpenid: item.openid,
      fromOpenid: 'system',
      type: 'audit',
      title: pass ? '发布成功' : '发布未通过',
      content: pass ? '你的物品「' + item.title + '」已通过审核并上架' : ('你的物品「' + item.title + '」未通过审核:' + (reason || '不符合平台规范')),
      itemId: id,
      read: false,
      createdAt: Date.now()
    }
  })
  return ok({ id, status })
}

// ===== 工具 =====
async function getItem(id) {
  try {
    return (await items.doc(id).get()).data
  } catch (e) {
    return null
  }
}

// 批量关联卖家信息
async function enrichItems(list) {
  if (!list || !list.length) return []
  const openids = [...new Set(list.map(i => i.openid))]
  const uRes = await users.where({ openid: _.in(openids) }).get()
  const uMap = {}
  uRes.data.forEach(u => { uMap[u.openid] = u })
  return list.map(i => {
    const u = uMap[i.openid] || {}
    return {
      ...publicItemView(i),
      seller: {
        nickname: u.nickname || '',
        avatarUrl: u.avatarUrl || '',
        communityName: u.communityName || '',
        creditScore: u.creditScore || 100
      }
    }
  })
}

function publicItemView(item) {
  const { openid, phone, ...safe } = item
  return safe
}

function isAdmin(openid) {
  return ADMIN_OPENIDS.includes(openid)
}
