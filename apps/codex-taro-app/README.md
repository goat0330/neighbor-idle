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

编译生成物在 `dist/`，用微信开发者工具导入本目录即可。正式开发前请把 `project.config.json` 中的 `touristappid` 替换为自己的 AppID；个人开发者配置文件不提交到 GitHub。

## 代码分层

- `src/pages`：页面和业务编排
- `src/components`：可复用 React/Taro 组件
- `src/services`：后端接口和本地 mock 的边界
- `src/design`：Figma 决策契约对应的设计 Token

当前 mock 数据用于把页面和交易闭环跑起来。后续接入 CloudBase 时，只替换 `src/services`，不改页面组件中的交互结构。

