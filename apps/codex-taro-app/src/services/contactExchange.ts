import { backendEnabled } from './backend'
import { cloud } from './cloud'

export type ContactRequestStatus = 'pending' | 'approved' | 'rejected' | 'revoked'

export type ContactRequest = {
  id: string
  conversationId: string
  itemId?: string
  status: ContactRequestStatus
  role: 'buyer' | 'seller'
  reason: string
  wechatId?: string
  createdAt: number
  updatedAt: number
}

const demoRecords = new Map<string, ContactRequest>()

export const contactExchange = {
  async get(conversationId: string) {
    if (backendEnabled) return cloud.call<ContactRequest | null>('contact', 'get', { conversationId })
    return demoRecords.get(conversationId)
  },

  async request(conversationId: string, reason: string) {
    if (backendEnabled) return cloud.call<ContactRequest>('contact', 'request', { conversationId, reason })
    const now = Date.now()
    const record: ContactRequest = { id: `demo-${now}`, conversationId, status: 'pending', role: 'buyer', reason, createdAt: now, updatedAt: now }
    demoRecords.set(conversationId, record)
    return record
  },

  async approve(request: ContactRequest) {
    if (backendEnabled) return cloud.call<ContactRequest>('contact', 'respond', { requestId: request.id, approved: true })
    const updated = { ...request, status: 'approved' as const, wechatId: 'neighbor_demo_only', updatedAt: Date.now() }
    demoRecords.set(request.conversationId, updated)
    return updated
  },

  async reject(request: ContactRequest) {
    if (backendEnabled) return cloud.call<ContactRequest>('contact', 'respond', { requestId: request.id, approved: false })
    const updated = { ...request, status: 'rejected' as const, updatedAt: Date.now() }
    demoRecords.set(request.conversationId, updated)
    return updated
  },

  async revoke(request: ContactRequest) {
    if (backendEnabled) return cloud.call<ContactRequest>('contact', 'revoke', { requestId: request.id })
    const updated = { ...request, status: 'revoked' as const, wechatId: undefined, updatedAt: Date.now() }
    demoRecords.set(request.conversationId, updated)
    return updated
  },
}
