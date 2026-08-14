const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const requests = db.collection('contact_requests')
const conversations = db.collection('conversations')
const messages = db.collection('messages')
const users = db.collection('users')

const ok = data => ({ code: 0, data })
const fail = msg => ({ code: -1, msg })

exports.main = async event => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return fail('请先登录')
  try {
    if (event.action === 'request') return createRequest(event, OPENID)
    if (event.action === 'respond') return respond(event, OPENID)
    if (event.action === 'revoke') return revoke(event, OPENID)
    if (event.action === 'listPending') return listPending(OPENID)
    return getRequest(event, OPENID)
  } catch (error) {
    console.error('[contact]', error)
    return fail('联系方式服务暂时不可用')
  }
}

async function createRequest({ conversationId, reason = '' }, buyerOpenid) {
  const conversation = await getConversation(conversationId)
  if (!conversation) return fail('会话不存在')
  if (conversation.buyerOpenid !== buyerOpenid) return fail('只有买家可以发起申请')
  const previous = await requests.where({ conversationId, buyerOpenid }).orderBy('createdAt', 'desc').limit(1).get()
  if (previous.data[0] && ['pending', 'approved'].includes(previous.data[0].status)) {
    return ok(await secureView(previous.data[0], buyerOpenid))
  }
  const text = cleanText(reason, 60)
  const now = Date.now()
  const doc = {
    conversationId,
    itemId: conversation.itemId,
    buyerOpenid,
    sellerOpenid: conversation.sellerOpenid,
    reason: text || '方便自提时联系',
    status: 'pending',
    createdAt: now,
    updatedAt: now
  }
  const added = await requests.add({ data: doc })
  await addSystemMessage(conversationId, buyerOpenid, conversation.sellerOpenid, '买家申请交换联系方式，请确认是否同意')
  return ok(await secureView({ ...doc, _id: added._id }, buyerOpenid))
}

async function respond({ requestId, approved }, sellerOpenid) {
  const current = await getById(requestId)
  if (!current) return fail('申请不存在')
  if (current.sellerOpenid !== sellerOpenid) return fail('只有卖家可以处理申请')
  if (current.status !== 'pending') return fail('申请已经处理')
  if (approved) {
    const sellerResult = await users.where({ openid: sellerOpenid }).limit(1).get()
    const seller = sellerResult.data[0]
    if (!seller || (!seller.wechatId && !seller.phoneNumber)) return fail('请先授权手机号或填写微信号')
  }
  const status = approved ? 'approved' : 'rejected'
  const now = Date.now()
  await requests.doc(requestId).update({ data: { status, respondedAt: now, updatedAt: now } })
  await addSystemMessage(current.conversationId, sellerOpenid, current.buyerOpenid, approved ? '卖家已同意交换联系方式' : '卖家暂未同意交换联系方式')
  return ok(await secureView({ ...current, status, respondedAt: now, updatedAt: now }, sellerOpenid))
}

async function revoke({ requestId }, openid) {
  const current = await getById(requestId)
  if (!current || !isParticipant(current, openid)) return fail('申请不存在或无权操作')
  if (current.status === 'revoked') return ok(await secureView(current, openid))
  const now = Date.now()
  await requests.doc(requestId).update({ data: { status: 'revoked', revokedByRole: current.sellerOpenid === openid ? 'seller' : 'buyer', updatedAt: now } })
  return ok(await secureView({ ...current, status: 'revoked', updatedAt: now }, openid))
}

async function getRequest({ requestId, conversationId }, openid) {
  let current = requestId ? await getById(requestId) : null
  if (!current && conversationId) {
    const result = await requests.where({ conversationId }).orderBy('createdAt', 'desc').limit(1).get()
    current = result.data[0] || null
  }
  if (!current) return ok(null)
  if (!isParticipant(current, openid)) return fail('无权查看该申请')
  return ok(await secureView(current, openid))
}

async function listPending(sellerOpenid) {
  const result = await requests.where({ sellerOpenid, status: 'pending' }).orderBy('createdAt', 'desc').limit(50).get()
  return ok({ list: await Promise.all(result.data.map(item => secureView(item, sellerOpenid))) })
}

async function secureView(request, viewerOpenid) {
  const role = request.sellerOpenid === viewerOpenid ? 'seller' : 'buyer'
  const view = {
    id: request._id,
    conversationId: request.conversationId,
    itemId: request.itemId,
    reason: request.reason,
    status: request.status,
    role,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt
  }
  if (request.status === 'approved') {
    const sellerResult = await users.where({ openid: request.sellerOpenid }).limit(1).get()
    const seller = sellerResult.data[0] || {}
    view.wechatId = seller.wechatId || ''
    view.phoneNumber = seller.phoneNumber || ''
    view.phoneMasked = maskPhone(seller.phoneNumber || '')
  }
  return view
}

async function addSystemMessage(conversationId, senderOpenid, recipientOpenid, content) {
  const now = Date.now()
  await messages.add({ data: { conversationId, senderOpenid, recipientOpenid, type: 'system', content, read: false, createdAt: now } })
  await conversations.doc(conversationId).update({ data: { lastMessage: content, lastMessageAt: now, updatedAt: now } })
}

async function getConversation(id) {
  if (!id) return null
  const result = await conversations.doc(id).get().catch(() => null)
  return result && result.data
}

async function getById(id) {
  if (!id) return null
  const result = await requests.doc(id).get().catch(() => null)
  return result && result.data
}

function isParticipant(request, openid) {
  return request.buyerOpenid === openid || request.sellerOpenid === openid
}

function cleanText(value, maxLength) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, maxLength)
}

function maskPhone(phone) {
  const normalized = String(phone || '')
  if (normalized.length < 7) return normalized
  return normalized.slice(0, 3) + '****' + normalized.slice(-4)
}
