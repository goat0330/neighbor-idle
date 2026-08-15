/**
 * 地图组件演示页
 *
 * 展示 3 个核心地图组件的用法:
 * 1. LocationTag — 距离/位置标签(商品卡片上用)
 * 2. NearbyMap — 附近物品地图视图
 * 3. MapPicker — 定位选点弹层
 *
 * 运行方式:
 *   npm run dev:weapp → 微信开发者工具打开项目根目录，project.config.json 指向 dist-weapp/
 */

import { useState, useCallback } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import { NearbyMap, MapPicker, LocationTag } from '@components/Map'
import type { NearbyItem, SelectedLocation } from '@components/Map'
import { locationService } from '@services/location'
import { distanceMeters, formatDistance } from '@utils/distance'
import styles from './index.module.scss'

// 模拟附近物品数据(实际从云函数获取)
const MOCK_ITEMS: NearbyItem[] = [
  {
    id: '1',
    title: '九成新iPhone 14 Pro 256G',
    price: 4200,
    coverImage: '',
    location: { latitude: 39.984, longitude: 116.307 }
  },
  {
    id: '2',
    title: '婴儿推车好孩子高景观',
    price: 350,
    isFree: false,
    coverImage: '',
    location: { latitude: 39.985, longitude: 116.314 }
  },
  {
    id: '3',
    title: '宜家书架搬家急出免费送',
    price: 0,
    isFree: true,
    coverImage: '',
    location: { latitude: 39.978, longitude: 116.310 }
  },
  {
    id: '4',
    title: '戴森吹风机 HD08 几乎全新',
    price: 1800,
    coverImage: '',
    location: { latitude: 39.990, longitude: 116.305 }
  }
]

export default function MapDemo() {
  const [showPicker, setShowPicker] = useState(false)
  const [selectedLoc, setSelectedLoc] = useState<SelectedLocation | null>(null)
  const [userLoc, setUserLoc] = useState<{ latitude: number; longitude: number } | null>(null)
  const [status, setStatus] = useState('点击下方按钮测试各组件')

  /** 测试定位 */
  const testLocation = useCallback(async () => {
    setStatus('正在获取定位...')
    try {
      const loc = await locationService.getCurrentLocation()
      setUserLoc(loc)
      const withAddr = await locationService.getLocationWithAddress()
      setStatus(`定位成功: ${withAddr.address || `${loc.latitude}, ${loc.longitude}`}`)
    } catch (err: any) {
      setStatus(`定位失败: ${err.message}`)
    }
  }, [])

  /** MapPicker 确认回调 */
  const onPickerConfirm = useCallback((loc: SelectedLocation) => {
    setSelectedLoc(loc)
    setStatus(`已选位置: ${loc.name || loc.address || `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`}`)
  }, [])

  /** NearbyMap 点击物品 */
  const onItemClick = useCallback((item: NearbyItem) => {
    setStatus(`点击了: ${item.title}`)
  }, [])

  return (
    <ScrollView scrollY className={styles.page}>
      {/* 标题 */}
      <View className={styles.header}>
        <Text className={styles.title}>地图组件演示</Text>
        <Text className={styles.subtitle}>Taro + React + TypeScript + 腾讯地图</Text>
      </View>

      {/* 状态显示 */}
      <View className={styles.statusBar}>
        <Text className={styles.statusText}>{status}</Text>
      </View>

      {/* ---- 1. LocationTag 演示 ---- */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>1. LocationTag 距离标签</Text>
        <Text className={styles.sectionDesc}>用于商品卡片上展示距离/小区</Text>
        <View className={styles.tagRow}>
          <LocationTag distance={300} />
          <LocationTag distance={1200} />
          <LocationTag community='南山花园' />
          <LocationTag distance={800} community='万科城' />
        </View>
        <View className={styles.tagRow}>
          <LocationTag distance={50} variant='primary' size='large' />
          <LocationTag distance={5000} variant='danger' icon='🔥' />
          <LocationTag community='附近未知' variant='primary' />
        </View>
      </View>

      {/* ---- 2. 定位测试 ---- */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>2. 定位服务测试</Text>
        <Text className={styles.sectionDesc}>测试 wx.getLocation + 逆地理编码</Text>
        <Button
          className={styles.btn}
          type='primary'
          onClick={testLocation}
        >
          获取我的定位
        </Button>
        {userLoc && (
          <View className={styles.resultCard}>
            <Text className={styles.resultLabel}>经纬度:</Text>
            <Text className={styles.resultValue}>
              {userLoc.latitude.toFixed(6)}, {userLoc.longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </View>

      {/* ---- 3. MapPicker 演示 ---- */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>3. MapPicker 定位选点</Text>
        <Text className={styles.sectionDesc}>
          全屏弹层:搜索小区 → 拖拽地图 → 确认位置
        </Text>
        <Button
          className={styles.btn}
          onClick={() => setShowPicker(true)}
        >
          打开地图选点
        </Button>
        {selectedLoc && (
          <View className={styles.resultCard}>
            <Text className={styles.resultLabel}>已选位置:</Text>
            <Text className={styles.resultValue}>{selectedLoc.name || '未命名'}</Text>
            <Text className={styles.resultSub}>{selectedLoc.address}</Text>
            <Text className={styles.resultSub}>
              {selectedLoc.latitude.toFixed(4)}, {selectedLoc.longitude.toFixed(4)}
            </Text>
            {selectedLoc.nearbyCommunities && selectedLoc.nearbyCommunities.length > 0 && (
              <View className={styles.communityList}>
                <Text className={styles.resultLabel}>附近小区:</Text>
                {selectedLoc.nearbyCommunities.map((c, i) => (
                  <View key={i} className={styles.communityItem}>
                    <Text>{c.title}</Text>
                    <Text className={styles.communityDist}>{formatDistance(c.distance)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      {/* ---- 4. NearbyMap 演示 ---- */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>4. NearbyMap 附近物品地图</Text>
        <Text className={styles.sectionDesc}>
          地图上标记附近闲置物品,点击查看详情
        </Text>
        <NearbyMap
          items={MOCK_ITEMS}
          onItemClick={onItemClick}
          height='600rpx'
        />
        <Text className={styles.hint}>
          💡 点击地图上的价格标记 → 查看物品卡片 → 点击卡片触发回调
        </Text>
      </View>

      {/* ---- 5. 距离计算演示 ---- */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>5. 距离计算</Text>
        <Text className={styles.sectionDesc}>
          模拟用户位置到各物品的距离
        </Text>
        {userLoc ? (
          <View className={styles.distList}>
            {MOCK_ITEMS.map(item => {
              const dist = distanceMeters(userLoc, item.location)
              return (
                <View key={item.id} className={styles.distItem}>
                  <Text className={styles.distTitle}>{item.title}</Text>
                  <LocationTag distance={dist} variant={dist < 1000 ? 'primary' : 'default'} />
                </View>
              )
            })}
          </View>
        ) : (
          <Text className={styles.hint}>请先点击「获取我的定位」</Text>
        )}
      </View>

      {/* ---- 底部信息 ---- */}
      <View className={styles.footer}>
        <Text className={styles.footerText}>
          腾讯地图 Key: 由本地配置提供{'\n'}
          组件架构: React + SCSS Module(组件隔离){'\n'}
          技术栈: Taro 4.x + React 18 + TypeScript 5.x
        </Text>
      </View>

      {/* ---- MapPicker 弹层 ---- */}
      <MapPicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onConfirm={onPickerConfirm}
      />
    </ScrollView>
  )
}
