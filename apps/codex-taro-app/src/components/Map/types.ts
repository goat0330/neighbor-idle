/**
 * 地图组件共享类型
 */

/** 经纬度 */
export interface LatLng {
  latitude: number
  longitude: number
}

/** 地图标记点 */
export interface MapMarker {
  id: number
  latitude: number
  longitude: number
  title?: string
  iconPath?: string
  width?: number
  height?: number
  callout?: {
    content: string
    color?: string
    fontSize?: number
    borderRadius?: number
    bgColor?: string
    padding?: number
    display?: 'BYCLICK' | 'ALWAYS'
  }
}

/** 选中位置结果 */
export interface SelectedLocation {
  latitude: number
  longitude: number
  address: string
  name: string
  /** 附近匹配的小区列表 */
  nearbyCommunities?: Array<{
    title: string
    address: string
    latitude: number
    longitude: number
    distance: number
  }>
}
