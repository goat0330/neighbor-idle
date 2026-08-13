/**
 * 距离计算工具
 * Haversine 公式计算两个经纬度之间的球面距离
 */

import type { LatLng } from '@services/tencentMap'

/**
 * 计算两个坐标之间的距离(米)
 */
export function distanceMeters(p1: LatLng, p2: LatLng): number {
  return haversine(p1.latitude, p1.longitude, p2.latitude, p2.longitude)
}

/**
 * Haversine 公式
 */
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000 // 地球半径(米)
  const rad = (d: number) => (d * Math.PI) / 180

  const dLat = rad(lat2 - lat1)
  const dLng = rad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)

  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

/**
 * 格式化距离为可读文本
 * <1000m → "800m"
 * >=1000m → "1.2km"
 */
export function formatDistance(meters: number): string {
  if (!meters || meters < 0) return ''
  if (meters < 1000) return `${meters}m`
  return `${(meters / 1000).toFixed(1)}km`
}

/**
 * 格式化距离为简短文本(卡片上用)
 * <1000m → "800m"
 * <10km → "1.2km"
 * >=10km → "10km+"
 */
export function formatDistanceShort(meters: number): string {
  if (!meters || meters < 0) return ''
  if (meters < 1000) return `${meters}m`
  if (meters < 10000) return `${(meters / 1000).toFixed(1)}km`
  return `${Math.floor(meters / 1000)}km+`
}

/**
 * 批量计算距离并排序
 */
export function sortByDistance<T extends { location?: LatLng }>(
  items: T[],
  origin: LatLng
): (T & { distance: number })[] {
  return items
    .filter(item => item.location)
    .map(item => ({
      ...item,
      distance: distanceMeters(origin, item.location!)
    }))
    .sort((a, b) => a.distance - b.distance)
}
