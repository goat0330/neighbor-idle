/**
 * MapPicker — 定位选点组件
 *
 * 功能:
 * - 打开后自动定位用户当前位置
 * - 支持拖拽地图选择位置
 * - 顶部搜索框:输入小区名/地址 → 联想搜索 → 选中跳转
 * - 底部展示选中的位置信息(地址 + 附近小区列表)
 * - 点击「确认」返回选中的位置
 *
 * 使用方式:
 *   <MapPicker
 *     visible={showPicker}
 *     onClose={() => setShowPicker(false)}
 *     onConfirm={(loc) => { console.log(loc) }}
 *   />
 */

import { useState, useEffect, useCallback } from 'react'
import { View, Text, Input, ScrollView, Map } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { locationService } from '@services/location'
import { tencentMap, type POIItem, type SuggestItem } from '@services/tencentMap'
import { formatDistance } from '@utils/distance'
import { debounce } from '@utils/format'
import type { SelectedLocation, LatLng } from '../types'
import styles from './index.module.scss'

export interface MapPickerProps {
  /** 是否显示 */
  visible: boolean
  /** 初始中心点(可选) */
  initialCenter?: LatLng
  /** 关闭回调 */
  onClose: () => void
  /** 确认选择回调 */
  onConfirm: (location: SelectedLocation) => void
}

