/**
 * 标签工具 —— 把云函数返回的 key 转成中文显示
 * key 必须与 src/config/index.ts 的 CATEGORIES / CONDITIONS 一致
 */

import { CATEGORIES, CONDITIONS } from '@config'

const CATEGORY_MAP: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.key, c.label])
)

const CONDITION_MAP: Record<string, string> = Object.fromEntries(
  CONDITIONS.map(c => [c.key, c.label])
)

const STATUS_MAP: Record<string, string> = {
  pending: '审核中',
  on_sale: '在售',
  reserved: '已预约',
  sold: '已售出',
  off: '已下架'
}

/** 分类中文名 */
export function categoryLabel(key: string): string {
  return CATEGORY_MAP[key] || '其他'
}

/** 成色中文名 */
export function conditionLabel(key: string): string {
  return CONDITION_MAP[key] || ''
}

/** 状态中文名 */
export function statusLabel(key: string): string {
  return STATUS_MAP[key] || ''
}
