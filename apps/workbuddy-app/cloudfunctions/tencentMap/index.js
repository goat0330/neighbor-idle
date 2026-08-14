// 云函数 tencentMap: 腾讯位置服务 WebService 代理
// Key 只从云函数环境变量读取，不进入小程序编译产物。
const cloud = require('wx-server-sdk')
const https = require('https')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const BASE_URL = 'https://apis.map.qq.com'
const REQUEST_TIMEOUT_MS = 8000
const DEFAULT_RADIUS = 5000
const MAX_RADIUS = 10000
const PAGE_SIZE = 20
const MAX_PAGE = 10

const ok = data => ({ code: 0, data })
const fail = msg => ({ code: -1, msg })

class MapRequestError extends Error {
  constructor(message, publicMessage = message) {
    super(message)
    this.publicMessage = publicMessage
  }
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()
  const action = event.action || ''

  if (!OPENID) return fail('请先登录')

  try {
    const key = getMapKey()

    switch (action) {
      case 'reverseGeocode':
        return ok(await reverseGeocode(event, key))
      case 'searchPOI':
        return ok(await searchPOI(event, key))
      case 'searchKeyword':
        return ok(await searchKeyword(event, key))
      case 'suggestAddress':
        return ok(await suggestAddress(event, key))
      default:
        return fail('未知地图操作')
    }
  } catch (error) {
    console.error('[tencentMap]', action, error && error.message)
    return fail(toPublicMessage(error))
  }
}

function getMapKey() {
  const key = String(process.env.TENCENT_MAP_KEY || '').trim()
  if (!key) {
    throw new MapRequestError('TENCENT_MAP_KEY is not configured', '地图服务尚未配置')
  }
  return key
}

function readPoint(event) {
  const latitude = readNumber(event.latitude, 'latitude', -90, 90)
  const longitude = readNumber(event.longitude, 'longitude', -180, 180)
  return { latitude, longitude }
}

function readNumber(value, name, min, max) {
  if (value === undefined || value === null || value === '') {
    throw new MapRequestError(`${name} is required`, `缺少${name === 'latitude' ? '纬度' : '经度'}`)
  }

  const number = Number(value)
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new MapRequestError(`${name} is invalid`, `${name === 'latitude' ? '纬度' : '经度'}无效`)
  }
  return number
}

function readKeyword(value) {
  if (typeof value !== 'string') throw new MapRequestError('keyword is required', '请输入搜索关键词')
  const keyword = value.trim()
  if (!keyword || keyword.length > 40) {
    throw new MapRequestError('keyword is invalid', '搜索关键词长度应为 1-40 个字符')
  }
  return keyword
}

function readRadius(value) {
  const radius = value === undefined || value === null || value === '' ? DEFAULT_RADIUS : Number(value)
  if (!Number.isInteger(radius) || radius < 100 || radius > MAX_RADIUS) {
    throw new MapRequestError('radius is invalid', '搜索半径应为 100-10000 米')
  }
  return radius
}

function readPage(value) {
  const page = value === undefined || value === null || value === '' ? 1 : Number(value)
  if (!Number.isInteger(page) || page < 1 || page > MAX_PAGE) {
    throw new MapRequestError('page is invalid', '页码无效')
  }
  return page
}

async function reverseGeocode(event, key) {
  const { latitude, longitude } = readPoint(event)
  const payload = await requestTencent('/ws/geocoder/v1/', {
    location: `${latitude},${longitude}`,
    get_poi: '1'
  }, key)
  const result = payload.result || {}
  const pois = Array.isArray(result.pois) ? result.pois : []
  const communityPoi = pois.find(item => /住宅|小区|花园|公寓|大厦|村/.test(item.category || item.title || ''))
  const addressComponent = result.address_component || {}

  return {
    address: result.address || '',
    formattedAddress: result.formatted_addresses?.recommend || result.address || '',
    province: addressComponent.province || '',
    city: addressComponent.city || '',
    district: addressComponent.district || '',
    street: addressComponent.street || '',
    streetNumber: addressComponent.street_number || '',
    nearestPOI: pois[0]?.title || '',
    recommendCommunity: communityPoi?.title || ''
  }
}

