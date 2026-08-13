const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const requests = db.collection('contact_requests')
const items = db.collection('items')
const users = db.collection('users')

const ok = data => ({ success: true, data })
const fail = message => ({ success: false, message })

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return fail('请先登录')
  const action = event.action || 'get'
  if (action === 'request') return createRequest(event, OPENID)
  if (action === 'respond') return respond(event, OPENID)
  if (action === 'revoke') return revoke(event, OPENID)
  return getRequest(event, OPENID)
}

async function createRequest({ itemId, reason = '' }, buyerOpenid) {
  if (!itemId) return fail('缺少商品参数')
  const itemRes = await items.doc(itemId).get().catch(() => null)
  const item = itemRes && itemRes.data
  if (!item) return fail('商品不存在')
  if (item.openid === buyerOpenid) return fail('不能向自己申请联系方式')
  const existing = await requests.where({ itemId, buyerOpenid, status: 'pending' }).limit(1).get()
  if (existing.data.length) return ok(publicView(existing.data[0], buyerOpenid))
  const now = Date.now()
  const doc = { itemId, buyerOpenid, sellerOpenid: item.openid, reason: String(reason).slice(0, 60), status: 'pending', createdAt: now, updatedAt: now }
  const added = await requests.add({ data: doc })
  return ok(publicView({ ...doc, _id: added._id }, buyerOpenid))
}

async function respond({ requestId, approved }, sellerOpenid) {
  const current = await getById(requestId)
  if (!current) return fail('申请不存在')
  if (current.sellerOpenid !== sellerOpenid) return fail('只有卖家可以处理申请')
  if (current.status !== 'pending') return fail('申请已处理')
  const status = approved ? 'approved' : 'rejected'
  await requests.doc(requestId).update({ data: { status, updatedAt: Date.now() } })
  return getRequest({ requestId }, sellerOpenid)
}

async function revoke({ requestId }, openid) {
  const current = await getById(requestId)
  if (!current || !isParticipant(current, openid)) return fail('无权操作')
  await requests.doc(requestId).update({ data: { status: 'revoked', updatedAt: Date.now() } })
  return ok({ requestId, status: 'revoked' })
}

async function getRequest({ requestId }, openid) {
  const current = await getById(requestId)
  if (!current || !isParticipant(current, openid)) return fail('申请不存在或无权查看')
  const view = publicView(current, openid)
  if (current.status === 'approved') {
    const seller = await users.where({ openid: current.sellerOpenid }).limit(1).get()
    view.wechatId = seller.data[0] && seller.data[0].wechatId ? seller.data[0].wechatId : ''
  }
  return ok(view)
}

async function getById(id) {
  if (!id) return null
  const result = await requests.doc(id).get().catch(() => null)
  return result && result.data
}

function isParticipant(request, openid) {
  return request.buyerOpenid === openid || request.sellerOpenid === openid
}

function publicView(request, viewerOpenid) {
  return { id: request._id, itemId: request.itemId, reason: request.reason, status: request.status, role: request.sellerOpenid === viewerOpenid ? 'seller' : 'buyer', createdAt: request.createdAt, updatedAt: request.updatedAt }
}
