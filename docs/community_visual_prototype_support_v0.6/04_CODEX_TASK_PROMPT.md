# 04｜可直接给 Codex 的实现任务

你正在 `codex/community-visual` worktree 中实现微信小程序 V0.3 视觉原型。

## 目标

在不重写已有业务服务、地图、消息、联系方式逻辑的前提下，完成一个可运行的 React + TypeScript + Taro 4.2 视觉闭环。

视觉参考：

- `references/01_home_v0.3.png`
- `references/02_messages_v0.3.png`
- `references/03_profile_v0.3.png`
- `references/04_product_detail_v0.3.png`

产品与视觉约束：

- 阅读 `01_PRODUCT_FREEZE_v0.3.md`
- 阅读 `02_UI_SPEC_v0.3.md`
- 阅读 `03_COMPONENT_CONTRACTS_v0.3.md`
- 设计 Token 以 `design-tokens-v0.3.json` 为准
- Mock 数据可先用 `prototype-mock-v0.3.json`

## 冻结决策

1. 五栏：`闲置｜求购｜＋发布｜消息｜我的`
2. 中央发布突出，统一亮色 `#FF7433`
3. 删除“免费送”
4. 大面积背景不用橙色渐变
5. 商品卡弱边框、低阴影
6. `问问卖家` 为轻量动作
7. 消息列表点击整行直接进入聊天
8. 联系方式申请在聊天页 Bottom Sheet 处理
9. 我的页轻管理，不做电商个人中心
10. 求购页是轻列表，不复制商品双列瀑布流

## 第一批只做

```text
SearchLocationBar
CategoryTabs
ProductCard
WantedCard
MessageThreadRow
BottomNav
PublishFAB
PublishActionSheet
ContactRequestSheet
ProfileHeader
ListingManageRow
StatusBadge
```

## 页面顺序

```text
1. 闲置首页
2. 商品详情
3. 消息列表
4. 我的
5. 求购
6. 发布 Action Sheet
```

## 文件修改原则

- 先检查现有组件、页面、tokens、services。
- 复用已有业务逻辑，不重写已有 services。
- 只在确实需要时新增组件。
- 不为了“统一架构”重构无关代码。
- 当前目标是视觉闭环和核心交互闭环，不扩展支付、订单、物流、好友系统。

## 交互验收

### 首页
- 搜索和社区在同一层。
- 分类无“免费送”。
- 两列商品。
- 商品卡包含卖家头像/昵称/小区/距离。
- 点击卡片进详情。
- 点击“问问卖家”进入对应商品会话。

### 底栏
- 五栏可切换。
- 中央 FAB 比其它 Tab 明显，但不过度巨大。
- FAB 点击弹出 `出闲置 / 发求购`。

### 消息
- 无大“同意交换”按钮。
- 点击整行直接进会话。
- 状态只做小标签/文字。

### 我的
- 联系方式设置只保留一个入口。
- 在售/已出/收藏紧凑展示。
- `标记已出` 是小动作。

### 商品详情
- 大图、价格、卖家、小区、自提、快速提问完整。
- 底部 `收藏 + 问问卖家`。
- 不出现购物车 / 立即购买 / 平台支付。

## 最后运行

```bash
npm run typecheck
npm run build:h5
npm run build:weapp
```

如果某一项失败，先修复当前视觉实现引入的问题，不顺手重构无关模块。
