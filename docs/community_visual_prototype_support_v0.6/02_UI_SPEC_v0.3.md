# 02｜UI 规格 V0.3

## 1. 色彩

直接读取 `design-tokens-v0.3.json`。

核心：

```text
Page              #F5F5F3
Surface           #FAFAF8
Surface Strong    #FFFFFF
Text Primary      #222222
Text Secondary    #777773
Text Tertiary     #A3A39E
Border            #E8E7E3
Brand             #FF7433
Brand Soft        #FFF1E8
```

使用原则：

- 橙色不是背景色，是“动作/价格强调色”。
- 普通图标默认黑灰。
- 成功状态可以用低饱和绿色。
- 不允许为了“活泼”继续增加紫/蓝/红等装饰色。

---

## 2. 圆角 / 阴影

### 圆角

- 搜索框：14–18
- ProductCard：14
- 商品图：12–14
- Sheet：顶部 18
- 小按钮：10 或 pill

### 阴影

默认：

```css
box-shadow: none;
border: 1px solid #E8E7E3;
```

只允许以下元素轻阴影：

- FAB
- BottomSheet
- 固定 BottomNav
- 必要的顶层浮层

---

## 3. 首页

### SearchLocationBar

- 单行
- 高度约 44
- 左搜索约 70%
- 右社区约 30%
- 搜索底 `#FAFAF8`
- 社区名不超过 6 个汉字

### CategoryTabs

不要全胶囊。

```text
全部   家具   家电   数码   母婴   图书   其他
━━
```

选中：

- `#222`
- 600 / 700
- 2px 暖橙短 underline

未选：

- `#555 ~ #777`

### ProductGrid

- 2 列
- gap 10–12
- 首版统一图片比例建议 `16:10`
- 不做复杂 Masonry

### ProductCard

```text
┌─────────────────┐
│   ProductImage  │
├─────────────────┤
│ 标题            │
│ ¥价格           │
│ [头像] 昵称   问问│
│ 小区 · 距离      │
└─────────────────┘
```

建议：

- Card padding：10–12
- title：15–16
- price：18
- avatar：24
- location：12
- `问问卖家`：26–28 高，低权重
- 卡片无收藏爱心常驻按钮，除非后续验证有必要

---

## 4. 底部导航

```text
闲置    求购       ＋       消息    我的
                 发布
```

- 高度：约 64 + safe area
- inactive：`#555~#777`
- active：`#222` + 少量品牌色
- FAB：58
- FAB 上浮：8
- FAB 文案保持 `发布`
- 五个入口视觉均衡，只有 FAB 是强动作

---

## 5. 消息

MessageThreadRow 推荐高度 104–112。

```text
[80x80图]  标题                         时间
           ¥价格                       状态
           [24头像] 昵称
           最近一句消息
```

高级化规则：

- 不套大白卡时，可用整页 Surface + divider。
- 状态只使用 12px 文字或很小 Badge。
- 最多一处绿色状态。
- 未读用小圆点，不新增大按钮。

---

## 6. 我的

### ProfileHeader

压缩为轻个人卡：

```text
[头像] 麦克斯
       金水花园住户
                       联系方式设置 >
```

### Stats

一行：

```text
在售 3          已出 7          收藏 28
```

### ListingManageRow

建议高度 88–96。

右侧动作：

`标记已出 >`

不要大描边按钮。

---

## 7. 商品详情

Hero image：
- 首图大图
- 可轮播
- 右下 `1/5`

卖家卡：
- 头像 42–48
- 昵称
- `金水花园住户`
- `金水花园 · 320m`
- 小号 `问问卖家`

快速问题：
- `还在吗？`
- `今天方便拿吗？`
- `能便宜点吗？`
- `尺寸多大？`

底部：
- 左 `收藏`
- 右主 CTA `问问卖家`
- 主 CTA 可使用品牌橙，但高度控制 46–50，不做超大广告感按钮。

---

## 8. 求购卡

WantedCard 不用商品大图。

```text
[头像] 昵称                         今天
求一个小书桌
预算 ¥50–100
金水花园
                                  我有这个 >
```

- 使用 divider / 轻 surface。
- `我有这个` 是文字动作或小号 outline。
- 预算使用品牌橙，但不要比标题更抢眼。
