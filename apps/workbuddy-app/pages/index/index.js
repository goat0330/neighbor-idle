// pages/index/index.js 首页:附近闲置商品流
const cloud = require('../../utils/cloud')
const util = require('../../utils/util')
const { CATEGORIES } = require('../../utils/config')

const app = getApp()

Page({
  data: {
    categories: CATEGORIES,
    activeCategory: 'all',
    list: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    userInfo: null,
    unreadCount: 0,
    hasLocation: false,   // 是否已获得定位(决定是否显示距离)
    locating: false
  },

  onLoad() {
    this.loadList(true)
  },

  onShow() {
    app.login(user => {
      this.setData({ userInfo: user })
      // 首次进入未认证时引导(不强弹,由"我的"页引导)
    })
    this.refreshLocation()
    this.loadUnread()
  },

  // 刷新定位状态:已有定位则重算距离,未定位显示引导条
  refreshLocation() {
    if (app.hasLocation()) {
      if (!this.data.hasLocation) this.setData({ hasLocation: true })
      this.redecorate()
    } else {
      this.setData({ hasLocation: false })
    }
  },

  // 用户点击"开启定位查看距离"
  enableLocation() {
    if (this.data.locating) return
    this.setData({ locating: true })
    app.getLocation(true).then(() => {
      this.setData({ locating: false, hasLocation: true })
      wx.showToast({ title: '已开启定位,按距离显示', icon: 'success' })
      this.redecorate()
    }).catch(err => {
      this.setData({ locating: false })
      if (err.reason === 'auth_denied') {
        wx.showModal({
          title: '需要定位权限',
          content: '未开启定位将按发布时间排序,看不到距离。可在设置中授权后回来刷新',
          confirmText: '去设置',
          success: res => {
            if (res.confirm) wx.openSetting()
          }
        })
      } else {
        wx.showToast({ title: (err.message || '定位失败') + ',将按发布时间排序', icon: 'none' })
      }
    })
  },

  // 列表已加载后重新计算距离(定位就绪时)
  redecorate() {
    if (!this.data.list.length) return
    const decorated = this.decorate(this.data.list)
    this.setData({ list: decorated })
  },

  onPullDownRefresh() {
    this.loadList(true).then(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    this.loadList(false)
  },

  // 加载列表
  loadList(reset) {
    if (this.data.loading) return Promise.resolve()
    if (!reset && !this.data.hasMore) return Promise.resolve()
    const page = reset ? 1 : this.data.page + 1
    this.setData({ loading: true })
    return cloud.call('item', 'list', {
      page,
      pageSize: this.data.pageSize,
      category: this.data.activeCategory
    }).then(res => {
      const decorated = this.decorate(res.list)
      this.setData({
        list: reset ? decorated : this.data.list.concat(decorated),
        page: res.page,
        hasMore: res.hasMore,
        loading: false
      })
    }).catch(err => {
      this.setData({ loading: false })
      wx.showToast({ title: err.message, icon: 'none' })
    })
  },

  // 装饰列表:距离/时间/价格/成色
  decorate(list) {
    const loc = app.globalData.location
    return list.map(i => {
      let distanceText = ''
      if (loc && i.latitude && i.longitude) {
        distanceText = util.formatDistance(loc.latitude, loc.longitude, i.latitude, i.longitude)
      }
      return {
        ...i,
        cover: (i.images && i.images[0]) || '',
        priceText: util.priceText(i.price),
        conditionName: util.conditionName(i.condition),
        timeText: util.timeAgo(i.createdAt),
        distanceText
      }
    })
  },

  changeCategory(e) {
    const id = e.currentTarget.dataset.id
    if (id === this.data.activeCategory) return
    this.setData({ activeCategory: id })
    this.loadList(true)
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  goDetail(e) {
    wx.navigateTo({ url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id })
  },

  goPublish() {
    if (!app.globalData.hasLogin) {
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }
    wx.navigateTo({ url: '/pages/publish/publish' })
  },

  loadUnread() {
    cloud.call('message', 'unread').then(res => {
      this.setData({ unreadCount: res.count })
    }).catch(() => {})
  }
})
