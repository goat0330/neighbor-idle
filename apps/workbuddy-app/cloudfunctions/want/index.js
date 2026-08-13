// 云函数 want:求购广场(反向需求)
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const wants = db.collection('wants')
const users = db.collection('users')

const ok = data => ({ code: 0, data })
const fail = msg => ({ code: -1, msg })

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const action = event.action
  try {
    switch (action) {
      case 'list': return await list(event)
      case 'create': return await create(event, OPENID)
      case 'my': return await my(event, OPENID)
      case 'close': return await close(event, OPENID)
      default: return fail('未知操作: ' + action)
    }
  } catch (e) {
    console.error(e)
    return fail(e.message || '服务异常')
  }
}

async function list(event) {
  const { page = 1, pageSize = 10, category = 'all' } = event
  const where = { status: 'open' }
  if (category && category !== 'all') where.category = category
  const res = await wants.where(where)
    .orderBy('createdAt', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  // 关联发布者信息
  const openids = [...new Set(res.data.map(w => w.openid))]
  const uRes = await users.where({ openid: _.in(openids) }).get()
  const uMap = {}
  uRes.data.forEach(u => { uMap[u.openid] = u })
  const list = res.data.map(w => {
    const u = uMap[w.openid] || {}
    return { ...w, publisher: { nickname: u.nickname || '', communityName: u.communityName || '' } }
  })
  return ok({ list, page: Number(page), hasMore: res.data.length === pageSize })
}

async function create(event, OPENID) {
  const { title, desc, category, priceRange, phone } = event
  if (!title || title.trim().length < 2) return fail('请填写想要求购的物品')
  if (category === 'all' || !category) return fail('请选择分类')
  const now = Date.now()
  const res = await wants.add({
    data: {
      openid: OPENID,
      title: title.trim(),
      desc: (desc || '').trim(),
      category: category || 'other',
      priceRange: priceRange || '',
      phone: phone || '',
      status: 'open',
      createdAt: now,
      updatedAt: now
    }
  })
  return ok({ id: res._id })
}

async function my(event, OPENID) {
  const res = await wants.where({ openid: OPENID }).orderBy('createdAt', 'desc').limit(50).get()
  return ok({ list: res.data })
}

async function close(event, OPENID) {
  const { id } = event
  const w = (await wants.doc(id).get()).data
  if (!w) return fail('求购不存在')
  if (w.openid !== OPENID) return fail('无权操作')
  await wants.doc(id).update({ data: { status: 'closed', updatedAt: Date.now() } })
  return ok({ id })
}
