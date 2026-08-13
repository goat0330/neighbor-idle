// pages/login/login.js 登录 + 小区认证(支持定位自动匹配 / 跳过认证)
const cloud = require('../../utils/cloud')
const util = require('../../utils/util')

const app = getApp()

Page({
  data: {
    avatarUrl: '',
    nickname: '',
    communities: [],
    communityIndex: -1,
    building: '',
    locating: false,
    matchedCommunity: null, // { name, distanceText }
    submitting: false
  },

  onLoad() {
    this.loadCommunities()
  },

  onShow() {
    // 预填已有资料
    const user = app.globalData.userInfo
    if (user) {
      this.setData({
        avatarUrl: user.avatarUrl || '',
        nickname: user.nickname || ''
      })
      if (user.communityId && this.data.communities.length) {
        const idx = this.data.communities.findIndex(c => c._id === user.communityId)
        if (idx >= 0) this.setData({ communityIndex: idx, building: user.building || '' })
      }
    }
  },

  loadCommunities() {
    cloud.call('community', 'list').then(res => {
      this.setData({ communities: res.list })
      const user = app.globalData.userInfo
      if (user && user.communityId) {
        const idx = res.list.findIndex(c => c._id === user.communityId)
        if (idx >= 0) this.setData({ communityIndex: idx, building: user.building || '' })
      } else if (app.hasLocation()) {
        // 已授权定位且未认证:静默自动匹配最近小区(不弹窗)
        const nearest = this.matchNearest(app.globalData.location)
        if (nearest) this.setData({ communityIndex: nearest.index, matchedCommunity: nearest })
      }
    }).catch(() => {})
  },

  // 点击"定位自动匹配小区"
  locateMatch() {
    if (this.data.locating) return
    if (!this.data.communities.length) {
      wx.showToast({ title: '小区列表加载中,请稍后再试', icon: 'none' })
      return
    }
    this.setData({ locating: true })
    wx.showLoading({ title: '定位中...', mask: true })
    app.getLocation(true).then(loc => {
      wx.hideLoading()
      this.setData({ locating: false })
      const nearest = this.matchNearest(loc)
      if (nearest) {
        this.setData({ communityIndex: nearest.index, matchedCommunity: nearest })
        wx.showToast({ title: '已定位到「' + nearest.name + '」', icon: 'success' })
      } else {
        this.setData({ matchedCommunity: null })
        wx.showModal({
          title: '附近未收录该小区',
          content: '5公里内暂未收录小区,请手动选择;也可以后续在小程序中申请新增',
          showCancel: false
        })
      }
    }).catch(err => {
      wx.hideLoading()
      this.setData({ locating: false })
      if (err.reason === 'auth_denied') {
        wx.showModal({
          title: '需要定位权限',
          content: '请在设置中允许使用位置信息,用于自动匹配小区;也可以手动选择小区',
          confirmText: '去设置',
          success: res => {
            if (res.confirm) wx.openSetting()
          }
        })
      } else {
        wx.showToast({ title: (err.message || '定位失败') + ',请手动选择', icon: 'none' })
      }
    })
  },

  // 在小区列表中找最近的(5km 内才算匹配)
  matchNearest(loc) {
    const list = this.data.communities
    let best = null
    list.forEach((c, idx) => {
      if (!c.latitude || !c.longitude) return
      const d = util.distanceMeters(loc.latitude, loc.longitude, c.latitude, c.longitude)
      if (d !== null && d <= 5000 && (!best || d < best.d)) {
        best = {
          index: idx,
          name: c.name,
          distanceText: util.formatDistance(loc.latitude, loc.longitude, c.latitude, c.longitude),
          d
        }
      }
    })
    return best
  },

  onChooseAvatar(e) {
    const temp = e.detail.avatarUrl
    this.setData({ avatarUrl: temp })
    // 上传头像到云存储
    const ext = (temp.match(/\.(\w+)$/) || [null, 'png'])[1]
    const cloudPath = `avatars/${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`
    wx.cloud.uploadFile({ cloudPath, filePath: temp }).then(r => {
      this.setData({ avatarUrl: r.fileID })
    }).catch(() => {
      // 上传失败仍保留本地路径
    })
  },

  onNickname(e) {
    this.setData({ nickname: e.detail.value })
  },

  onCommunityChange(e) {
    const idx = Number(e.detail.value)
    this.setData({ communityIndex: idx, matchedCommunity: null })
  },

  onBuilding(e) {
    this.setData({ building: e.detail.value })
  },

  // 保存资料 + 小区认证
  save() {
    if (this.data.submitting) return
    const c = this.data.communities[this.data.communityIndex]
    if (!c) {
      wx.showToast({ title: '请选择所在小区,或点击定位匹配', icon: 'none' })
      return
    }
    // 楼栋号为选填,不强制
    this.setData({ submitting: true })
    wx.showLoading({ title: '保存中...', mask: true })

    // 先更新资料(头像/昵称),再绑定小区
    const profilePromise = (this.data.nickname || this.data.avatarUrl)
      ? cloud.call('login', 'updateProfile', {
          nickname: this.data.nickname,
          avatarUrl: this.data.avatarUrl
        })
      : Promise.resolve()

    profilePromise
      .then(() => cloud.call('login', 'bindCommunity', {
        communityId: c._id,
        communityName: c.name,
        building: this.data.building
      }))
      .then(user => {
        wx.hideLoading()
        app.globalData.userInfo = user
        app.globalData.hasLogin = true
        this.setData({ submitting: false })
        wx.showToast({ title: '认证成功', icon: 'success' })
        setTimeout(() => wx.navigateBack(), 1200)
      })
      .catch(err => {
        wx.hideLoading()
        this.setData({ submitting: false })
        wx.showToast({ title: err.message, icon: 'none' })
      })
  },

  // 只更新资料不认证(登录即可浏览)
  skipCertify() {
    const update = {}
    if (this.data.nickname) update.nickname = this.data.nickname
    if (this.data.avatarUrl) update.avatarUrl = this.data.avatarUrl
    if (Object.keys(update).length === 0) {
      wx.showToast({ title: '已登录', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 800)
      return
    }
    cloud.call('login', 'updateProfile', update).then(user => {
      app.globalData.userInfo = user
      app.globalData.hasLogin = true
      wx.showToast({ title: '已登录', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1000)
    }).catch(err => wx.showToast({ title: err.message, icon: 'none' }))
  }
})
