// pages/detail/detail.js 商品详情
const cloud = require('../../utils/cloud')
const util = require('../../utils/util')

const app = getApp()

Page({
  data: {
    id: '',
    item: null,
    images: [],
    isFavorite: false,
    isMine: false,
    showMsg: false,
    msgContent: '',
    sending: false,
    distanceText: ''
  },

  onLoad(options) {
    this.setData({ id: options.id || '' })
  },

  onShow() {
    if (this.data.id) this.loadDetail()
  },

  loadDetail() {
    cloud.call('item', 'detail', { id: this.data.id }).then(res => {
      const item = res.item
      // 距离
      let distanceText = ''
      const loc = app.globalData.location
      if (loc && item.latitude && item.longitude) {
        distanceText = util.formatDistance(loc.latitude, loc.longitude, item.latitude, item.longitude)
      }
      wx.setNavigationBarTitle({ title: item.title || '商品详情' })
      // 补充展示字段
      item.conditionName = util.conditionName(item.condition)
      item.categoryName = util.categoryName(item.category)
      item.timeText = util.timeAgo(item.createdAt)
      this.setData({
        item,
        images: item.images || [],
        isFavorite: res.isFavorite,
        isMine: res.isMine,
        distanceText
      })
    }).catch(err => {
      wx.showToast({ title: err.message, icon: 'none' })
    })
  },

  previewImage(e) {
    const idx = e.currentTarget.dataset.index
    wx.previewImage({ current: this.data.images[idx], urls: this.data.images })
  },

  // ===== 收藏 =====
  toggleFavorite() {
    if (!app.globalData.hasLogin) {
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }
    cloud.call('favorite', 'toggle', { itemId: this.data.id }).then(res => {
      this.setData({ isFavorite: res.favorited })
      wx.showToast({ title: res.favorited ? '已收藏' : '已取消', icon: 'none' })
    }).catch(err => wx.showToast({ title: err.message, icon: 'none' }))
  },

  // ===== 留言 =====
  openMsg() {
    if (!app.globalData.hasLogin) {
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }
    this.setData({ showMsg: true })
  },

  closeMsg() {
    this.setData({ showMsg: false, msgContent: '' })
  },

  onMsgInput(e) {
    this.setData({ msgContent: e.detail.value })
  },

  sendMsg() {
    const content = this.data.msgContent.trim()
    if (!content) {
      wx.showToast({ title: '请输入留言内容', icon: 'none' })
      return
    }
    if (this.data.sending) return
    this.setData({ sending: true })
    cloud.call('message', 'send', { itemId: this.data.id, content }).then(() => {
      this.setData({ showMsg: false, msgContent: '', sending: false })
      wx.showToast({ title: '已通知卖家', icon: 'success' })
    }).catch(err => {
      this.setData({ sending: false })
      wx.showToast({ title: err.message, icon: 'none' })
    })
  },

  // ===== 复制卖家电话 =====
  copyPhone() {
    const phone = this.data.item.phone
    if (phone) {
      wx.setClipboardData({ data: phone, success: () => wx.showToast({ title: '已复制', icon: 'none' }) })
    }
  },

  // ===== 卖家操作 =====
  goEdit() {
    wx.navigateTo({ url: '/pages/editItem/editItem?id=' + this.data.id })
  },

  // 状态操作:下架 / 上架 / 标记已售
  changeStatus(e) {
    const status = e.currentTarget.dataset.status
    const textMap = { off: '下架', on_sale: '上架', sold: '标记已售出' }
    wx.showModal({
      title: '提示',
      content: `确定${textMap[status]}这件物品吗?`,
      success: res => {
        if (!res.confirm) return
        cloud.call('item', 'update', { id: this.data.id, status }).then(() => {
          wx.showToast({ title: '操作成功', icon: 'success' })
          this.loadDetail()
        }).catch(err => wx.showToast({ title: err.message, icon: 'none' }))
      }
    })
  },

  deleteItem() {
    wx.showModal({
      title: '删除物品',
      content: '删除后不可恢复,确定删除?',
      confirmColor: '#ff4d2e',
      success: res => {
        if (!res.confirm) return
        cloud.call('item', 'remove', { id: this.data.id }).then(() => {
          wx.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => wx.navigateBack(), 1000)
        }).catch(err => wx.showToast({ title: err.message, icon: 'none' }))
      }
    })
  },

  // 分享(带参溯源)
  onShareAppMessage() {
    const item = this.data.item || {}
    return {
      title: (item.price === 0 ? '免费送' : util.priceText(item.price)) + ' | ' + item.title,
      path: '/pages/detail/detail?id=' + this.data.id,
      imageUrl: (item.images && item.images[0]) || ''
    }
  },

  onShareTimeline() {
    const item = this.data.item || {}
    return {
      title: item.title,
      query: 'id=' + this.data.id
    }
  }
})
