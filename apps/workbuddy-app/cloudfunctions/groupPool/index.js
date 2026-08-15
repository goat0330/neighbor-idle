// 云函数 groupPool: 生活圈解析与企业微信群池入口
//
// 这里仅返回面向小程序的安全展示数据。
// corpsecret、access_token、chat_id、config_id 和群成员信息永不下发前端。
// 真实企业微信入群字段待 WeCom Bridge Spike 完成后，通过 publicEntry 接入。
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const geoCircles = db.collection('geo_circles')
const groupPools = db.collection('group_pools')
const joinWays = db.collection('group_join_ways')

const MAX_CIRCLE_SCAN = 200
const MAX_RADIUS_M = 10000

const ok = data => ({ code: 0, data })
const fail = msg => ({ code: -1, msg })

exports.main = async (event = {}) => {
  const action = event.action || 'resolveNearby'

  try {
    switch (action) {
      case 'resolveNearby':
        return ok(await resolveNearby(event))
      case 'getEntry':
        return ok(await getEntry(event))
      default:
        return fail('未知生活圈操作')
    }
  } catch (error) {
    console.error('[groupPool]', action, error)
    return fail(error.publicMessage || error.message || '生活圈服务异常')
  }
}

async function resolveNearby(event) {
  const point = readOptionalPoint(event)
  let circle = null
  let distanceM = null

  const requestedId = cleanText(event.geoCircleId)
  if (requestedId) {
    circle = await findCircleById(requestedId)
    if (circle && circle.status !== 'active') circle = null
    if (circle && point) distanceM = distanceToCircle(point, circle)
  } else if (point) {
    const candidates = await geoCircles.where({ status: 'active' }).limit(MAX_CIRCLE_SCAN).get()
    const nearby = candidates.data
      .map(candidate => ({
        circle: candidate,
        distanceM: distanceToCircle(point, candidate),
        radiusM: circleRadius(candidate)
      }))
      .filter(candidate => candidate.distanceM <= candidate.radiusM)
      .sort((left, right) => left.distanceM - right.distanceM)

    if (nearby.length > 0) {
      circle = nearby[0].circle
      distanceM = nearby[0].distanceM
    }
  }

  if (!circle) return { geoCircle: null, entry: null }

  const geoCircle = publicCircle(circle, distanceM)
  const entry = await buildEntry(circle, distanceM)
  return { geoCircle, entry }
}

async function getEntry(event) {
  const id = cleanText(event.geoCircleId)
  if (!id) return fail('缺少 geoCircleId')

  const circle = await findCircleById(id)
  if (!circle || circle.status !== 'active') {
    return { geoCircle: null, entry: null }
  }

  const point = readOptionalPoint(event)
  const distanceM = point ? distanceToCircle(point, circle) : null
  return {
    geoCircle: publicCircle(circle, distanceM),
    entry: await buildEntry(circle, distanceM)
  }
}

async function findCircleById(id) {
  try {
    return (await geoCircles.doc(id).get()).data
  } catch {
    return null
  }
}

async function buildEntry(circle, distanceM) {
  const geoCircleId = circle._id || circle.id || ''
  const geoCircleName = cleanText(circle.name) || '附近生活圈'
  const base = {
    geoCircleId,
    geoCircleName,
    displayName: '附近生活群',
    available: false,
    subtitle: '附近生活群暂未开放，之后再来看看',
    locationLabel: cleanText(circle.locationLabel) || geoCircleName,
    unavailableReason: 'group_pool_unavailable'
  }

  if (distanceM !== null) base.distance = formatDistance(distanceM)

  const poolResult = await groupPools.where({ geoCircleId, status: 'active' }).limit(1).get()
  const pool = poolResult.data[0]
  if (!pool) return base

  const joinResult = await joinWays.where({ geoCircleId, status: 'active' }).limit(1).get()
  const joinWay = joinResult.data[0]
  const joinEntry = safePublicEntry(joinWay && joinWay.publicEntry)

  return {
    ...base,
    displayName: cleanText(pool.displayName) || '附近生活群',
    subtitle: cleanText(pool.subtitle) || '加入附近生活群，和邻居保持联系',
    available: Boolean(joinEntry),
    ...(joinEntry ? { joinEntry } : {}),
    unavailableReason: joinEntry ? undefined : 'join_entry_unavailable'
  }
}

function publicCircle(circle, distanceM) {
  const point = circlePoint(circle)
  const result = {
    id: circle._id || circle.id || null,
    name: cleanText(circle.name) || '附近生活圈',
    center: point,
    radiusM: circleRadius(circle),
    status: circle.status || 'inactive',
    locationLabel: cleanText(circle.locationLabel) || cleanText(circle.name) || '附近生活圈'
  }
  if (distanceM !== null) result.distance = formatDistance(distanceM)
  return result
}

function safePublicEntry(entry) {
  if (!entry || typeof entry !== 'object') return null

  // 只允许 Spike 后明确标记为 public 的展示字段，拒绝透传任意企业微信字段。
  const result = {}
  if (typeof entry.kind === 'string' && entry.kind.length <= 40) result.kind = entry.kind
  if (typeof entry.path === 'string' && entry.path.length <= 300) result.path = entry.path
  if (typeof entry.displayName === 'string' && entry.displayName.length <= 80) result.displayName = entry.displayName
  return Object.keys(result).length > 0 ? result : null
}

function readOptionalPoint(event) {
  const hasLatitude = event.latitude !== undefined && event.latitude !== null && event.latitude !== ''
  const hasLongitude = event.longitude !== undefined && event.longitude !== null && event.longitude !== ''
  if (!hasLatitude && !hasLongitude) return null
  if (!hasLatitude || !hasLongitude) throw publicError('latitude and longitude are required', '经纬度需要同时提供')

  const latitude = Number(event.latitude)
  const longitude = Number(event.longitude)
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw publicError('latitude is invalid', '纬度无效')
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw publicError('longitude is invalid', '经度无效')
  }
  return { latitude, longitude }
}

function circlePoint(circle) {
  const center = circle.center || {}
  const latitude = Number(center.latitude ?? circle.latitude)
  const longitude = Number(center.longitude ?? circle.longitude)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  return { latitude, longitude }
}

function circleRadius(circle) {
  const radius = Number(circle.radiusM)
  return Number.isInteger(radius) && radius >= 0 && radius <= MAX_RADIUS_M ? radius : MAX_RADIUS_M
}

function distanceToCircle(point, circle) {
  const center = circlePoint(circle)
  if (!center) return Number.POSITIVE_INFINITY

  const earthRadiusM = 6371000
  const latitudeDelta = toRadians(center.latitude - point.latitude)
  const longitudeDelta = toRadians(center.longitude - point.longitude)
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(toRadians(point.latitude))
    * Math.cos(toRadians(center.latitude))
    * Math.sin(longitudeDelta / 2) ** 2
  return 2 * earthRadiusM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(distanceM) {
  if (!Number.isFinite(distanceM)) return ''
  if (distanceM < 1000) return `${Math.max(0, Math.round(distanceM))}m`
  return `${(distanceM / 1000).toFixed(1)}km`
}

function toRadians(value) {
  return value * Math.PI / 180
}

function cleanText(value) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function publicError(message, publicMessage) {
  const error = new Error(message)
  error.publicMessage = publicMessage
  return error
}
