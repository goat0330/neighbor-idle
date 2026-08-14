# 邻里集市 CloudBase 后端与原生基线

该目录既保留 WorkBuddy 原生微信小程序，也承载融合版 Taro 前端共用的 CloudBase 后端。

## 云函数

| 云函数 | 职责 |
|---|---|
| `user` | 私有用户资料、社区认证状态、交易微信号 |
| `conversation` | 创建会话、会话列表、双向消息、已读和未读数 |
| `contact` | 买家申请交换微信、卖家批准/拒绝、双方撤回 |
| `login` | 原生版兼容登录与旧资料接口 |
| `item` | 闲置 CRUD、审核、搜索 |
| `want` | 求购发布与管理 |
| `favorite` | 收藏管理 |
| `community` | 小区数据 |
| `message` | 原生版旧留言/系统通知兼容接口 |
| `initdb` | 创建全部集合和演示小区 |

## 部署

1. 在微信开发者工具导入本目录，把 `project.config.json` 的 `touristappid` 替换为正式 AppID。
2. 开通 CloudBase 环境，在 `app.js` 写入环境 ID。
3. 对 `cloudfunctions` 下每个目录执行“上传并部署：云端安装依赖”。
4. 云端运行一次 `initdb`，创建集合。
5. 数据库客户端权限统一设为“所有用户不可读写”；所有业务读写只允许经过云函数。仓库内的 `database.rules.json` 是拒绝客户端直连的基线。
6. 在控制台按 `docs/数据模型与接口.md` 创建复合索引，然后用两个真实微信账号进行端到端测试。

## 核心安全边界

- 身份只读取 `cloud.getWXContext().OPENID`，不接受前端传入身份或角色。
- 用户公开资料永不返回 openid、微信号、手机号、楼栋门牌或精确坐标。
- 微信号保存在 `users.wechatId`，只有卖家批准具体 `contact_request` 后才向会话双方返回。
- 消息查询、发送、已读和联系方式操作都先验证当前用户属于该会话。
- 前端违禁词检查仅用于提示；正式上线仍需在云函数调用微信内容安全接口。

## Taro 前端连接

在 `apps/codex-taro-app/.env.local` 配置：

```text
TARO_APP_CLOUD_ENV=你的云环境ID
TARO_APP_TENCENT_MAP_KEY=受AppID限制的腾讯地图Key
```

配置后，Taro 的消息中心、聊天、用户资料和交换微信自动调用云函数；未配置环境时只运行不持久化敏感信息的演示模式。
