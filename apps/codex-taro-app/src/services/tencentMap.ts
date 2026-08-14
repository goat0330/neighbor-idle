/**
 * 腾讯地图 Web Service API 封装
 *
 * 功能:
 * - reverseGeocode()  逆地理编码(经纬度 → 地址文字)
 * - searchPOI()       周边搜索(搜索坐标附近的住宅小区/POI)
 * - searchKeyword()   关键词搜索(输入"万科" → 返回匹配的小区+坐标)
 * - suggestAddress()  输入提示(输入"南山" → 返回候选地址列表)
 *
 * 使用方式:
 *   import { tencentMap } from '@services/tencentMap'
 *   const result = await tencentMap.reverseGeocode(39.98, 116.30)
 *
 * 注意:
 *   微信小程序生产环境通过 tencentMap CloudBase 云函数访问腾讯接口，Key 只在云函数环境变量中配置。
 *   未配置 CloudBase 时，H5 本地预览可使用 TARO_APP_TENCENT_MAP_KEY 直连调试。
 */

import Taro from '@tarojs/taro'
import { APP_CONFIG } from '@config/index'
import { cloud } from './cloud'

// ---- 类型定义 ----

/** 经纬度坐标 */
export interface LatLng {
  latitude: number
  longitude: number
}

/** 逆地理编码结果 */
export interface ReverseGeocodeResult {
  address: string              // 完整地址
  formattedAddress: string     // 格式化地址
  province: string
  city: string
  district: string
  street: string
  streetNumber: string
  /** 最近 POI(小区/地标) */
  nearestPOI?: string
  /** 推荐小区名 */
  recommendCommunity?: string
}

/** POI(兴趣点) */
export interface POIItem {
  id: string
  title: string                // 名称(如"万科城市花园")
  address: string
  category: string             // 类别(如"住宅小区")
  location: LatLng
  distance: number             // 距搜索点距离(米)
}

/** 输入提示候选 */
export interface SuggestItem {
  id: string
  title: string
  address: string
  location: LatLng
  category: string
}

// ---- 核心实现 ----

class TencentMapService {
  private key: string
  private baseUrl: string

  constructor() {
    this.key = APP_CONFIG.TENCENT_MAP_KEY
    this.baseUrl = APP_CONFIG.TENCENT_MAP_BASE
  }

  private useCloudBackend() {
    return Boolean(APP_CONFIG.CLOUD_ENV) && typeof wx !== 'undefined' && Boolean(wx.cloud)
  }

  isAvailable() {
    return this.useCloudBackend() || Boolean(this.key)
  }

  private assertDirectConfigured() {
    if (!this.key) {
      throw new Error('腾讯地图服务未配置，请设置 TARO_APP_CLOUD_ENV；本地 H5 调试才需要 TARO_APP_TENCENT_MAP_KEY')
    }
  }

  /**
   * 逆地理编码:经纬度 → 地址
   * 文档: https://lbs.qq.com/service/webService/webServiceGuide/webServiceGcoder
   */
  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
    if (this.useCloudBackend()) {
      return cloud.call<ReverseGeocodeResult>('tencentMap', 'reverseGeocode', { latitude: lat, longitude: lng })
    }

    this.assertDirectConfigured()
    const location = `${lat},${lng}`
    const params = { location, key: this.key, get_poi: '1' }

