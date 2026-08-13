// packageAdmin/pages/auditDetail/auditDetail.js 审核详情
const cloud = require('../../../utils/cloud')
const util = require('../../../utils/util')

Page({
  data: {
    id: '',
    item: null,
    images: [],
    reason: '',
    submitting: false
  },

  onLoad(options) {
    this.setData({ id: options.id || '' })
    this.loadDetail()
  },

  loadDetail() {
    cloud.call('item', 'detail', { id: this.data.id }).then(res => {
      const item = res.item
      item.conditionName = util.conditionName(item.condition)
      item.categoryName = util.categoryName(item.category)
      item.timeText = util.timeAgo(item.createdAt)
      item.seller = item.seller || {}
      this.setData({ item, images: item.images || [] })
    }).catch(err => wx.showToast({ title: err.message, icon: 'none' }))
  },

  previewImage(e) {
    const idx = e.currentTarget.dataset.index
    wx.previewImage({ current: this.data.images[idx], urls: this.data.images })
  },

  onReason(e) {
    this.setData({ reason: e.detail.value })
  },

  audit(e) {
    const pass = e.currentTarget.dataset.pass === '1'
    if (this.data.submitting) return
    if (!pass && !this.data.reason.trim()) {
      wx.showToast({ title: '驳回时请填写原因', icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    cloud.call('item', 'audit', {
      id: this.data.id,
      pass,
      reason: this.data.reason.trim()
    }).then(() => {
      wx.showToast({ title: pass ? '已通过' : '已驳回', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1200)
    }).catch(err => {
      this.setData({ submitting: false })
      wx.showToast({ title: err.message, icon: 'none' })
    })
  }
})
