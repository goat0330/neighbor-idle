// pages/message/message.js 消息中心
const cloud = require('../../utils/cloud')
const util = require('../../utils/util')

Page({
  data: {
    list: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
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

  onShow() {
    this.loadList(true)
  },

  loadList(reset) {
    if (this.data.loading) return Promise.resolve()
    const page = reset ? 1 : this.data.page + 1
    this.setData({ loading: true })
    return cloud.call('message', 'list', { page, pageSize: this.data.pageSize }).then(res => {
      const list = res.list.map(m => ({
        ...m,
        timeText: util.timeAgo(m.createdAt),
        typeText: m.type === 'audit' ? '系统通知' : '留言'
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

  // 点击消息:留言→商品详情;审核→我的发布
  tapMessage(e) {
    const m = this.data.list[e.currentTarget.dataset.index]
    if (!m) return
    // 标记已读
    cloud.call('message', 'read', { id: m._id }).catch(() => {})
    if (m.type === 'audit') {
      wx.navigateTo({ url: '/pages/myItems/myItems' })
    } else if (m.itemId) {
      wx.navigateTo({ url: '/pages/detail/detail?id=' + m.itemId })
    }
  },

  readAll() {
    cloud.call('message', 'readAll').then(() => {
      this.loadList(true)
      wx.showToast({ title: '已全部标记为已读', icon: 'none' })
    }).catch(err => wx.showToast({ title: err.message, icon: 'none' }))
  }
})
