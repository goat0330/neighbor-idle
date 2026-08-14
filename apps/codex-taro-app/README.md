# Codex Taro 小程序

这是邻里二手项目的 React 版本，技术栈固定为：

- React 18
- TypeScript
- Taro 4.2.1
- Taro Vite compiler
- 微信小程序平台

## 本地运行

```bash
npm install
npm run typecheck
npm run dev:weapp
```

微信小程序编译生成物在 `dist-weapp/`，用微信开发者工具导入本目录即可。当前项目 AppID 为 `wx00edfdef9d44805f`；个人开发者配置文件不提交到 GitHub。

## 手机端 H5 Review

```bash
npm run dev:h5
```

浏览器打开 `http://127.0.0.1:10086/index.html`。H5 开发服务固定使用手机端入口，建议按 390 × 844 视口检查；静态 review 包在仓库根目录的 `review/`。

## 代码分层

- `src/pages`：页面和业务编排
- `src/components`：可复用 React/Taro 组件
- `src/services`：后端接口和本地 mock 的边界
- `src/design`：Figma 决策契约对应的设计 Token

未配置 `TARO_APP_CLOUD_ENV` 时使用固定本地素材和 mock 数据完成 H5 交互；配置后，商品、求购、用户资料、会话、收藏和联系方式均通过现有 CloudBase 云函数访问，页面交互结构不变。微信端地图通过 `tencentMap` 云函数访问腾讯位置服务；真实 Key 只配置在云函数环境变量 `TENCENT_MAP_KEY`，详见 [`docs/腾讯地图后端接入.md`](../../docs/腾讯地图后端接入.md)。
