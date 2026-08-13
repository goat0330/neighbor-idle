/**
 * MapContainer — 地图容器组件
 *
 * 封装 Taro <Map> 原生组件,提供统一 API:
 * - 中心点控制
 * - 标记点管理
 * - 点击/拖拽事件
 * - 缩放控制
 *
 * 这个组件是所有地图场景的底座,其他组件(NearbyMap/MapPicker)基于它构建
 *
 * Props:
 *   <MapContainer
 *     center={{ latitude: 39.98, longitude: 116.30 }}
 *     markers={markers}
 *     onMarkerTap={(marker) => ...}
 *   />
 */

import { memo, useCallback, useId } from 'react'
import { Map, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { LatLng, MapMarker } from '../types'
import styles from './index.module.scss'

export interface MapContainerProps {
  /** 地图中心点 */
  center: LatLng
  /** 缩放级别(5~18,默认 16) */
  zoom?: number
  /** 标记点列表 */
  markers?: MapMarker[]
  /** 是否显示当前位置(蓝点) */
  showLocation?: boolean
  /** 是否启用拖拽 */
  enableScroll?: boolean
  /** 是否启用缩放 */
  enableZoom?: boolean
  /** 是否启用旋转 */
  enableRotate?: boolean
  /** 地图高度(默认 400rpx) */
  height?: string
  /** 点击地图空白处 */
  onTap?: () => void
  /** 点击标记点 */
  onMarkerTap?: (marker: MapMarker) => void
  /** 地图区域变化(拖拽/缩放) */
  onRegionChange?: (center: LatLng) => void
  /** 自定义覆盖内容(浮在地图上方) */
  overlay?: React.ReactNode
  /** 自定义 className */
  className?: string
}

function MapContainerBase({
  center,
  zoom = 16,
  markers = [],
  showLocation = true,
  enableScroll = true,
  enableZoom = true,
  enableRotate = false,
  height = '400rpx',
  onTap,
  onMarkerTap,
  onRegionChange,
  overlay,
  className = ''
}: MapContainerProps) {
  const reactId = useId()
  const mapId = `neighbor-map-${reactId.replace(/:/g, '')}`
  /** Taro Map markers 格式转换 */
  const mapMarkers = markers.map(m => ({
    id: m.id,
    latitude: m.latitude,
    longitude: m.longitude,
    title: m.title,
    iconPath: m.iconPath || '',
    width: m.width || 32,
    height: m.height || 32,
    callout: m.callout ? {
      content: m.callout.content,
      color: m.callout.color || '#1a1a1a',
      fontSize: m.callout.fontSize || 12,
      borderRadius: m.callout.borderRadius || 8,
      bgColor: m.callout.bgColor || '#ffffff',
      padding: m.callout.padding || 8,
      anchorX: 0,
      anchorY: 0,
      borderWidth: 0,
      borderColor: 'transparent',
      display: m.callout.display || 'BYCLICK',
      textAlign: 'center' as const
    } : undefined
  }))

  const handleMarkerTap = useCallback((e: any) => {
    const markerId = e.detail?.markerId
    const marker = markers.find(m => m.id === markerId)
    if (marker && onMarkerTap) {
      onMarkerTap(marker)
    }
  }, [markers, onMarkerTap])

  const handleRegionChange = useCallback((e: any) => {
    if (e.type === 'end' && e.causedBy === 'drag' && onRegionChange) {
      Taro.createMapContext(mapId).getCenterLocation({
        success: ({ latitude, longitude }) => onRegionChange({ latitude, longitude }),
      })
    }
  }, [mapId, onRegionChange])

  return (
    <View className={`${styles.container} ${className}`} style={{ height }}>
      <Map
        id={mapId}
        className={styles.map}
        longitude={center.longitude}
        latitude={center.latitude}
        scale={zoom}
        markers={mapMarkers}
        showLocation={showLocation}
        enableScroll={enableScroll}
        enableZoom={enableZoom}
        enableRotate={enableRotate}
        enableOverlooking={false}
        onClick={onTap}
        onMarkerTap={handleMarkerTap}
        onRegionChange={handleRegionChange}
        onError={(error) => console.error('[MapContainer] map error', error)}
      />
      {overlay && (
        <View className={styles.overlay}>
          {overlay}
        </View>
      )}
    </View>
  )
}

export const MapContainer = memo(MapContainerBase)
