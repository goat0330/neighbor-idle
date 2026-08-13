import Taro from '@tarojs/taro'
import { tencentMap } from './tencentMap'

export type UserLocation = { latitude: number; longitude: number; label: string }

export type LocationWithAddress = UserLocation & {
  address: string
  community: string
}

export async function requestUserLocation(): Promise<UserLocation | null> {
  try {
    const result = await Taro.getLocation({ type: 'gcj02' })
    return { latitude: result.latitude, longitude: result.longitude, label: '已定位到你附近' }
  } catch {
    return null
  }
}

class LocationService {
  private cache: UserLocation | null = null
  private cacheAt = 0
  private readonly ttl = 5 * 60 * 1000

  async getCurrentLocation(force = false): Promise<UserLocation> {
    if (!force && this.cache && Date.now() - this.cacheAt < this.ttl) return this.cache
    const result = await Taro.getLocation({ type: 'gcj02' })
    this.cache = { latitude: result.latitude, longitude: result.longitude, label: '当前位置' }
    this.cacheAt = Date.now()
    return this.cache
  }

  async getLocationWithAddress(force = false): Promise<LocationWithAddress> {
    const current = await this.getCurrentLocation(force)
    try {
      const result = await tencentMap.reverseGeocode(current.latitude, current.longitude)
      return {
        ...current,
        address: result.formattedAddress || result.address,
        community: result.recommendCommunity || result.nearestPOI || '',
      }
    } catch {
      return { ...current, address: '', community: '' }
    }
  }

  async openSetting() {
    const result = await Taro.openSetting()
    return result.authSetting['scope.userLocation'] === true
  }

  clearCache() {
    this.cache = null
    this.cacheAt = 0
  }
}

export const locationService = new LocationService()

export function distanceKm(from: UserLocation, latitude: number, longitude: number) {
  const toRadians = (value: number) => (value * Math.PI) / 180
  const earthRadius = 6371
  const dLat = toRadians(latitude - from.latitude)
  const dLon = toRadians(longitude - from.longitude)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(latitude)) * Math.sin(dLon / 2) ** 2
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
