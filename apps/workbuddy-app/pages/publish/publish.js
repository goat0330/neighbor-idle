// pages/publish/publish.js 发布闲置
const cloud = require('../../utils/cloud')
const { CATEGORIES, CONDITIONS } = require('../../utils/config')

const app = getApp()

Page({
  data: {
    categories: CATEGORIES.filter(c => c.id !== 'all'),
    conditions: CONDITIONS,
    images: [],
    form: {
      title: '',
      desc: '',
      price: '',
      originalPrice: '',
      free: false,
      condition: 'good',
      category: 'other',
      phone: '',
      communityId: '',
      communityName: '',
      location: '',
      latitude: null,
      longitude: null
    },
    categoryIndex: 7, // other 的索引
    conditionIndex: 2, // good
    communities: [],
    communityIndex: -1,
    submitting: false
  },

  onLoad() {
    this.loadCommunities()
    // 预填我的小区
    app.login(user => {
      if (user && user.communityId) {
        this.setData({
          'form.communityId': user.communityId,
          'form.communityName': user.communityName
        })
      }
    })
  },

  loadCommunities() {
    cloud.call('community', 'list').then(res => {
      this.setData({ communities: res.list })
      // 若已认证,自动定位索引
      const user = app.globalData.userInfo
      if (user && user.communityId) {
        const idx = res.list.findIndex(c => c._id === user.communityId)
        if (idx >= 0) this.setData({ communityIndex: idx })
      }
    }).catch(() => {})
  },

  // ===== 图片 =====
  chooseImage() {
    const remain = 9 - this.data.images.length
    if (remain <= 0) {
      wx.showToast({ title: '最多上传9张', icon: 'none' })
      return
    }
    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: res => {
        const paths = res.tempFiles.map(f => f.tempFilePath)
        this.setData({ images: this.data.images.concat(paths) })
      }
    })
  },

  removeImage(e) {
    const idx = e.currentTarget.dataset.index
    const images = this.data.images.slice()
    images.splice(idx, 1)
    this.setData({ images })
  },

  previewImage(e) {
    const idx = e.currentTarget.dataset.index
    wx.previewImage({ current: this.data.images[idx], urls: this.data.images })
  },

  // ===== 表单 =====
  onTitle(e) { this.setData({ 'form.title': e.detail.value }) },
  onDesc(e) { this.setData({ 'form.desc': e.detail.value }) },
  onPrice(e) { this.setData({ 'form.price': e.detail.value }) },
  onOriginalPrice(e) { this.setData({ 'form.originalPrice': e.detail.value }) },
  onPhone(e) { this.setData({ 'form.phone': e.detail.value }) },
  onFreeChange(e) {
    this.setData({ 'form.free': e.detail.value })
    if (e.detail.value) this.setData({ 'form.price': '' })
  },

  onCategoryChange(e) {
    const idx = Number(e.detail.value)
    const cat = this.data.categories[idx]
    this.setData({ categoryIndex: idx, 'form.category': cat.id })
  },

  onConditionChange(e) {
    const idx = Number(e.detail.value)
    const cond = this.data.conditions[idx]
    this.setData({ conditionIndex: idx, 'form.condition': cond.id })
  },

  onCommunityChange(e) {
    const idx = Number(e.detail.value)
    const c = this.data.communities[idx]
    if (!c) return
    this.setData({
      communityIndex: idx,
      'form.communityId': c._id,
      'form.communityName': c.name,
      'form.latitude': c.latitude,
      'form.longitude': c.longitude,
      'form.location': c.address || c.name
    })
  },

  chooseLocation() {
    wx.chooseLocation({
      success: res => {
        this.setData({
          'form.location': res.name || res.address,
          'form.latitude': res.latitude,
          'form.longitude': res.longitude
        })
      },
      fail: () => {}
    })
  },

  // ===== 提交 =====
  submit() {
    const f = this.data.form
    if (this.data.submitting) return
    if (this.data.images.length === 0) {
      wx.showToast({ title: '请至少上传一张实物图片', icon: 'none' })
      return
    }
    if (f.title.trim().length < 4) {
      wx.showToast({ title: '标题至少4个字', icon: 'none' })
      return
    }
    if (!f.free && (f.price === '' || Number(f.price) < 0)) {
      wx.showToast({ title: '请填写价格,或勾选免费送', icon: 'none' })
      return
    }
    if (!f.communityId) {
      wx.showToast({ title: '请选择所在小区', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '发布中...', mask: true })

    cloud.uploadImages(this.data.images).then(fileIDs => {
      return cloud.call('item', 'create', {
        ...f,
        price: f.free ? 0 : Number(f.price),
        originalPrice: f.originalPrice ? Number(f.originalPrice) : 0,
        images: fileIDs
      })
    }).then(res => {
      wx.hideLoading()
      wx.showToast({
        title: res.needAudit ? '已提交,待审核' : '发布成功',
        icon: 'success'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1200)
    }).catch(err => {
      wx.hideLoading()
      this.setData({ submitting: false })
      wx.showToast({ title: err.message, icon: 'none' })
    })
  }
})
