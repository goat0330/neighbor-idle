# 邻里二手 · 小区二手闲置交换小程序(完整可运行工程)

> 基于微信云开发(CloudBase)的 V1 版本,免服务器、免运维、免费额度起步。
> 导入微信开发者工具 → 开通云开发 → 部署云函数 → 初始化数据库 → 即可运行。

---

## 一、功能清单(V1)

| 模块 | 功能 |
|---|---|
| 登录认证 | 微信静默登录 + 头像昵称填写 + 小区/楼栋认证(认证信用分 +5) |
| 闲置发布 | 9 图上传、标题/描述/价格/原价/免费送、成色、分类、所在小区、交易地点、联系电话 |
| 浏览搜索 | 首页商品流(分类筛选/下拉刷新/上拉加载)、关键词搜索(带历史)、距离标注 |
| 商品详情 | 图片轮播、卖家信息(昵称/小区/信用分)、收藏、留言询价、复制电话、转发分享 |
| 消息中心 | 买家留言通知、系统通知(审核结果)、未读红点、全部已读 |
| 求购广场 | 反向需求发布/浏览/分类筛选、求购详情弹窗(含电话)、我的求购(可关闭) |
| 我的 | 信用分展示、我的发布(编辑/上下架/标记已售/删除)、我的收藏、我的求购 |
| 管理审核 | 管理分包:待审列表、图片预览、通过上架/驳回(驳回自动通知发布者) |

**审核策略**:云函数 `item` 中 `ADMIN_OPENIDS` 默认未配置 → 发布自动上架;
配置了管理员 openid → 发布进入待审核,需管理员在小程序内审核后上架。

---

## 二、目录结构

```
secondhand-app/
├── app.js / app.json / app.wxss / sitemap.json   # 全局配置
├── project.config.json                            # 开发者工具项目配置
├── assets/                                        # 图标资源(tab 图标、默认头像)
├── utils/
│   ├── cloud.js      # 云函数调用统一封装(所有读写必须走云函数)
│   ├── util.js       # 时间/距离/价格等格式化
│   └── config.js     # 分类/成色/状态常量、管理员列表
├── pages/                                          # 主包 13 个页面
│   ├── index/        首页商品流
│   ├── publish/      发布闲置
│   ├── detail/       商品详情
│   ├── want/         求购广场
│   ├── message/      消息中心
│   ├── mine/         我的
│   ├── login/        登录+小区认证
│   ├── search/       搜索
│   ├── myItems/      我的发布
│   ├── myFavorites/  我的收藏
│   ├── publishWant/  发布求购
│   ├── myWants/      我的求购
│   └── editItem/     编辑商品
├── packageAdmin/                                   # 管理分包(审核)
│   └── pages/audit, auditDetail
└── cloudfunctions/                                 # 7 个云函数
    ├── login/      登录注册 / 小区认证 / 资料更新
    ├── community/  小区列表
    ├── item/       商品 CRUD / 列表 / 详情 / 搜索 / 审核
    ├── favorite/   收藏 / 取消 / 列表
    ├── message/    留言 / 消息列表 / 未读 / 已读
    ├── want/       求购发布 / 列表 / 关闭
    └── initdb/     数据库初始化(建集合+示例小区)
```

---

## 三、部署步骤(约 30 分钟)

### 第 1 步:导入项目
1. 打开微信开发者工具 → 导入项目 → 选择本目录 `secondhand-app`
2. AppID:请使用你自己的小程序 AppID(测试可用测试号,但发布需正式 AppID)

### 第 2 步:开通云开发
1. 工具栏点击「云开发」→ 开通 → 创建环境(如 `neighbor-prod`)
2. 记下环境 ID

### 第 3 步:部署云函数(7 个)
在编辑器中左侧资源管理器展开 `cloudfunctions`,对**每个云函数目录**:
> 右键 → 「上传并部署:云端安装依赖」

依次部署:`login`、`community`、`item`、`favorite`、`message`、`want`、`initdb`

