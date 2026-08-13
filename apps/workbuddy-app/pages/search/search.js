// pages/search/search.js 搜索
const cloud = require('../../utils/cloud')
const util = require('../../utils/util')

const app = getApp()
const HISTORY_KEY = 'search_history'

Page({
  data: {
    keyword: '',
    history: [],
    list: [],
    searched: false,
    loading: false
  },

  onLoad() {
    this.setData({ history: wx.getStorageSync(HISTORY_KEY) || [] })
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  doSearch() {
    const kw = this.data.keyword.trim()
    if (!kw) return
    // 记录历史
    let history = wx.getStorageSync(HISTORY_KEY) || []
    history = [kw].concat(history.filter(h => h !== kw)).slice(0, 10)
    wx.setStorageSync(HISTORY_KEY, history)
    this.setData({ history })

    this.setData({ loading: true, searched: true })
    cloud.call('item', 'search', { keyword: kw, page: 1, pageSize: 20 }).then(res => {
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

  useHistory(e) {
    const kw = e.currentTarget.dataset.kw
    this.setData({ keyword: kw })
    this.doSearch()
  },

  clearHistory() {
    wx.removeStorageSync(HISTORY_KEY)
    this.setData({ history: [] })
  },

  goDetail(e) {
    wx.navigateTo({ url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id })
  }
})
