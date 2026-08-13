# 邻里二手小程序

这是一个面向小区内闲置流转的双版本协作仓库：

- `apps/workbuddy-app`：WorkBuddy 原生微信小程序 + CloudBase 业务基线，保留完整云函数、管理能力和数据模型。
- `apps/codex-taro-app`：最终融合主产品，使用 React + TypeScript + Vite + Taro；已吸收并深化 WorkBuddy 的四个地图组件。

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

将 `dist` 导入微信开发者工具。正式定位需要在 `.env.local` 配置腾讯地图 Key，并在腾讯位置服务控制台绑定小程序 AppID、限制接口与配额。

推荐的本地 worktree：

```text
D:\WorkBuddy\2026-08-13-08-41-12\worktrees\workbuddy
D:\WorkBuddy\2026-08-13-08-41-12\worktrees\codex
```

详细约束见 [`docs/协作规范.md`](./docs/协作规范.md)。

## 重要安全说明

公开仓库不提交 `project.private.config.json`、环境变量、地图 Key、管理员 openid 或真实客服联系方式。仓库中的 AppID 为游客占位值；上线前按 [`docs/上线说明.md`](./docs/上线说明.md) 完成人工配置、隐私声明、内容安全和提审。
