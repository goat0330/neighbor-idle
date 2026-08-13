// pages/myItems/myItems.js 我的发布
const cloud = require('../../utils/cloud')
const util = require('../../utils/util')
const { STATUS_TEXT } = require('../../utils/config')

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
    cloud.call('item', 'my', { page: 1, pageSize: 50 }).then(res => {
      const list = res.list.map(i => ({
        ...i,
        cover: (i.images && i.images[0]) || '',
        priceText: util.priceText(i.price),
        statusText: STATUS_TEXT[i.status] || '',
        timeText: util.timeAgo(i.createdAt)
      }))
      this.setData({ list, loading: false })
    }).catch(err => {
      this.setData({ loading: false })
      wx.showToast({ title: err.message, icon: 'none' })
    })
  },

  goDetail(e) {
    wx.navigateTo({ url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id })
  },

  // 长按/点击操作:编辑 / 上架下架 / 标记已售 / 删除
  operate(e) {
    const idx = e.currentTarget.dataset.index
    const item = this.data.list[idx]
    if (!item) return
    const actions = ['编辑']
    if (item.status === 'on_sale' || item.status === 'reserved') actions.push('下架')
    if (item.status === 'off') actions.push('重新上架')
    if (item.status === 'on_sale' || item.status === 'reserved') actions.push('标记已售出')
    actions.push('删除')

    wx.showActionSheet({
      itemList: actions,
      success: res => {
        const act = actions[res.tapIndex]
        this.handleAction(item, act)
      }
    })
  },

  handleAction(item, act) {
    switch (act) {
      case '编辑':
        wx.navigateTo({ url: '/pages/editItem/editItem?id=' + item._id })
        break
      case '下架':
        this.updateStatus(item, 'off')
        break
      case '重新上架':
        this.updateStatus(item, 'on_sale')
        break
      case '标记已售出':
        this.updateStatus(item, 'sold')
        break
      case '删除':
        wx.showModal({
          title: '删除物品',
          content: '删除后不可恢复,确定?',
          confirmColor: '#ff4d2e',
          success: res => {
            if (!res.confirm) return
            cloud.call('item', 'remove', { id: item._id }).then(() => {
              wx.showToast({ title: '已删除', icon: 'success' })
              this.loadList()
            }).catch(err => wx.showToast({ title: err.message, icon: 'none' }))
          }
        })
        break
    }
  },

  updateStatus(item, status) {
    const textMap = { off: '下架', on_sale: '重新上架', sold: '标记已售出' }
    wx.showModal({
      title: '提示',
      content: `确定${textMap[status]}吗?`,
      success: res => {
        if (!res.confirm) return
        cloud.call('item', 'update', { id: item._id, status }).then(() => {
          wx.showToast({ title: '操作成功', icon: 'success' })
          this.loadList()
        }).catch(err => wx.showToast({ title: err.message, icon: 'none' }))
      }
    })
  },

  goPublish() {
    wx.navigateTo({ url: '/pages/publish/publish' })
  }
})
