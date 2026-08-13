const prohibitedRules = [
  { label: '药品或医疗违禁品', pattern: /(处方药|安眠药|减肥药|疫苗|医用麻醉)/i },
  { label: '烟草及电子烟', pattern: /(香烟|烟草|电子烟|烟弹|雪茄)/i },
  { label: '武器或管制器具', pattern: /(枪支|弹药|管制刀具|弩|电击器)/i },
  { label: '非法服务或账号交易', pattern: /(代开发票|刷单|赌博|买卖账号|外挂)/i },
]

export type SafetyCheckResult = { safe: true } | { safe: false; reason: string }

export function checkTextLocally(...parts: string[]): SafetyCheckResult {
  const content = parts.join(' ').trim()
  const matched = prohibitedRules.find((rule) => rule.pattern.test(content))
  return matched ? { safe: false, reason: matched.label } : { safe: true }
}

/** 客户端检查仅用于即时反馈；正式发布必须由云函数再次执行微信内容安全审核。 */
export async function preflightContentCheck(...parts: string[]) {
  return checkTextLocally(...parts)
}