### 第 4 步:初始化数据库
1. 云开发控制台 → 云函数 → 找到 `initdb` → 「云端测试」→ 运行一次
2. 运行结果应显示 6 个集合 `created/exists`,并插入 5 个示例小区
3. **重要**:`initdb` 中的示例小区是占位数据,请改为你小区附近的真实小区
   (名称 + 地址 + 经纬度,坐标到 https://lbs.qq.com/getPoint 拾取 gcj02 坐标)

### 第 5 步:设置集合权限(安全红线 ⚠️)
云开发控制台 → 数据库 → 对以下 6 个集合,权限都设为 **「仅创建者可读写」改为「所有用户不可读写」**:

> `users`、`communities`、`items`、`favorites`、`messages`、`wants`

所有读写都经由云函数完成(云函数使用管理员权限,不受此限制)。
**前端直连数据库是二手交易类小程序最常见的安全事故来源,务必按此设置。**

### 第 6 步:替换配置(3 处)
| 文件 | 位置 | 替换为 |
|---|---|---|
| `app.js` | `globalData.envId` | 你的云环境 ID(不填则使用当前环境,一般可不改) |
| `cloudfunctions/item/index.js` | `ADMIN_OPENIDS` | 你的 openid(可多个,`['openid1','openid2']`);不想审核就保持 `REPLACE_WITH_YOUR_OPENID` 不动 |
| `cloudfunctions/community/index.js` | `ADMINS` | 同上(用于新增小区) |
| `pages/mine/mine.js` | `isAdmin` 判断 | 改为你的 openid(与云函数一致,管理入口才可见) |

获取你的 openid:云开发控制台 → 数据库 → 任意集合 → 添加记录,`_openid` 即你的 openid;
或在小程序 `app.js` 的 `login` 回调中 `console.log` 打印。

> ⚠️ 修改云函数后需重新「上传并部署」。修改 `mine.js` 后重新编译即可。

### 第 7 步:运行验证
1. 编译运行 → 应看到首页(空列表 + 分类栏)
2. 「我的」→ 登录 → 选择小区认证
3. 发布一件闲置 → 上传图片 → 提交
4. 若无管理员配置,商品直接上架显示在首页;配置了管理员则出现在审核分包
5. 测试留言:用另一个微信号打开商品 → 留言 → 卖家「消息」收到通知

### 第 8 步:提交审核(上线前)
1. 工具 → 上传 → 微信公众平台提交审核
2. 类目建议:生活服务 > 二手/闲置交易(需营业执照,个人主体类目受限,建议尽早注册个体工商户/企业主体)
3. 隐私保护指引:需声明收集 位置信息、手机号、相册(仅用于上传图片)
4. 审核前在公众平台「设置 → 服务内容声明」中说明定位用途:用于展示附近闲置

---

## 四、数据库设计(6 集合)

| 集合 | 关键字段 |
|---|---|
| `users` | openid、nickname、avatarUrl、communityId、communityName、building、phone、creditScore(默认100)、status |
| `communities` | name、address、latitude、longitude |
| `items` | openid、title、desc、images[]、price、originalPrice、condition、category、phone、communityId/Name、location、latitude/longitude、status(pending/on_sale/reserved/sold/off)、views、favoritesCount |
| `favorites` | openid、itemId |
| `messages` | toOpenid、fromOpenid、type(inquiry/audit)、itemId、content、read |
| `wants` | openid、title、desc、category、priceRange、phone、status(open/closed) |

---

## 五、上线后的运营要点

1. **450 人群是最强渠道**:把小程序码发到群里,引导「发布→转发到群」
2. **信任体系运营**:鼓励认证小区、交易后互评(V2 功能)
3. **内容安全**:后续建议接入微信「内容安全」接口(msgSecCheck / imgSecCheck)自动拦截违禁词,V1 靠管理员人工审核
4. **数据备份**:云开发控制台可设置每日自动备份

---

## 六、已知限制与 V2 规划

- V1 消息为「留言 + 通知」模式,**非实时 IM**;V2 升级实时聊天(轮询/云开发数据库 watch)
- V1 无线上支付,**线下自提 + 当面交易**(规避资金资质,过审最快);V2 接入微信支付担保
- V1 列表按时间排序;附近距离排序需在控制台为 `items.latitude/longitude` 建地理位置索引后可启用 `geo.near`
- V1 无信用互评/举报;V2 增加交易闭环

---

*工程交付:2026-08-13 · 邻里二手 V1.0.0*
