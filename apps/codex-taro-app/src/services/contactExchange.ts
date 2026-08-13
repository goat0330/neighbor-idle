import Taro from '@tarojs/taro'

export type ContactRequestStatus = 'idle' | 'pending' | 'approved' | 'rejected' | 'revoked'

export type ContactRequest = {
  conversationId: string
  requesterId: string
  sellerId: string
  status: ContactRequestStatus
  reason: string
  wechatId?: string
  updatedAt: number
}

const storageKey = 'neighbor-contact-requests-v1'

function readAll(): ContactRequest[] {
  return Taro.getStorageSync<ContactRequest[]>(storageKey) || []
}

function save(request: ContactRequest) {
  const records = readAll().filter((item) => item.conversationId !== request.conversationId)
  Taro.setStorageSync(storageKey, [request, ...records])
  return request
}

export const contactExchange = {
  get(conversationId: string) {
    return readAll().find((item) => item.conversationId === conversationId)
  },
  request(conversationId: string, reason: string) {
    return save({ conversationId, requesterId: 'buyer-demo', sellerId: 'seller-demo', status: 'pending', reason, updatedAt: Date.now() })
  },
  approve(conversationId: string) {
    const current = this.get(conversationId)
    if (!current) throw new Error('申请不存在')
    return save({ ...current, status: 'approved', wechatId: 'linli_demo_wechat', updatedAt: Date.now() })
  },
  reject(conversationId: string) {
    const current = this.get(conversationId)
    if (!current) throw new Error('申请不存在')
    return save({ ...current, status: 'rejected', updatedAt: Date.now() })
  },
  revoke(conversationId: string) {
    const current = this.get(conversationId)
    if (!current) throw new Error('申请不存在')
    return save({ ...current, status: 'revoked', wechatId: undefined, updatedAt: Date.now() })
  },
}

