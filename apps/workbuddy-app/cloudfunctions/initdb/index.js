// 云函数 initdb:一次性初始化数据库
// 部署后在开发者工具中右键"云端测试"运行一次:
//  1. 自动创建全部集合
//  2. 写入示例小区(请务必改成你所在小区的真实名称与坐标)
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  const collections = [
    'users', 'communities', 'items', 'favorites', 'conversations', 'messages',
    'contact_requests', 'wants', 'transactions', 'reviews', 'reports',
    'geo_circles', 'group_pools', 'wecom_groups', 'group_join_ways', 'identity_mappings'
  ]
  const results = {}
  for (const name of collections) {
    try {
      await db.createCollection(name)
      results[name] = 'created'
    } catch (e) {
      // 已存在则跳过
      results[name] = 'exists'
    }
  }

  // 示例小区数据 —— 部署后请用你小区附近的真实小区替换
  // 坐标使用【腾讯地图坐标 gcj02】,可到 https://lbs.qq.com/getPoint 拾取
  const sampleCommunities = [
    { name: '阳光花园', address: '示例地址A', latitude: 39.908823, longitude: 116.397470 },
    { name: '翠湖小区', address: '示例地址B', latitude: 39.904690, longitude: 116.407170 },
    { name: '幸福里', address: '示例地址C', latitude: 39.912790, longitude: 116.391930 },
    { name: '锦绣华庭', address: '示例地址D', latitude: 39.916490, longitude: 116.403750 },
    { name: '滨江雅苑', address: '示例地址E', latitude: 39.899810, longitude: 116.412390 }
  ]

  const cnt = await db.collection('communities').count()
  let inserted = 0
  if (cnt.total === 0) {
    for (const c of sampleCommunities) {
      await db.collection('communities').add({ data: { ...c, createdAt: Date.now() } })
      inserted++
    }
  }

  // 生活圈只作为安全的本地演示数据；未配置真实入群入口，因此不会展示可用的加入按钮。
  const circleCount = await db.collection('geo_circles').count()
  let geoCirclesInserted = 0
  if (circleCount.total === 0) {
    await db.collection('geo_circles').add({
      data: {
        name: '金水花园附近',
        locationLabel: '金水花园附近',
        center: { latitude: 31.2304, longitude: 121.4737 },
        radiusM: 3000,
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    })
    geoCirclesInserted = 1
  }

  const circleResult = await db.collection('geo_circles').where({ name: '金水花园附近' }).limit(1).get()
  const sampleCircle = circleResult.data[0]
  const poolCount = await db.collection('group_pools').count()
  let groupPoolsInserted = 0
  if (sampleCircle && poolCount.total === 0) {
    await db.collection('group_pools').add({
      data: {
        geoCircleId: sampleCircle._id,
        displayName: '附近生活群',
        subtitle: '附近生活群入群入口准备中',
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    })
    groupPoolsInserted = 1
  }

  return {
    code: 0,
    data: {
      collections: results,
      sampleCommunitiesInserted: inserted,
      geoCirclesInserted,
      groupPoolsInserted
    }
  }
}
