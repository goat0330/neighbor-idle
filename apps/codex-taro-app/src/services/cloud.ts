/**
 * 云函数调用封装(Taro 版)
 *
 * 所有数据库读写走云函数,前端不直连数据库(安全红线)
 * 错误提示精确化,不再笼统显示"网络异常"
 *
 * 使用方式:
 *   import { cloud } from '@services/cloud'
 *   const list = await cloud.call('item', 'list', { page: 1 })
 */

import Taro from '@tarojs/taro'

/** 云函数统一响应 */
interface CloudResult<T = any> {
  code: number
  msg?: string
  data: T
}

class CloudService {
  /**
   * 调用云函数
   * @param fnName  云函数名(如 'item' 'login')
   * @param action  操作类型(如 'list' 'detail' 'create')
   * @param data    业务参数
   */
  async call<T = any>(fnName: string, action: string, data: Record<string, any> = {}): Promise<T> {
    try {
      const res = await Taro.cloud.callFunction({
        name: fnName,
        data: { action, ...data }
      })

      const r = res.result as CloudResult<T>

      if (r && r.code === 0) {
        return r.data
      }

      // 业务错误
      const msg = r?.msg || '请求失败'
      console.error(`[cloud:${fnName}:${action}]`, r)
      throw new Error(msg)
    } catch (err: any) {
      console.error(`[cloud:${fnName}:${action}]`, err)

      // Taro 调用失败 → 精确映射错误原因
      const errMsg = err?.errMsg || err?.message || ''
      throw this.parseError(errMsg, fnName)
    }
  }

  /** 精确化错误提示 */
  private parseError(errMsg: string, fnName: string): Error {
    if (/FUNCTION_NOT_FOUND|-501005/.test(errMsg)) {
      return new Error(`云函数 ${fnName} 未部署:请在开发者工具中右键 → 上传并部署`)
    }
    if (/env.*not.*found|invalid.*env|-501000|EnvironmentNotExist/.test(errMsg)) {
      return new Error('云开发环境未配置:请检查 src/app.ts 中的 envId')
    }
    if (/Collection.*not.*exist|-502005|collection not exists/.test(errMsg)) {
      return new Error('数据库集合不存在:请运行 initdb 云函数')
    }
    if (/permission|denied|No permission|-502003/.test(errMsg)) {
      return new Error('数据库权限不足:请把集合权限设为"仅创建者可读写"')
    }
    if (/timeout|TIMEOUT/.test(errMsg)) {
      return new Error('请求超时,请检查网络后重试')
    }
    return new Error(errMsg || '网络异常,请稍后重试')
  }

  /**
   * 上传图片到云存储
   * @param tempPaths 临时文件路径数组
   * @returns fileID 数组
   */
  async uploadImages(tempPaths: string[], folder = 'items'): Promise<string[]> {
    const tasks = tempPaths.map(p => {
      const ext = p.match(/\.(\w+)$/)?.[1] || 'png'
      const cloudPath = `${folder}/${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`
      return Taro.cloud.uploadFile({ cloudPath, filePath: p }).then(r => r.fileID)
    })
    return Promise.all(tasks)
  }

  /**
   * 批量删除云存储文件
   */
  async deleteFiles(fileIds: string[]): Promise<void> {
    if (fileIds.length === 0) return
    await Taro.cloud.deleteFile({ fileList: fileIds })
  }
}

export const cloud = new CloudService()
