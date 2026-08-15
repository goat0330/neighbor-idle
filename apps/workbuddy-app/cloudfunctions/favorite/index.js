// 云函数 favorite:收藏/取消收藏/收藏列表
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const favorites = db.collection('favorites')
const items = db.collection('items')

const ok = data => ({ code: 0, data })
const fail = msg => ({ code: -1, msg })

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return fail('请先登录')
  const action = event.action
  try {
    switch (action) {
      case 'toggle': return await toggle(event, OPENID)
      case 'list': return await list(event, OPENID)
      case 'stats': return await stats(OPENID)
      default: return fail('未知操作: ' + action)
    }
  } catch (e) {
    console.error(e)
    return fail(e.message || '服务异常')
  }
}

async function toggle(event, OPENID) {
  const { itemId } = event
  if (!itemId) return fail('参数错误')
  const exist = await favorites.where({ openid: OPENID, itemId }).get()
  if (exist.data.length > 0) {
    await favorites.doc(exist.data[0]._id).remove()
    await items.doc(itemId).update({ data: { favoritesCount: _.inc(-1) } })
    return ok({ favorited: false })
  }
  await favorites.add({ data: { openid: OPENID, itemId, createdAt: Date.now() } })
  await items.doc(itemId).update({ data: { favoritesCount: _.inc(1) } })
  return ok({ favorited: true })
}

async function list(event, OPENID) {
  const { page = 1, pageSize = 10 } = event
  const res = await favorites.where({ openid: OPENID })
    .orderBy('createdAt', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  // 关联商品信息
  const itemIds = res.data.map(f => f.itemId)
  let itemMap = {}
  if (itemIds.length) {
    const iRes = await items.where({ _id: _.in(itemIds) }).get()
    itemMap = {}
    iRes.data.forEach(i => { itemMap[i._id] = i })
  }
  const list = res.data
    .filter(f => itemMap[f.itemId])
    .map(f => ({ ...publicItemView(itemMap[f.itemId]), favId: f._id }))
  return ok({ list, page: Number(page), hasMore: res.data.length === pageSize })
}

async function stats(OPENID) {
  const result = await favorites.where({ openid: OPENID }).count()
  return ok({ count: result.total })
}

function publicItemView(item) {
  const { openid, phone, phoneNumber, phoneMasked, countryCode, wechatId, ...safe } = item
  return safe
}
