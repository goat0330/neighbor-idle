# 邻里二手小程序

这是一个面向小区内闲置流转的双版本协作仓库：

产品第一原则：**只强调附近买卖闲置**。启动直达附近列表，底部固定五栏为“闲置 / 求购 / 发布 / 消息 / 我的”，发布是中央独立动作。

- `apps/workbuddy-app`：WorkBuddy 原生微信小程序 + CloudBase 业务基线，保留完整云函数、管理能力和数据模型。
- `apps/codex-taro-app`：最终融合主产品，使用 React + TypeScript + Vite + Taro；已吸收并深化 WorkBuddy 的四个地图组件。

CloudBase 后端现已覆盖私有用户资料、双向会话、消息未读和“买家申请—卖家批准—展示/撤回微信号”授权流程；详细接口见 [`docs/数据模型与接口.md`](./docs/数据模型与接口.md)。

## 目录

```text
apps/
├── workbuddy-app/       # 云开发 + 管理后台版本
└── codex-taro-app/      # React + TypeScript + Vite + Taro 版本
docs/
├── 版本对比.md
├── 协作规范.md
├── 上线说明.md
├── 最终融合产品方案.md
├── 数据模型与接口.md
├── 安全与隐私.md
├── 工作日志/2026-08-14.md
└── figma/               # Figma 决策契约与交付记录
```

## 协作方式

主仓库使用 `main`，两条开发线分别为：

- `workbuddy/develop`：只推进 `apps/workbuddy-app`
- `codex/develop`：只推进 `apps/codex-taro-app`

最终发布候选以 `apps/codex-taro-app` 为准；`apps/workbuddy-app` 作为稳定的 CloudBase 后端和原生页面参考。地图组件已迁移到 Taro 并修复拖拽中心点、定位失败、附近 POI 与距离展示问题。

## 本地运行

```powershell
cd apps/codex-taro-app
Copy-Item .env.example .env.local
npm ci
npm run typecheck
npm run build:weapp
```

将 `dist-weapp` 导入微信开发者工具。手机端 H5 Review 可运行：

```powershell
npm run dev:codex:h5
```

然后打开 `http://127.0.0.1:10086/index.html`；固定手机尺寸的静态 review 包在 [`review/`](./review/)。

微信端只需在 `.env.local` 配置 `TARO_APP_CLOUD_ENV`，地图通过 CloudBase `tencentMap` 云函数访问；H5 本地调试才可按需配置腾讯地图 Key。

推荐的本地 worktree：

```text
D:\WorkBuddy\2026-08-13-08-41-12\worktrees\workbuddy
D:\WorkBuddy\2026-08-13-08-41-12\worktrees\codex
```

详细约束见 [`docs/协作规范.md`](./docs/协作规范.md)。

## 重要安全说明

公开仓库不提交 `project.private.config.json`、环境变量、地图 Key、管理员 openid 或真实客服联系方式。当前微信开发者工具 AppID 已配置为 `wx00edfdef9d44805f`；上线前仍需按 [`docs/上线说明.md`](./docs/上线说明.md) 完成人工配置、隐私声明、内容安全和提审。
