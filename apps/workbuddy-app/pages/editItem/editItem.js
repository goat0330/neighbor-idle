// pages/editItem/editItem.js 编辑商品(复用发布页表单,预填数据)
const cloud = require('../../utils/cloud')
const { CATEGORIES, CONDITIONS } = require('../../utils/config')

Page({
  data: {
    id: '',
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
    categoryIndex: 7,
    conditionIndex: 2,
    submitting: false
  },

  onLoad(options) {
    this.setData({ id: options.id || '' })
    this.loadItem()
  },

  loadItem() {
    cloud.call('item', 'detail', { id: this.data.id }).then(res => {
      const item = res.item
      if (!res.isMine) {
        wx.showToast({ title: '无权编辑', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 800)
        return
      }
      const categoryIndex = Math.max(0, this.data.categories.findIndex(c => c.id === item.category))
      const conditionIndex = Math.max(0, this.data.conditions.findIndex(c => c.id === item.condition))
      this.setData({
        images: item.images || [],
        form: {
          title: item.title,
          desc: item.desc || '',
          price: item.price ? String(item.price) : '',
          originalPrice: item.originalPrice ? String(item.originalPrice) : '',
          free: item.price === 0,
          condition: item.condition || 'good',
          category: item.category || 'other',
          phone: item.phone || '',
          communityId: item.communityId || '',
          communityName: item.communityName || '',
          location: item.location || '',
          latitude: item.latitude || null,
          longitude: item.longitude || null
        },
        categoryIndex,
        conditionIndex
      })
    }).catch(err => wx.showToast({ title: err.message, icon: 'none' }))
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
    this.setData({ categoryIndex: idx, 'form.category': this.data.categories[idx].id })
  },
  onConditionChange(e) {
    const idx = Number(e.detail.value)
    this.setData({ conditionIndex: idx, 'form.condition': this.data.conditions[idx].id })
  },

  // ===== 提交 =====
  submit() {
    const f = this.data.form
    if (this.data.submitting) return
    if (this.data.images.length === 0) {
      wx.showToast({ title: '请至少上传一张图片', icon: 'none' })
      return
    }
    if (f.title.trim().length < 4) {
      wx.showToast({ title: '标题至少4个字', icon: 'none' })
      return
    }
    if (!f.free && (f.price === '' || Number(f.price) < 0)) {
      wx.showToast({ title: '请填写价格', icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    wx.showLoading({ title: '保存中...', mask: true })

    // 新上传的本地图片需要传到云存储(cloud:// 开头的为已上传的云端图片)
    const localImgs = this.data.images.filter(p => p.indexOf('cloud://') !== 0)
    const cloudImgs = this.data.images.filter(p => p.indexOf('cloud://') === 0)

    const uploadTask = localImgs.length > 0
      ? cloud.uploadImages(localImgs)
      : Promise.resolve([])

    uploadTask.then(fileIDs => {
      const images = cloudImgs.concat(fileIDs)
      return cloud.call('item', 'update', {
        id: this.data.id,
        ...f,
        price: f.free ? 0 : Number(f.price),
        originalPrice: f.originalPrice ? Number(f.originalPrice) : 0,
        images
      })
    }).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1200)
    }).catch(err => {
      wx.hideLoading()
      this.setData({ submitting: false })
      wx.showToast({ title: err.message, icon: 'none' })
    })
  }
})
