const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const users = db.collection('users')

const ok = data => ({ code: 0, data })
const fail = msg => ({ code: -1, msg })

exports.main = async event => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return fail('请先登录')
  try {
    if (event.action === 'updateProfile') return updateProfile(OPENID, event)
    if (event.action === 'setWechat') return setWechat(OPENID, event)
    if (event.action === 'bindCommunity') return bindCommunity(OPENID, event)
    if (event.action === 'publicProfile') return publicProfile(event.userId)
    return me(OPENID)
  } catch (error) {
    console.error('[user]', error)
    return fail('用户服务暂时不可用')
  }
}

async function me(openid) {
  let user = await findByOpenid(openid)
  if (!user) user = await createUser(openid)
  if (user.status === 'banned') return fail('账号已被限制使用，请联系客服')
  return ok(privateView(user))
}

async function updateProfile(openid, event) {
  const data = { updatedAt: Date.now() }
  if (event.nickname !== undefined) {
    const nickname = cleanText(event.nickname, 20)
    if (!nickname) return fail('昵称不能为空')
    data.nickname = nickname
  }
  if (event.avatarUrl !== undefined) {
    const avatarUrl = String(event.avatarUrl || '')
    if (avatarUrl && !/^(cloud:\/\/|https:\/\/)/.test(avatarUrl)) return fail('头像地址无效')
    data.avatarUrl = avatarUrl.slice(0, 500)
  }
  await users.where({ openid }).update({ data })
  return me(openid)
}

async function setWechat(openid, event) {
  const wechatId = String(event.wechatId || '').trim()
  if (wechatId && !/^[a-zA-Z][-_a-zA-Z0-9]{5,19}$/.test(wechatId)) {
    return fail('微信号需以字母开头，长度 6～20 位，仅支持字母、数字、横线和下划线')
  }
  await users.where({ openid }).update({ data: { wechatId, updatedAt: Date.now() } })
  return ok({ hasWechat: Boolean(wechatId) })
}

async function bindCommunity(openid, event) {
  const communityId = cleanText(event.communityId, 64)
  const communityName = cleanText(event.communityName, 40)
  const building = cleanText(event.building, 20)
  if (!communityId || !communityName) return fail('请选择小区')
  await users.where({ openid }).update({ data: {
    communityId,
    communityName,
    building,
    verificationStatus: 'pending',
    updatedAt: Date.now()
  } })
  return me(openid)
}

async function publicProfile(userId) {
  if (!userId) return fail('缺少用户参数')
  const result = await users.doc(userId).get().catch(() => null)
  const user = result && result.data
  if (!user || user.status !== 'active') return fail('用户不存在')
  return ok({
    id: user._id,
    nickname: user.nickname || '邻居',
    avatarUrl: user.avatarUrl || '',
    communityName: user.communityName || '',
    verificationStatus: user.verificationStatus || 'unverified',
    creditScore: Number(user.creditScore || 100)
  })
}

async function createUser(openid) {
  const now = Date.now()
  const user = {
    openid,
    nickname: `邻居${openid.slice(-4)}`,
    avatarUrl: '',
    communityId: '',
    communityName: '',
    building: '',
    verificationStatus: 'unverified',
    wechatId: '',
    creditScore: 100,
    status: 'active',
    createdAt: now,
    updatedAt: now
  }
  const result = await users.add({ data: user })
  return { ...user, _id: result._id }
}

async function findByOpenid(openid) {
  const result = await users.where({ openid }).limit(1).get()
  return result.data[0] || null
}

function privateView(user) {
  return {
    id: user._id,
    nickname: user.nickname || '邻居',
    avatarUrl: user.avatarUrl || '',
    communityId: user.communityId || '',
    communityName: user.communityName || '',
    building: user.building || '',
    verificationStatus: user.verificationStatus || 'unverified',
    hasWechat: Boolean(user.wechatId),
    creditScore: Number(user.creditScore || 100),
    status: user.status || 'active'
  }
}

function cleanText(value, maxLength) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, maxLength)
}
