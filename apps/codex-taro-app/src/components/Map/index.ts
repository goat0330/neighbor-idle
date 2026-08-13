/**
 * Map 组件库 — 统一出口
 *
 * 使用方式:
 *   import { MapContainer, MapPicker, NearbyMap, LocationTag } from '@components/Map'
 *
 * 组件清单:
 *   <MapContainer>  地图容器(底座)
 *   <MapPicker>     定位选点(全屏弹层)
 *   <NearbyMap>     附近物品地图视图
 *   <LocationTag>   距离/位置标签
 */

export { MapContainer } from './MapContainer'
export type { MapContainerProps } from './MapContainer'

export { MapPicker } from './MapPicker'
export type { MapPickerProps } from './MapPicker'

export { NearbyMap } from './NearbyMap'
export type { NearbyMapProps, NearbyItem } from './NearbyMap'

export { LocationTag } from './LocationTag'
export type { LocationTagProps } from './LocationTag'

export type { LatLng, MapMarker, SelectedLocation } from './types'
