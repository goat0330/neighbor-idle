/**
 * 格式化工具
 */

/** 相对时间("3分钟前""2小时前""昨天""3天前") */
export function timeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < day * 2) return '昨天'
  if (diff < day * 7) return `${Math.floor(diff / day)}天前`
  const d = new Date(timestamp)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

/** 价格文字("¥50""免费送""面议") */
export function priceText(price: number, isFree: boolean = false, negotiable: boolean = false): string {
  if (isFree) return '免费送'
  if (!price || price <= 0) return '面议'
  return `¥${price}`
}

/** 金额千分位 */
export function formatMoney(num: number): string {
  return num.toLocaleString('zh-CN')
}

/** 手机号脱敏("138****8888") */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

/** 防抖 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
