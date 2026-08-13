// 云函数 message:站内消息(留言询价 / 系统通知),V1 轻量实现
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const messages = db.collection('messages')
const users = db.collection('users')
const items = db.collection('items')

const ok = data => ({ code: 0, data })
const fail = msg => ({ code: -1, msg })

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const action = event.action
  try {
    switch (action) {
      case 'send': return await send(event, OPENID)
      case 'list': return await list(event, OPENID)
      case 'unread': return await unread(OPENID)
      case 'read': return await read(event, OPENID)
      case 'readAll': return await readAll(OPENID)
      default: return fail('未知操作: ' + action)
    }
  } catch (e) {
    console.error(e)
    return fail(e.message || '服务异常')
  }
}

// 买家在商品详情页留言
async function send(event, OPENID) {
  const { itemId, content } = event
  if (!itemId) return fail('参数错误')
  const text = (content || '').trim()
  if (!text) return fail('请输入留言内容')
  if (text.length > 200) return fail('留言最多200字')

  let item
  try {
    item = (await items.doc(itemId).get()).data
  } catch (e) {
    return fail('商品不存在或已删除')
  }
  if (item.openid === OPENID) return fail('不能给自己的商品留言')

  const uRes = await users.where({ openid: OPENID }).get()
  const u = uRes.data[0] || {}

  await messages.add({
    data: {
      toOpenid: item.openid,
      fromOpenid: OPENID,
      fromNickname: u.nickname || '邻居',
      fromAvatar: u.avatarUrl || '',
      type: 'inquiry',
      itemId,
      itemTitle: item.title,
      itemImage: (item.images && item.images[0]) || '',
      content: text,
      read: false,
      createdAt: Date.now()
    }
  })
  // 卖家商品留言数 +1(可后续做未读角标)
  return ok({ sent: true })
}

// 我收到的消息(按时间倒序)
async function list(event, OPENID) {
  const { page = 1, pageSize = 10 } = event
  const res = await messages.where({ toOpenid: OPENID })
    .orderBy('createdAt', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  return ok({ list: res.data, page: Number(page), hasMore: res.data.length === pageSize })
}

async function unread(OPENID) {
  const res = await messages.where({ toOpenid: OPENID, read: false }).count()
  return ok({ count: res.total })
}

async function read(event, OPENID) {
  const { id } = event
  if (!id) return fail('参数错误')
  await messages.doc(id).update({ data: { read: true } })
  return ok({ id })
}

async function readAll(OPENID) {
  await messages.where({ toOpenid: OPENID, read: false }).update({ data: { read: true } })
  return ok({ done: true })
}
