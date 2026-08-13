/**
 * LocationTag — 距离/位置标签
 *
 * 小巧的标签组件,用于商品卡片、详情页等位置展示:
 * - 显示距离("距你 800m" / "1.2km")
 * - 显示小区名("南山花园")
 * - 可自定义图标和颜色
 *
 * 使用方式:
 *   <LocationTag distance={800} />           → "📍 800m"
 *   <LocationTag distance={1200} />          → "📍 1.2km"
 *   <LocationTag community="南山花园" />       → "📍 南山花园"
 *   <LocationTag distance={800} community="南山花园" />  → "📍 南山花园 · 800m"
 */

import { memo } from 'react'
import { View, Text } from '@tarojs/components'
import { formatDistance } from '@utils/distance'
import styles from './index.module.scss'

export interface LocationTagProps {
  /** 距离(米) */
  distance?: number
  /** 小区名 */
  community?: string
  /** 自定义图标(默认 📍) */
  icon?: string
  /** 样式变体:default(灰) / primary(绿) / danger(红) */
  variant?: 'default' | 'primary' | 'danger'
  /** 尺寸:small / medium / large */
  size?: 'small' | 'medium' | 'large'
  /** 自定义 className */
  className?: string
}

function LocationTagBase({
  distance,
  community,
  icon = '📍',
  variant = 'default',
  size = 'medium',
  className = ''
}: LocationTagProps) {
  // 无数据不渲染
  if (!distance && !community) return null

  const parts: string[] = []
  if (community) parts.push(community)
  if (distance && distance > 0) {
    parts.push(formatDistance(distance))
  }

  const text = parts.join(' · ')

  return (
    <View className={`${styles.tag} ${styles[variant]} ${styles[size]} ${className}`}>
      <Text className={styles.icon}>{icon}</Text>
      <Text className={styles.text}>{text}</Text>
    </View>
  )
}

export const LocationTag = memo(LocationTagBase)
