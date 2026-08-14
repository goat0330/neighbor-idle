// 云函数 login:登录注册 / 小区认证 / 资料更新
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const users = db.collection('users')

const ok = data => ({ code: 0, data })
const fail = msg => ({ code: -1, msg })

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const action = event.action || 'login'
  try {
    switch (action) {
      case 'login': return await doLogin(OPENID)
      case 'bindCommunity': return await bindCommunity(OPENID, event)
      case 'updateProfile': return await updateProfile(OPENID, event)
      case 'get': return await get(OPENID)
      default: return fail('未知操作: ' + action)
    }
  } catch (e) {
    console.error(e)
    return fail(e.message || '服务异常')
  }
}

// 登录:查不到就自动注册
async function doLogin(OPENID) {
  const res = await users.where({ openid: OPENID }).get()
  if (res.data.length > 0) {
    const u = res.data[0]
    if (u.status === 'banned') return fail('账号已被封禁,如有疑问请联系管理员')
    return ok({ openid: OPENID, user: u, isNew: false })
  }
  const now = Date.now()
  const user = {
    openid: OPENID,
    nickname: '邻居' + OPENID.slice(-4),
    avatarUrl: '',
    communityId: '',
    communityName: '',
    building: '',
    wechatId: '',
    verificationStatus: 'unverified',
    creditScore: 100,
    status: 'active',
    createdAt: now,
    updatedAt: now
  }
  await users.add({ data: user })
  return ok({ openid: OPENID, user, isNew: true })
}

// 小区/楼栋认证(信任体系核心)
async function bindCommunity(OPENID, event) {
  const { communityId, communityName, building } = event
  if (!communityId || !communityName) return fail('请选择小区')
  const cur = await getUser(OPENID)
  const data = {
    communityId,
    communityName,
    building: (building || '').trim(),
    updatedAt: Date.now()
  }
  // 首次认证奖励信用分
  if (!cur || !cur.communityId) {
    data.creditScore = Math.min(100, (cur && cur.creditScore || 100) + 5)
  }
  await users.where({ openid: OPENID }).update({ data })
  return ok(await getUser(OPENID))
}

// 更新昵称/头像。微信号由 user 云函数的专用接口管理,不会随公开资料返回。
async function updateProfile(OPENID, event) {
  const data = { updatedAt: Date.now() }
  if (event.nickname && event.nickname.trim()) data.nickname = event.nickname.trim().slice(0, 20)
  if (event.avatarUrl) data.avatarUrl = event.avatarUrl
  await users.where({ openid: OPENID }).update({ data })
  return ok(await getUser(OPENID))
}

async function get(OPENID) {
  return ok(await getUser(OPENID))
}

async function getUser(openid) {
  const res = await users.where({ openid }).get()
  return res.data[0] || null
}
