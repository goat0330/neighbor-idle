// pages/publishWant/publishWant.js 发布求购
const cloud = require('../../utils/cloud')
const { CATEGORIES } = require('../../utils/config')

Page({
  data: {
    categories: CATEGORIES.filter(c => c.id !== 'all'),
    form: {
      title: '',
      desc: '',
      category: 'other',
      priceRange: '',
      phone: ''
    },
    categoryIndex: 7,
    submitting: false
  },

  onTitle(e) { this.setData({ 'form.title': e.detail.value }) },
  onDesc(e) { this.setData({ 'form.desc': e.detail.value }) },
  onPriceRange(e) { this.setData({ 'form.priceRange': e.detail.value }) },
  onPhone(e) { this.setData({ 'form.phone': e.detail.value }) },

  onCategoryChange(e) {
    const idx = Number(e.detail.value)
    this.setData({ categoryIndex: idx, 'form.category': this.data.categories[idx].id })
  },

  submit() {
    const f = this.data.form
    if (this.data.submitting) return
    if (f.title.trim().length < 2) {
      wx.showToast({ title: '请填写想要求购的物品', icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    cloud.call('want', 'create', f).then(() => {
      this.setData({ submitting: false })
      wx.showToast({ title: '求购已发布', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1200)
    }).catch(err => {
      this.setData({ submitting: false })
      wx.showToast({ title: err.message, icon: 'none' })
    })
  }
})