async function searchPOI(event, key) {
  const { latitude, longitude } = readPoint(event)
  const keyword = typeof event.keyword === 'string' && event.keyword.trim()
    ? readKeyword(event.keyword)
    : '住宅小区'
  const radius = readRadius(event.radius)
  const page = readPage(event.page)
  const payload = await requestTencent('/ws/place/v1/search', {
    boundary: `nearby(${latitude},${longitude},${radius})`,
    keyword,
    page_size: String(PAGE_SIZE),
    page_index: String(page),
    orderby: '_distance'
  }, key)

  return {
    list: normalizePOIs(payload.data),
    total: Number(payload.count || 0)
  }
}

async function searchKeyword(event, key) {
  const keyword = readKeyword(event.keyword)
  const params = {
    keyword,
    page_size: String(PAGE_SIZE),
    page_index: '1'
  }

  if (event.latitude !== undefined && event.longitude !== undefined) {
    const { latitude, longitude } = readPoint(event)
    params.boundary = `nearby(${latitude},${longitude},10000)`
    params.orderby = '_distance'
  }

  const payload = await requestTencent('/ws/place/v1/search', params, key)
  return normalizeSuggestions(payload.data)
}

async function suggestAddress(event, key) {
  const keyword = readKeyword(event.keyword)
  const params = { keyword, region: '全国' }

  if (event.latitude !== undefined || event.longitude !== undefined) {
    const { latitude, longitude } = readPoint(event)
    params.location = `${latitude},${longitude}`
  }

  const payload = await requestTencent('/ws/place/v1/suggestion', params, key)
  return normalizeSuggestions(payload.data)
}

function normalizePOIs(items) {
  return (Array.isArray(items) ? items : []).map(item => ({
    id: item.id || '',
    title: item.title || '',
    address: item.address || '',
    category: item.category || '',
    location: {
      latitude: Number(item.location?.lat || 0),
      longitude: Number(item.location?.lng || 0)
    },
    distance: Math.round(Number(item._distance || 0))
  }))
}

function normalizeSuggestions(items) {
  return (Array.isArray(items) ? items : []).map(item => ({
    id: item.id || '',
    title: item.title || '',
    address: item.address || '',
    category: item.category || '',
    location: {
      latitude: Number(item.location?.lat || 0),
      longitude: Number(item.location?.lng || 0)
    }
  }))
}

function requestTencent(path, params, key) {
  const query = Object.entries({ ...params, key })
    .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    .join('&')
  const url = `${BASE_URL}${path}?${query}`

  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { Accept: 'application/json' } }, response => {
      let body = ''
      response.setEncoding('utf8')
      response.on('data', chunk => { body += chunk })
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new MapRequestError(`Tencent HTTP ${response.statusCode}`, '地图服务暂时不可用'))
          return
        }

        try {
          const payload = JSON.parse(body)
          if (payload.status !== 0) {
            reject(new MapRequestError(`Tencent status ${payload.status}: ${payload.message || ''}`, '地图查询失败'))
            return
          }
          resolve(payload)
        } catch {
          reject(new MapRequestError('Tencent returned invalid JSON', '地图服务返回异常'))
        }
      })
    })

    request.setTimeout(REQUEST_TIMEOUT_MS, () => {
      request.destroy(new MapRequestError('Tencent request timeout', '地图服务请求超时'))
    })
    request.on('error', error => reject(new MapRequestError(error.message, '地图服务暂时不可用')))
  })
}

function toPublicMessage(error) {
  if (error && error.publicMessage) return error.publicMessage
  return '地图服务暂时不可用'
}
