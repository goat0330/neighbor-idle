// pages/myFavorites/myFavorites.js 我的收藏
const cloud = require('../../utils/cloud')
const util = require('../../utils/util')

const app = getApp()

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
    cloud.call('favorite', 'list', { page: 1, pageSize: 50 }).then(res => {
      const loc = app.globalData.location
      const list = res.list.map(i => {
        let distanceText = ''
        if (loc && i.latitude && i.longitude) {
          distanceText = util.formatDistance(loc.latitude, loc.longitude, i.latitude, i.longitude)
        }
        return {
          ...i,
          cover: (i.images && i.images[0]) || '',
          priceText: util.priceText(i.price),
          timeText: util.timeAgo(i.createdAt),
          distanceText
        }
      })
      this.setData({ list, loading: false })
    }).catch(err => {
      this.setData({ loading: false })
      wx.showToast({ title: err.message, icon: 'none' })
    })
  },

  goDetail(e) {
    wx.navigateTo({ url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id })
  }
})
