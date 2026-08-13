// 云函数 community:小区列表(发布/认证时选择)
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const communities = db.collection('communities')

const ok = data => ({ code: 0, data })
const fail = msg => ({ code: -1, msg })

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const action = event.action || 'list'
  try {
    switch (action) {
      case 'list': return await list(event)
      case 'add': return await add(event, OPENID)
      default: return fail('未知操作: ' + action)
    }
  } catch (e) {
    console.error(e)
    return fail(e.message || '服务异常')
  }
}

async function list(event) {
  const { keyword = '' } = event
  let query = communities.orderBy('name', 'asc').limit(200)
  if (keyword.trim()) {
    query = communities.where({
      name: db.RegExp({ regexp: keyword.trim(), options: 'i' })
    }).orderBy('name', 'asc').limit(200)
  }
  const res = await query.get()
  return ok({ list: res.data })
}

async function add(event, OPENID) {
  // 仅允许管理员添加小区(部署后把 openid 填到下面)
  const ADMINS = ['REPLACE_WITH_YOUR_OPENID']
  if (!ADMINS.includes(OPENID)) return fail('无权限')
  const { name, address, latitude, longitude } = event
  if (!name) return fail('请输入小区名称')
  const now = Date.now()
  const res = await communities.add({
    data: { name, address: address || '', latitude: latitude || null, longitude: longitude || null, createdAt: now }
  })
  return ok({ id: res._id })
}
