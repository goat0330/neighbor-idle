const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const conversations = db.collection('conversations')
const messages = db.collection('messages')
const items = db.collection('items')
const users = db.collection('users')

const ok = data => ({ code: 0, data })
const fail = msg => ({ code: -1, msg })

exports.main = async event => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return fail('请先登录')
  try {
    if (event.action === 'open') return openConversation(event, OPENID)
    if (event.action === 'detail') return detail(event, OPENID)
    if (event.action === 'list') return listConversations(event, OPENID)
    if (event.action === 'messages') return listMessages(event, OPENID)
    if (event.action === 'send') return sendMessage(event, OPENID)
    if (event.action === 'markRead') return markRead(event, OPENID)
    if (event.action === 'unread') return unread(OPENID)
    return fail('未知操作')
  } catch (error) {
    console.error('[conversation]', error)
    return fail('消息服务暂时不可用')
  }
}

async function detail({ conversationId }, openid) {
  const conversation = await requireParticipant(conversationId, openid)
  if (!conversation) return fail('会话不存在或无权查看')
  return ok(await conversationView(conversation, openid))
}

async function openConversation({ itemId }, buyerOpenid) {
  if (!itemId) return fail('缺少商品参数')
  const itemResult = await items.doc(itemId).get().catch(() => null)
  const item = itemResult && itemResult.data
  if (!item || item.status === 'deleted') return fail('商品不存在')
  if (item.openid === buyerOpenid) return fail('不能与自己发起交易会话')
  const existing = await conversations.where({ itemId, buyerOpenid, sellerOpenid: item.openid }).limit(1).get()
  if (existing.data.length) return ok(await conversationView(existing.data[0], buyerOpenid))
  const now = Date.now()
  const doc = {
    itemId,
    itemTitle: String(item.title || '').slice(0, 80),
    itemImage: Array.isArray(item.images) ? item.images[0] || '' : '',
    buyerOpenid,
    sellerOpenid: item.openid,
    lastMessage: '发起了交易会话',
    lastMessageAt: now,
    status: 'active',
    createdAt: now,
    updatedAt: now
  }
  const added = await conversations.add({ data: doc })
  return ok(await conversationView({ ...doc, _id: added._id }, buyerOpenid))
}

async function listConversations({ page = 1, pageSize = 20 }, openid) {
  const safePage = Math.max(1, Number(page) || 1)
  const safeSize = Math.min(50, Math.max(1, Number(pageSize) || 20))
  const result = await conversations.where(_.or([{ buyerOpenid: openid }, { sellerOpenid: openid }]))
    .orderBy('lastMessageAt', 'desc')
    .skip((safePage - 1) * safeSize)
    .limit(safeSize)
    .get()
  const list = await Promise.all(result.data.map(item => conversationView(item, openid)))
  return ok({ list, page: safePage, hasMore: result.data.length === safeSize })
}

async function listMessages({ conversationId, before, pageSize = 30 }, openid) {
  const conversation = await requireParticipant(conversationId, openid)
  if (!conversation) return fail('会话不存在或无权查看')
  const safeSize = Math.min(50, Math.max(1, Number(pageSize) || 30))
  const condition = { conversationId }
  if (before) condition.createdAt = _.lt(Number(before))
  const result = await messages.where(condition).orderBy('createdAt', 'desc').limit(safeSize).get()
  const list = result.data.reverse().map(item => messageView(item, openid))
  return ok({ list, hasMore: result.data.length === safeSize })
}

async function sendMessage({ conversationId, content }, openid) {
  const conversation = await requireParticipant(conversationId, openid)
  if (!conversation || conversation.status !== 'active') return fail('会话不存在或已关闭')
  const text = cleanMessage(content)
  if (!text) return fail('请输入消息内容')
  if (text.length > 500) return fail('消息最多 500 字')
  if (/(处方药|香烟|电子烟|管制刀具|枪支|弹药|赌博|外挂)/i.test(text)) return fail('消息包含不允许的内容')
  const recipientOpenid = conversation.buyerOpenid === openid ? conversation.sellerOpenid : conversation.buyerOpenid
  const now = Date.now()
  const doc = { conversationId, senderOpenid: openid, recipientOpenid, type: 'text', content: text, read: false, createdAt: now }
  const added = await messages.add({ data: doc })
  await conversations.doc(conversationId).update({ data: { lastMessage: text.slice(0, 80), lastMessageAt: now, updatedAt: now } })
  return ok(messageView({ ...doc, _id: added._id }, openid))
}

async function markRead({ conversationId }, openid) {
  const conversation = await requireParticipant(conversationId, openid)
  if (!conversation) return fail('会话不存在或无权操作')
  await messages.where({ conversationId, recipientOpenid: openid, read: false }).update({ data: { read: true, readAt: Date.now() } })
  return ok({ conversationId })
}

async function unread(openid) {
  const result = await messages.where({ recipientOpenid: openid, read: false }).count()
  return ok({ count: result.total })
}

async function requireParticipant(id, openid) {
  if (!id) return null
  const result = await conversations.doc(id).get().catch(() => null)
  const conversation = result && result.data
  if (!conversation) return null
  return conversation.buyerOpenid === openid || conversation.sellerOpenid === openid ? conversation : null
}

async function conversationView(conversation, openid) {
  const isSeller = conversation.sellerOpenid === openid
  const peerOpenid = isSeller ? conversation.buyerOpenid : conversation.sellerOpenid
  const peerResult = await users.where({ openid: peerOpenid }).limit(1).get()
  const peer = peerResult.data[0] || {}
  const unreadResult = await messages.where({ conversationId: conversation._id, recipientOpenid: openid, read: false }).count()
  return {
    id: conversation._id,
    itemId: conversation.itemId,
    itemTitle: conversation.itemTitle,
    itemImage: conversation.itemImage,
    peerName: peer.nickname || '邻居',
    peerAvatar: peer.avatarUrl || '',
    role: isSeller ? 'seller' : 'buyer',
    lastMessage: conversation.lastMessage || '',
    lastMessageAt: conversation.lastMessageAt || conversation.createdAt,
    unread: unreadResult.total,
    status: conversation.status || 'active'
  }
}

function messageView(message, openid) {
  return { id: message._id, side: message.senderOpenid === openid ? 'mine' : 'peer', type: message.type, text: message.content, read: Boolean(message.read), createdAt: message.createdAt }
}

function cleanMessage(value) {
  return String(value || '').replace(/[<>]/g, '').trim()
}
