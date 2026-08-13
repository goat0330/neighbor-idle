// pages/myWants/myWants.js 我的求购
const cloud = require('../../utils/cloud')
const util = require('../../utils/util')

Page({
  data: {
    list: [],
    loading: false
  },

  onShow() {
    this.loadList()
  },

  loadList() {
    this.setData({ loading: true })
    cloud.call('want', 'my').then(res => {
      const list = res.list.map(w => ({
        ...w,
        timeText: util.timeAgo(w.createdAt),
        categoryName: util.categoryName(w.category)
      }))
      this.setData({ list, loading: false })
    }).catch(err => {
      this.setData({ loading: false })
      wx.showToast({ title: err.message, icon: 'none' })
    })
  },

  closeWant(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '关闭求购',
      content: '关闭后这条求购将不再展示,确定关闭?',
      success: res => {
        if (!res.confirm) return
        cloud.call('want', 'close', { id }).then(() => {
          wx.showToast({ title: '已关闭', icon: 'success' })
          this.loadList()
        }).catch(err => wx.showToast({ title: err.message, icon: 'none' }))
      }
    })
  },

  goPublishWant() {
    wx.navigateTo({ url: '/pages/publishWant/publishWant' })
  }
})