    try {
      const res = await Taro.request({
        url: `${this.baseUrl}/ws/geocoder/v1/`,
        data: params,
        method: 'GET'
      })

      if (res.data?.status !== 0) {
        throw new Error(res.data?.message || '逆地理编码失败')
      }

      const d = res.data.result
      const pois = d.pois || []

      // 尝试从 POI 中找住宅小区名
      const communityPoi = pois.find((p: any) =>
        /住宅|小区|花园|公寓|大厦|村/.test(p.category || p.title || '')
      )

      return {
        address: d.address || '',
        formattedAddress: d.formatted_addresses?.recommend || d.address || '',
        province: d.address_component?.province || '',
        city: d.address_component?.city || '',
        district: d.address_component?.district || '',
        street: d.address_component?.street || '',
        streetNumber: d.address_component?.street_number || '',
        nearestPOI: pois[0]?.title || '',
        recommendCommunity: communityPoi?.title || ''
      }
    } catch (err: any) {
      console.error('[tencentMap.reverseGeocode]', err)
      throw this.wrapError(err)
    }
  }

  /**
   * 周边搜索:搜索坐标附近的 POI(默认搜索住宅小区)
   * 文档: https://lbs.qq.com/service/webService/webServiceGuide/webServiceSearch
   *
   * @param lat 纬度
   * @param lng 经度
   * @param keyword 搜索关键词(如"小区""学校""超市")
   * @param radius 搜索半径(米),默认 5km
   * @param page 分页(第几页)
   */
  async searchPOI(
    lat: number,
    lng: number,
    keyword: string = '住宅小区',
    radius: number = APP_CONFIG.NEARBY_RADIUS,
    page: number = 1
  ): Promise<{ list: POIItem[]; total: number }> {
    if (this.useCloudBackend()) {
      return cloud.call<{ list: POIItem[]; total: number }>('tencentMap', 'searchPOI', {
        latitude: lat,
        longitude: lng,
        keyword,
        radius,
        page
      })
    }

    this.assertDirectConfigured()
    const location = `${lat},${lng}`
    const params = {
      boundary: `nearby(${location},${radius})`,
      keyword,
      page_size: String(APP_CONFIG.NEARBY_PAGE_SIZE),
      page_index: String(page),
      orderby: '_distance',       // 按距离排序
      key: this.key
    }

    try {
      const res = await Taro.request({
        url: `${this.baseUrl}/ws/place/v1/search`,
        data: params,
        method: 'GET'
      })

      if (res.data?.status !== 0) {
        throw new Error(res.data?.message || '周边搜索失败')
      }

      const data = res.data.data || []
      const list: POIItem[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        address: item.address,
        category: item.category,
        location: {
          latitude: item.location.lat,
          longitude: item.location.lng
        },
        distance: Math.round(item._distance || 0)
      }))

      return { list, total: res.data.count || 0 }
    } catch (err: any) {
      console.error('[tencentMap.searchPOI]', err)
      throw this.wrapError(err)
    }
  }

  /**
   * 关键词搜索:输入"万科" → 返回匹配的地点列表
   * 用于发布/认证时搜索小区名
   *
   * @param keyword 搜索词
   * @param lat 附近纬度(可选,用于优先返回附近结果)
   * @param lng 附近经度(可选)
   */
  async searchKeyword(
    keyword: string,
    lat?: number,
    lng?: number
  ): Promise<SuggestItem[]> {
    if (this.useCloudBackend()) {
      return cloud.call<SuggestItem[]>('tencentMap', 'searchKeyword', {
        keyword,
        ...(lat !== undefined && lng !== undefined ? { latitude: lat, longitude: lng } : {})
      })
    }

    this.assertDirectConfigured()
    const params: Record<string, string> = {
      keyword,
      page_size: '10',
      page_index: '1',
      key: this.key
    }

    // 如果有定位,优先返回附近结果
    if (lat !== undefined && lng !== undefined) {
      params.boundary = `nearby(${lat},${lng},10000)`
      params.orderby = '_distance'
    }

    try {
      const res = await Taro.request({
        url: `${this.baseUrl}/ws/place/v1/search`,
        data: params,
        method: 'GET'
      })

      if (res.data?.status !== 0) {
        throw new Error(res.data?.message || '关键词搜索失败')
      }

      const data = res.data.data || []
      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        address: item.address,
        category: item.category,
        location: {
          latitude: item.location.lat,
          longitude: item.location.lng
        }
      }))
    } catch (err: any) {
      console.error('[tencentMap.searchKeyword]', err)
      throw this.wrapError(err)
    }
  }

  /**
   * 输入提示:输入"南山" → 返回候选地址列表(类似搜索联想)
   * 用于自动补全输入框
   */
  async suggestAddress(
    keyword: string,
    lat?: number,
    lng?: number
  ): Promise<SuggestItem[]> {
    if (this.useCloudBackend()) {
      return cloud.call<SuggestItem[]>('tencentMap', 'suggestAddress', {
        keyword,
        ...(lat !== undefined && lng !== undefined ? { latitude: lat, longitude: lng } : {})
      })
    }

    this.assertDirectConfigured()
    const params: Record<string, string> = {
      keyword,
      key: this.key,
      region: '全国'
    }

    if (lat !== undefined && lng !== undefined) {
      params.location = `${lat},${lng}`
    }

    try {
      const res = await Taro.request({
        url: `${this.baseUrl}/ws/place/v1/suggestion`,
        data: params,
        method: 'GET'
      })

      if (res.data?.status !== 0) {
        throw new Error(res.data?.message || '输入提示失败')
      }

      const data = res.data.data || []
      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        address: item.address,
        category: item.category,
        location: {
          latitude: item.location?.lat || 0,
          longitude: item.location?.lng || 0
        }
      }))
    } catch (err: any) {
      console.error('[tencentMap.suggestAddress]', err)
      throw this.wrapError(err)
    }
  }

  /** 统一错误包装 */
  private wrapError(err: any): Error {
    const msg = err?.errMsg || err?.message || ''
    if (/url not in domain|domain list/.test(msg)) {
      return new Error('请在小程序后台配置 request 合法域名: https://apis.map.qq.com')
    }
    if (/key|invalid key/i.test(msg)) {
      return new Error('腾讯地图 Key 无效,请检查 src/config/index.ts 中的 TENCENT_MAP_KEY')
    }
    return new Error(msg || '地图服务异常')
  }
}

// 单例导出
export const tencentMap = new TencentMapService()