export function MapPicker({ visible, initialCenter, onClose, onConfirm }: MapPickerProps) {
  const [center, setCenter] = useState<LatLng | null>(initialCenter || null)
  const [keyword, setKeyword] = useState('')
  const [suggestList, setSuggestList] = useState<SuggestItem[]>([])
  const [nearbyList, setNearbyList] = useState<POIItem[]>([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [selectedName, setSelectedName] = useState('')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)

  // 打开时自动定位
  useEffect(() => {
    if (!visible) return
    if (initialCenter) {
      setCenter(initialCenter)
      loadNearby(initialCenter.latitude, initialCenter.longitude)
      return
    }
    autoLocate()
  }, [visible, initialCenter])

  // 搜索联想(防抖)
  const doSearch = useCallback(
    debounce(async (kw: string) => {
      if (!kw.trim()) {
        setSuggestList([])
        setSearching(false)
        return
      }
      try {
        const centerLoc = center || undefined
        const list = await tencentMap.suggestAddress(
          kw,
          centerLoc?.latitude,
          centerLoc?.longitude
        )
        setSuggestList(list)
      } catch (err) {
        console.error('[MapPicker] suggestAddress error', err)
      } finally {
        setSearching(false)
      }
    }, 400),
    [center]
  )

  const onKeywordInput = (e: any) => {
    const kw = e.detail.value
    setKeyword(kw)
    if (kw.trim()) setSearching(true)
    doSearch(kw)
  }

  /** 自动定位 */
  const autoLocate = async () => {
    setLoading(true)
    try {
      const loc = await locationService.getCurrentLocation()
      setCenter(loc)
      await loadNearby(loc.latitude, loc.longitude)
      // 逆地理编码获取地址
      const geo = await locationService.getLocationWithAddress()
      setSelectedAddress(geo.address)
      setSelectedName(geo.community || '')
    } catch (err: any) {
      console.error('[MapPicker] autoLocate', err)
      // 定位失败用默认位置(北京)
      const fallback: LatLng = { latitude: 39.98, longitude: 116.30 }
      setCenter(fallback)
      await loadNearby(fallback.latitude, fallback.longitude)
    } finally {
      setLoading(false)
    }
  }

  /** 加载附近小区 */
  const loadNearby = async (lat: number, lng: number) => {
    try {
      const { list } = await tencentMap.searchPOI(lat, lng, '住宅小区', 5000, 1)
      setNearbyList(list)
    } catch (err) {
      console.error('[MapPicker] loadNearby', err)
      setNearbyList([])
    }
  }

  /** 选中搜索结果 → 跳转地图 */
  const onSelectSuggest = (item: SuggestItem) => {
    setCenter(item.location)
    setSelectedAddress(item.address)
    setSelectedName(item.title)
    setKeyword('')
    setSuggestList([])
    loadNearby(item.location.latitude, item.location.longitude)
  }

  /** 选中附近小区 */
  const onSelectNearby = (item: POIItem) => {
    setCenter(item.location)
    setSelectedAddress(item.address)
    setSelectedName(item.title)
    loadNearby(item.location.latitude, item.location.longitude)
  }

  /** 确认选择 */
  const handleConfirm = () => {
    if (!center) {
      return
    }
    const result: SelectedLocation = {
      latitude: center.latitude,
      longitude: center.longitude,
      address: selectedAddress,
      name: selectedName,
      nearbyCommunities: nearbyList.slice(0, 5).map(p => ({
        title: p.title,
        address: p.address,
        latitude: p.location.latitude,
        longitude: p.location.longitude,
        distance: p.distance
      }))
    }
    onConfirm(result)
    onClose()
  }

  if (!visible) return null

  return (
    <View className={styles.wrapper}>
      {/* 搜索栏 */}
      <View className={styles.searchBar}>
        <Input
          className={styles.searchInput}
          placeholder='搜索小区/地址'
          value={keyword}
          onInput={onKeywordInput}
          confirmType='search'
        />
        {keyword && (
          <View className={styles.clearBtn} onClick={() => { setKeyword(''); setSuggestList([]) }}>
            <Text>✕</Text>
          </View>
        )}
      </View>

      {/* 搜索联想列表 */}
      {suggestList.length > 0 && (
        <ScrollView scrollY className={styles.suggestList}>
          {suggestList.map(item => (
            <View
              key={item.id}
              className={styles.suggestItem}
              onClick={() => onSelectSuggest(item)}
            >
              <View className={styles.suggestTitle}>{item.title}</View>
              <View className={styles.suggestAddr}>{item.address}</View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* 地图区域 */}
      {center && (
        <View className={styles.mapArea}>
          <Map
            id='pickerMap'
            className={styles.map}
            longitude={center.longitude}
            latitude={center.latitude}
            scale={16}
            showLocation
            enableScroll
            enableZoom
            onRegionChange={(e: any) => {
              // 拖拽结束后更新中心点
              if (e.type === 'end' && e.causedBy === 'drag') {
                // 简化处理:用 Taro.createMapContext 获取中心
                const ctx = Taro.createMapContext ? Taro.createMapContext('pickerMap') : null
                if (ctx && ctx.getCenterLocation) {
                  ctx.getCenterLocation({
                    success: (res: any) => {
                      const newCenter = { latitude: res.latitude, longitude: res.longitude }
                      setCenter(newCenter)
                      setSelectedName('地图选点')
                      setSelectedAddress('正在获取该位置地址…')
                      Promise.all([
                        loadNearby(res.latitude, res.longitude),
                        tencentMap.reverseGeocode(res.latitude, res.longitude),
                      ]).then(([, geo]) => {
                        setSelectedName(geo.recommendCommunity || geo.nearestPOI || '地图选点')
                        setSelectedAddress(geo.formattedAddress || geo.address)
                      }).catch(() => setSelectedAddress('已选择地图中心位置'))
                    }
                  })
                }
              }
            }}
            onError={(error) => console.error('[MapPicker] map error', error)}
          />
          {/* 中心十字标 */}
          <View className={styles.centerMarker}>
            <View className={styles.markerDot} />
          </View>
        </View>
      )}

      {/* 底部信息面板 */}
      <View className={styles.bottomPanel}>
        {/* 当前选中位置 */}
        <View className={styles.selectedInfo}>
          <Text className={styles.selectedName}>{selectedName || '请选择位置'}</Text>
          {selectedAddress && (
            <Text className={styles.selectedAddr}>{selectedAddress}</Text>
          )}
        </View>

        {/* 附近小区列表 */}
        {nearbyList.length > 0 && (
          <ScrollView scrollY className={styles.nearbyList}>
            <View className={styles.nearbyTitle}>附近小区</View>
            {nearbyList.slice(0, 8).map(item => (
              <View
                key={item.id}
                className={styles.nearbyItem}
                onClick={() => onSelectNearby(item)}
              >
                <View className={styles.nearbyInfo}>
                  <Text className={styles.nearbyName}>{item.title}</Text>
                  <Text className={styles.nearbyAddr}>{item.address}</Text>
                </View>
                <Text className={styles.nearbyDist}>{formatDistance(item.distance)}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* 操作按钮 */}
        <View className={styles.actions}>
          <View className={styles.relocateBtn} onClick={autoLocate}>
            <Text>📍 重新定位</Text>
          </View>
          <View className={styles.confirmBtn} onClick={handleConfirm}>
            <Text>确认位置</Text>
          </View>
        </View>
      </View>

      {/* 关闭按钮 */}
      <View className={styles.closeBtn} onClick={onClose}>
        <Text>✕</Text>
      </View>

      {/* 加载遮罩 */}
      {loading && (
        <View className={styles.loadingMask}>
          <Text>正在定位...</Text>
        </View>
      )}
    </View>
  )
}
