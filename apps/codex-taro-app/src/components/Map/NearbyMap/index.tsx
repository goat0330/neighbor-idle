/**
 * NearbyMap — 附近物品地图视图
 *
 * 功能:
 * - 在地图上显示附近闲置物品的标记点
 * - 点击标记 → 弹出物品卡片(图片/标题/价格/距离)
 * - 支持切换"列表视图"和"地图视图"
 * - 自动定位用户位置作为地图中心
 *
 * 使用方式:
 *   <NearbyMap
 *     items={[
 *       { id: '1', title: '九成新iPhone', price: 2000, location: {...}, coverImage: '...' }
 *     ]}
 *     onItemClick={(item) => navigateToDetail(item.id)}
 *   />
 */

import { useState, useEffect, useCallback } from 'react'
import { View, Text, Map, CoverView, CoverImage } from '@tarojs/components'
import { locationService } from '@services/location'
import { distanceMeters, formatDistance } from '@utils/distance'
import type { LatLng } from '../types'
import styles from './index.module.scss'

/** 地图上的物品标记 */
export interface NearbyItem {
  id: string
  title: string
  price: number
  isFree?: boolean
  coverImage?: string
  location: LatLng
}

export interface NearbyMapProps {
  /** 物品列表(需含 location) */
  items: NearbyItem[]
  /** 点击物品标记/卡片 */
  onItemClick?: (item: NearbyItem) => void
  /** 地图高度(默认 500rpx) */
  height?: string
  /** 自定义 className */
  className?: string
}

export function NearbyMap({
  items,
  onItemClick,
  height = '500rpx',
  className = ''
}: NearbyMapProps) {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null)
  const [center, setCenter] = useState<LatLng | null>(null)
  const [activeItem, setActiveItem] = useState<NearbyItem | null>(null)

  // 自动定位
  useEffect(() => {
    autoLocate()
  }, [])

  const autoLocate = async () => {
    try {
      const loc = await locationService.getCurrentLocation()
      setUserLocation(loc)
      setCenter(loc)
    } catch {
      // 定位失败用第一个物品位置
      if (items.length > 0) {
        setCenter(items[0].location)
      }
    }
  }

  // 构建地图 markers
  const markers = items.map((item, index) => {
    const dist = userLocation ? distanceMeters(userLocation, item.location) : 0
    return {
      id: index,
      latitude: item.location.latitude,
      longitude: item.location.longitude,
      width: 36,
      height: 36,
      iconPath: '',
      // 使用默认标记(无自定义图标时)
      callout: {
        content: item.isFree ? '免费' : `¥${item.price}`,
        color: '#fff',
        fontSize: 11,
        borderRadius: 6,
        bgColor: item.isFree ? '#07c160' : '#ff4d2e',
        padding: 6,
        anchorX: 0,
        anchorY: 0,
        borderWidth: 0,
        borderColor: 'transparent',
        display: 'ALWAYS' as const,
        textAlign: 'center' as const
      }
    }
  })

  const handleMarkerTap = useCallback((e: any) => {
    const idx = e.detail?.markerId
    if (typeof idx === 'number' && items[idx]) {
      setActiveItem(items[idx])
    }
  }, [items])

  if (!center) {
    return (
      <View className={`${styles.placeholder} ${className}`} style={{ height }}>
        <Text className={styles.placeholderText}>正在定位...</Text>
      </View>
    )
  }

  // 计算激活物品距离
  const activeDistance = activeItem && userLocation
    ? distanceMeters(userLocation, activeItem.location)
    : 0

  return (
    <View className={`${styles.container} ${className}`} style={{ height }}>
      <Map
        id='nearbyMap'
        className={styles.map}
        longitude={center.longitude}
        latitude={center.latitude}
        scale={14}
        markers={markers}
        showLocation
        enableScroll
        enableZoom
        onMarkerTap={handleMarkerTap}
        onError={(error) => console.error('[NearbyMap] map error', error)}
      />

      {/* 重新定位按钮 */}
      <CoverView className={styles.relocateBtn} onClick={autoLocate}>
        <CoverView className={styles.relocateIcon}>📍</CoverView>
      </CoverView>

      {/* 底部物品卡片(点击标记后弹出) */}
      {activeItem && (
        <CoverView className={styles.itemCard} onClick={() => onItemClick?.(activeItem)}>
          {activeItem.coverImage && (
            <CoverImage className={styles.itemImg} src={activeItem.coverImage} />
          )}
          <CoverView className={styles.itemInfo}>
            <CoverView className={styles.itemTitle}>{activeItem.title}</CoverView>
            <CoverView className={styles.itemMeta}>
              <CoverView className={styles.itemPrice}>
                {activeItem.isFree ? '免费送' : `¥${activeItem.price}`}
              </CoverView>
              {activeDistance > 0 && (
                <CoverView className={styles.itemDist}>
                  距你 {formatDistance(activeDistance)}
                </CoverView>
              )}
            </CoverView>
          </CoverView>
          <CoverView className={styles.itemArrow}>›</CoverView>
        </CoverView>
      )}

      {/* 物品数量提示 */}
      <CoverView className={styles.countBadge}>
        附近 {items.length} 件闲置
      </CoverView>
    </View>
  )
}
