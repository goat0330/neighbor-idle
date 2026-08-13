// pages/want/want.js 求购广场
const cloud = require('../../utils/cloud')
const util = require('../../utils/util')
const { CATEGORIES } = require('../../utils/config')

const app = getApp()

Page({
  data: {
    categories: CATEGORIES.filter(c => c.id !== 'all'),
    activeCategory: 'all',
    list: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    showDetail: false,
    currentWant: null
  },

  onLoad() {
    this.loadList(true)
  },

  onPullDownRefresh() {
    this.loadList(true).then(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    this.loadList(false)
  },

  loadList(reset) {
    if (this.data.loading) return Promise.resolve()
    if (!reset && !this.data.hasMore) return Promise.resolve()
    const page = reset ? 1 : this.data.page + 1
    this.setData({ loading: true })
    return cloud.call('want', 'list', {
      page,
      pageSize: this.data.pageSize,
      category: this.data.activeCategory
    }).then(res => {
      const list = res.list.map(w => ({
        ...w,
        timeText: util.timeAgo(w.createdAt),
        categoryName: util.categoryName(w.category)
      }))
      this.setData({
        list: reset ? list : this.data.list.concat(list),
        page: res.page,
        hasMore: res.hasMore,
        loading: false
      })
    }).catch(err => {
      this.setData({ loading: false })
      wx.showToast({ title: err.message, icon: 'none' })
    })
  },

  changeCategory(e) {
    const id = e.currentTarget.dataset.id
    if (id === this.data.activeCategory) return
    this.setData({ activeCategory: id })
    this.loadList(true)
  },

  goPublishWant() {
    if (!app.globalData.hasLogin) {
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }
    wx.navigateTo({ url: '/pages/publishWant/publishWant' })
  },

  goMyWants() {
    wx.navigateTo({ url: '/pages/myWants/myWants' })
  },

  // 查看求购详情弹窗
  showWantDetail(e) {
    const id = e.currentTarget.dataset.id
    const w = this.data.list.find(i => i._id === id)
    if (!w) return
    this.setData({ showDetail: true, currentWant: w })
  },

  hideDetail() {
    this.setData({ showDetail: false, currentWant: null })
  },

  // 复制发布者手机号(若有)
  copyPhone() {
    const w = this.data.currentWant
    if (w && w.phone) {
      wx.setClipboardData({ data: w.phone })
    }
  },

  noop() {}
})
