// app.js 全局逻辑
const cloud = require('./utils/cloud')

App({
  globalData: {
    openid: '',
    userInfo: null,     // 用户资料(含信用分、小区信息)
    location: null,     // { latitude, longitude }
    envId: '',          // 云环境 ID,见 README 配置
    hasLogin: false
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上基础库以使用云能力')
      return
    }
    // TODO: 部署时替换为你的云环境 ID(云开发控制台可查看)
    // 也可在开发者工具中选择"不使用云环境 ID"自动切换
    wx.cloud.init({
      env: this.globalData.envId || wx.cloud.DYNAMIC_CURRENT_ENV,
      traceUser: true
    })

    // 静默登录:换取 openid,拉取用户资料
    this.login()

    // 静默获取定位(已授权才取,未授权不弹框,首页有引导入口)
    this.getLocation(false).catch(() => {})
  },

  // 静默登录:调用云函数 login,注册/读取用户
  login(cb) {
    if (this.globalData.hasLogin) {
      typeof cb === 'function' && cb(this.globalData.userInfo)
      return
    }
    cloud.call('login', 'login').then(res => {
      this.globalData.openid = res.openid
      this.globalData.userInfo = res.user
      this.globalData.hasLogin = true
      typeof cb === 'function' && cb(res.user)
    }).catch(err => {
      console.error('login fail', err)
      typeof cb === 'function' && cb(null)
    })
  },

  // 获取定位并缓存到 globalData
  // force=true 时主动触发(会弹授权框),用于用户点击"开启定位"或"定位选小区"
  // 返回 Promise:resolve(location) / reject({ reason: 'auth_denied' | 'fail', message })
  getLocation(force) {
    // 已缓存直接返回
    if (this.globalData.location) {
      return Promise.resolve(this.globalData.location)
    }
    return new Promise((resolve, reject) => {
      const doGet = () => {
        wx.getLocation({
          type: 'gcj02',
          success: res => {
            const loc = { latitude: res.latitude, longitude: res.longitude }
            this.globalData.location = loc
            resolve(loc)
          },
          fail: err => {
            console.log('getLocation fail', err)
            reject({ reason: 'fail', message: (err && err.errMsg) || '定位失败' })
          }
        })
      }
      if (!force) {
        // 静默模式:先查授权状态,未授权则跳过(列表退化为按时间排序)
        wx.getSetting({
          success: s => {
            if (s.authSetting['scope.userLocation'] === false) {
              reject({ reason: 'auth_denied', message: '用户拒绝过定位授权' })
            } else if (s.authSetting['scope.userLocation'] === true) {
              doGet()
            } else {
              reject({ reason: 'not_authorized', message: '尚未授权定位' })
            }
          },
          fail: () => reject({ reason: 'fail', message: '读取授权状态失败' })
        })
      } else {
        doGet()
      }
    })
  },

  // 是否已有定位(避免每次都调 getLocation)
  hasLocation() {
    return !!(this.globalData.location && this.globalData.location.latitude)
  }
})
