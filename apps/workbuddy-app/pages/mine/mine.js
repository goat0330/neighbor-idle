// pages/mine/mine.js 我的
const cloud = require('../../utils/cloud')

const app = getApp()

Page({
  data: {
    user: null,
    unreadCount: 0,
    isAdmin: false,
    stats: { publish: 0, favorite: 0, want: 0 }
  },

  onShow() {
    app.login(user => {
      this.setData({ user })
      if (user) {
        // 管理员判定:openid 与云函数配置一致
        this.setData({ isAdmin: app.globalData.openid === 'REPLACE_WITH_YOUR_OPENID' })
        this.loadStats()
      }
    })
    this.loadUnread()
  },

  loadUnread() {
    cloud.call('message', 'unread').then(res => {
      this.setData({ unreadCount: res.count })
    }).catch(() => {})
  },

  loadStats() {
    Promise.all([
      cloud.call('item', 'my', { page: 1, pageSize: 1 }),
      cloud.call('favorite', 'list', { page: 1, pageSize: 1 }),
      cloud.call('want', 'my')
    ]).then(([items, favs, wants]) => {
      this.setData({
        stats: {
          publish: items.list.length,
          favorite: favs.list.length,
          want: wants.list.length
        }
      })
    }).catch(() => {})
  },

  // ===== 导航 =====
  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' })
  },

  goMyItems() {
    wx.navigateTo({ url: '/pages/myItems/myItems' })
  },

  goMyFavorites() {
    wx.navigateTo({ url: '/pages/myFavorites/myFavorites' })
  },

  goMyWants() {
    wx.navigateTo({ url: '/pages/myWants/myWants' })
  },

  goPublish() {
    if (!app.globalData.hasLogin) {
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }
    wx.navigateTo({ url: '/pages/publish/publish' })
  },

  goMessage() {
    wx.switchTab({ url: '/pages/message/message' })
  },

  goAudit() {
    wx.navigateTo({ url: '/packageAdmin/pages/audit/audit' })
  },

  // 引导认证
  goCertify() {
    wx.navigateTo({ url: '/pages/login/login' })
  },

  about() {
    wx.showModal({
      title: '关于邻里二手',
      content: '邻里二手 —— 让同小区、方圆几公里的邻居之间,方便地交换闲置好物。\n\nV1.0.0',
      showCancel: false
    })
  },

  feedback() {
    wx.showModal({
      title: '意见反馈',
      content: '欢迎联系群主反馈问题或建议,我们会在群里统一收集。',
      showCancel: false
    })
  },

  // 退出登录(本地清空,重新授权)
  resetLogin() {
    wx.showModal({
      title: '提示',
      content: '确定重置本地登录状态吗?',
      success: res => {
        if (res.confirm) {
          app.globalData.hasLogin = false
          app.globalData.userInfo = null
          this.setData({ user: null })
          wx.showToast({ title: '已重置', icon: 'none' })
        }
      }
    })
  }
})
