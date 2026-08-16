# 邻里闲置 MVP 最终交付 Manifest

更新时间：2026-08-16
交付状态：前端候选发布版（Taro React + 微信小程序）

## 1. 最终工作树

根目录：`D:/研究生作业/小程序开发/worktrees/community-visual`
分支：`codex/community-visual`
小程序源码：`D:/研究生作业/小程序开发/worktrees/community-visual/apps/codex-taro-app`
AppID：`wx00edfdef9d44805f`

微信开发者工具应导入：
`D:/研究生作业/小程序开发/worktrees/community-visual/apps/codex-taro-app/dist/weapp`

快捷入口：`D:/wxdev/community-idle`

该路径是 Junction，实际指向上面的 `dist/weapp`，不是另一套源码。

## 2. 前端源码位置

`apps/codex-taro-app/src/pages/`

- `home`：闲置首页
- `want` / `want-detail`：求购列表与详情
- `publish`：发布闲置
- `request-publish`：发布求购
- `publish-success`：发布成功与分享预览
- `detail`：商品详情
- `messages` / `chat`：消息列表与商品一对一聊天
- `favorites`：收藏
- `mine`：我的
- `map-demo`：地图能力演示
- `components-preview` / `chat-preview`：组件与聊天预览

`apps/codex-taro-app/src/components/community/`

- `SearchLocationBar`、`CategoryTabs`、`ProductCard`、`WantedCard`
- `ListingManageRow`、`BottomNav`、`PublishFAB`
- `PublishActionSheet`、`ProductChatAnchor`、`ChatBubble`、`QuickQuestionChips`、`ChatComposer`
- `ContactExchangeAction`、`ContactExchangeSheet`、`ContactCard`、`ContactSettingsForm`
- `WechatQuickProfileSheet`、`WechatContactSetupSheet` 及微信原生授权组件
- `NearbyGroupCard`：附近生活圈群入口（后端不可用时安全降级）

`apps/codex-taro-app/src/components/Map/`：MapPicker、NearbyMap、MapContainer 与位置标签。

`apps/codex-taro-app/src/services/`：backend、cloud、contactExchange、groupPool、location、tencentMap、market。

`apps/codex-taro-app/src/assets/mock/`：固定商品图片和头像素材。

`apps/codex-taro-app/backups/components-v0.6-final/`：组件单独保存的最终备份，不是运行时入口。

发布闲置“所在地”固定到发布按钮上方的修复文件：
`apps/codex-taro-app/src/pages/publish/index.scss`

## 3. 构建产物与 Review

- `apps/codex-taro-app/dist/weapp/`：微信开发者工具导入产物
- `apps/codex-taro-app/dist/h5/`：H5 快速预览产物
- `apps/codex-taro-app/scripts/`：微信项目配置生成与 weapp-doctor 检查脚本
- `review/mobile-preview.html`：手机壳组件预览入口
- `review/chat-preview.html`：聊天交互预览入口
- `review/ROUND1_1_VISUAL_REVIEW.md`：Round 1.1 视觉验收记录
- `review/MANIFEST.json`：Review 资源清单

H5 只用于快速视觉检查；微信开发者工具导入 `dist/weapp` 才是小程序验收入口。

## 4. 产品、接口与设计资料

- `docs/最终融合产品方案.md`
- `docs/数据模型与接口.md`
- `docs/安全与隐私.md`
- `docs/上线说明.md`
- `docs/腾讯地图后端接入.md`
- `docs/产品与PRD/`
- `docs/community_visual_prototype_support_v0.6/`：视觉参考、组件契约、发布流程、验收清单与 tokens

后端云函数源码位于 `apps/workbuddy-app/cloudfunctions/`。本次前端收口未修改后端；联系方式、商品、收藏、地图和 groupPool 按现有 CloudBase 契约接入。

## 5. 环境与部署边界

- 微信构建只配置 `TARO_APP_CLOUD_ENV`，不把腾讯地图 Key 放进 weapp 包。
- 腾讯地图 Key 由 CloudBase 云函数环境变量 `TENCENT_MAP_KEY` 提供。
- `.env.local` 不入库；模板是 `apps/codex-taro-app/.env.example`。
- 发布、收藏、标记已出、聊天和联系方式交换需要已部署云函数与有效 CloudBase 环境。

## 6. 最终验证

在 `apps/codex-taro-app` 执行：

- `npm run typecheck`：PASS
- `npm run build:h5`：PASS
- `npm run build:weapp`：PASS
- `weapp-doctor`：11/11 pages OK

构建仅有 Dart Sass legacy API/import 弃用提示，不影响产物生成。真实双账号、授权、CloudBase 函数部署和真机交互仍需在微信开发者工具/真机完成最终 smoke。
