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
import './index.scss'

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
      if (!tencentMap.isAvailable()) {
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
      if (tencentMap.isAvailable()) {
        await loadNearby(loc.latitude, loc.longitude)
        // 逆地理编码获取地址
        const geo = await locationService.getLocationWithAddress()
        setSelectedAddress(geo.address)
        setSelectedName(geo.community || '')
      } else {
        setSelectedAddress('仅显示社区级位置，保护隐私安全')
        setSelectedName('金水花园')
      }
    } catch (err: any) {
      if (tencentMap.isAvailable()) console.warn('[MapPicker] autoLocate', err)
      // 预览或未授权时使用当前产品的社区级默认位置；真机授权后会被真实位置替换。
      const fallback: LatLng = { latitude: 31.2304, longitude: 121.4737 }
      setCenter(fallback)
      setSelectedName('金水花园')
      setSelectedAddress('仅显示社区级位置，保护隐私安全')
      if (tencentMap.isAvailable()) await loadNearby(fallback.latitude, fallback.longitude)
    } finally {
      setLoading(false)
    }
  }

  /** 加载附近小区 */
  const loadNearby = async (lat: number, lng: number) => {
    if (!tencentMap.isAvailable()) {
      setNearbyList([])
      return
    }
    try {
      const { list } = await tencentMap.searchPOI(lat, lng, '住宅小区', 5000, 1)
      setNearbyList(list)
    } catch (err) {
      console.warn('[MapPicker] loadNearby', err)
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
    <View className='wrapper'>
      {/* 搜索栏 */}
      <View className='searchBar'>
        <Input
          className='searchInput'
          placeholder='搜索小区/地址'
          value={keyword}
          onInput={onKeywordInput}
          confirmType='search'
        />
        {keyword && (
          <View className='clearBtn' onClick={() => { setKeyword(''); setSuggestList([]) }}>
            <Text>✕</Text>
          </View>
        )}
      </View>

      {/* 搜索联想列表 */}
      {suggestList.length > 0 && (
        <ScrollView scrollY className='suggestList'>
          {suggestList.map(item => (
            <View
              key={item.id}
              className='suggestItem'
              onClick={() => onSelectSuggest(item)}
            >
              <View className='suggestTitle'>{item.title}</View>
              <View className='suggestAddr'>{item.address}</View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* 地图区域 */}
      {center && (
        <View className='mapArea'>
          {typeof window === 'undefined' ? (
            <Map
              id='pickerMap'
              className='map'
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
                        if (!tencentMap.isAvailable()) {
                          setSelectedAddress('已选择地图中心位置')
                          return
                        }
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
              onError={(error) => console.warn('[MapPicker] map error', error)}
            />
          ) : (
            <View className='map map-placeholder'>
              <Text>地图预览</Text>
              <Text>金水花园</Text>
            </View>
          )}
          {/* 中心十字标 */}
          <View className='centerMarker'>
            <View className='markerDot' />
          </View>
        </View>
      )}

      {/* 底部信息面板 */}
      <View className='bottomPanel'>
        {/* 当前选中位置 */}
        <View className='selectedInfo'>
          <Text className='selectedName'>{selectedName || '请选择位置'}</Text>
          {selectedAddress && (
            <Text className='selectedAddr'>{selectedAddress}</Text>
          )}
        </View>

        {/* 附近小区列表 */}
        {nearbyList.length > 0 && (
          <ScrollView scrollY className='nearbyList'>
            <View className='nearbyTitle'>附近小区</View>
            {nearbyList.slice(0, 8).map(item => (
              <View
                key={item.id}
                className='nearbyItem'
                onClick={() => onSelectNearby(item)}
              >
                <View className='nearbyInfo'>
                  <Text className='nearbyName'>{item.title}</Text>
                  <Text className='nearbyAddr'>{item.address}</Text>
                </View>
                <Text className='nearbyDist'>{formatDistance(item.distance)}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* 操作按钮 */}
        <View className='actions'>
          <View className='relocateBtn' onClick={autoLocate}>
            <Text>📍 重新定位</Text>
          </View>
          <View className='confirmBtn' onClick={handleConfirm}>
            <Text>确认位置</Text>
          </View>
        </View>
      </View>

      {/* 关闭按钮 */}
      <View className='closeBtn' onClick={onClose}>
        <Text>✕</Text>
      </View>

      {/* 加载遮罩 */}
      {loading && (
        <View className='loadingMask'>
          <Text>正在定位...</Text>
        </View>
      )}
    </View>
  )
}
