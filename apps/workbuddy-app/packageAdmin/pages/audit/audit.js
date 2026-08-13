// packageAdmin/pages/audit/audit.js 内容审核列表(管理员)
const cloud = require('../../utils/cloud')
const util = require('../../utils/util')

Page({
  data: {
    list: [],
    loading: false,
    isAdmin: false
  },

  onShow() {
    this.checkAdmin()
  },

  checkAdmin() {
    cloud.call('item', 'auditList').then(res => {
      const list = res.list.map(i => ({
        ...i,
        cover: (i.images && i.images[0]) || '',
        priceText: util.priceText(i.price),
        timeText: util.timeAgo(i.createdAt),
        conditionName: util.conditionName(i.condition),
        categoryName: util.categoryName(i.category)
      }))
      this.setData({ list, loading: false, isAdmin: true })
    }).catch(err => {
      this.setData({ isAdmin: false })
      wx.showToast({ title: '无审核权限:' + err.message, icon: 'none' })
    })
  },

  goDetail(e) {
    wx.navigateTo({ url: '/packageAdmin/pages/auditDetail/auditDetail?id=' + e.currentTarget.dataset.id })
  },

  previewImage(e) {
    const urls = this.data.list[e.currentTarget.dataset.index].images || []
    wx.previewImage({ current: urls[0], urls })
  }
})
