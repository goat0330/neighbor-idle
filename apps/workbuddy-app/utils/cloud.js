// utils/cloud.js 云函数调用统一封装
// 所有数据库读写必须走云函数,禁止前端直连数据库(安全红线)

// 云函数调用失败的真实原因映射(不再笼统提示"网络异常")
function friendlyError(fnName, err) {
  const code = err && (err.errCode !== undefined ? err.errCode : '')
  const msg = (err && (err.errMsg || err.message)) || ''
  const joined = String(code) + ' ' + String(msg)
  if (/FUNCTION_NOT_FOUND|-501005/.test(joined)) {
    return new Error('云函数未部署:请右键 ' + fnName + ' 云函数 → 上传并部署')
  }
  if (/env.*not.*found|invalid.*env|-501000|EnvironmentNotExist/.test(joined)) {
    return new Error('云开发环境未配置正确:请检查 app.js 中的 envId,或确认已开通云开发')
  }
  if (/Collection.*not.*exist|-502005|collection not exists/.test(joined)) {
    return new Error('数据库集合不存在:请部署 initdb 云函数后运行一次云端测试')
  }
  if (/permission|denied|No permission|-502003/.test(joined)) {
    return new Error('数据库权限不足:请把集合权限设为"仅创建者可读写"并在云函数中操作')
  }
  if (/timeout|TIMEOUT/.test(joined)) {
    return new Error('请求超时,请检查网络后重试')
  }
  // 网络异常等其它情况:带上原始错误信息,便于排查
  return new Error((msg && '网络异常:' + msg) || '网络异常,请稍后重试')
}

function call(fnName, action, data = {}) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: fnName,
      data: { action, ...data },
      success: res => {
        const r = res.result
        if (r && r.code === 0) {
          resolve(r.data)
        } else {
          const msg = (r && r.msg) || '请求失败'
          console.error(`[cloud:${fnName}:${action}]`, r)
          reject(new Error(msg))
        }
      },
      fail: err => {
        console.error(`[cloud:${fnName}:${action}]`, err)
        reject(friendlyError(fnName, err))
      }
    })
  })
}

// 上传图片到云存储,返回 fileID 列表
function uploadImages(tempPaths) {
  const tasks = tempPaths.map(p => {
    const extMatch = p.match(/\.(\w+)$/)
    const ext = extMatch ? extMatch[1] : 'png'
    const cloudPath = `items/${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`
    return wx.cloud.uploadFile({ cloudPath, filePath: p }).then(r => r.fileID)
  })
  return Promise.all(tasks)
}

// 检查登录态,未登录跳转登录页
function ensureLogin() {
  const app = getApp()
  if (app.globalData.hasLogin) return Promise.resolve(app.globalData.userInfo)
  return new Promise(resolve => {
    app.login(user => resolve(user))
  })
}

module.exports = { call, uploadImages, ensureLogin }
