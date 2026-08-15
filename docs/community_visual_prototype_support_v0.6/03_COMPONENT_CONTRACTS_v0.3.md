# 03｜React/Taro 组件契约 V0.3

下面是建议的最小组件边界。先让视觉闭环跑通，不做过度抽象。

```ts
export type TabKey = 'idle' | 'wanted' | 'publish' | 'messages' | 'me'

export type ProductStatus = 'selling' | 'sold'

export type IntentStatus =
  | 'chatting'
  | 'contact_pending'
  | 'contact_exchanged'
  | 'closed'
```

---

## SearchLocationBar

```ts
type SearchLocationBarProps = {
  value?: string
  placeholder?: string
  communityName: string
  onInput?: (value: string) => void
  onSearch?: (value: string) => void
  onOpenCommunity?: () => void
}
```

原则：
- 本身不负责地图/社区业务逻辑。
- 只发事件。

---

## CategoryTabs

```ts
type CategoryTab = {
  key: string
  label: string
}

type CategoryTabsProps = {
  value: string
  items: CategoryTab[]
  onChange: (key: string) => void
}
```

- 单选
- 横向滚动
- 不做多选
- 不做 Motion 依赖

---

## ProductCard

```ts
type ProductCardProps = {
  id: string
  image: string
  title: string
  price: number
  seller: {
    avatar: string
    nickname: string
  }
  communityName: string
  distanceM?: number
  status: ProductStatus
  onOpen: (id: string) => void
  onContact: (id: string) => void
}
```

ProductCard 不负责：
- 建会话
- 跳路由细节
- 收藏业务
- 联系方式业务

---

## WantedCard

```ts
type WantedCardProps = {
  id: string
  avatar: string
  nickname: string
  title: string
  budgetText?: string
  communityName: string
  publishedAtText: string
  onOffer: (id: string) => void
}
```

---

## MessageThreadRow

```ts
type MessageThreadRowProps = {
  id: string
  productThumb: string
  productTitle: string
  price: number
  counterpart: {
    avatar: string
    nickname: string
  }
  lastMessage: string
  timestamp: string
  intentStatus: IntentStatus
  unreadCount?: number
  onOpen: (id: string) => void
}
```

禁止在 Row 内直接审批联系方式。

---

## BottomNav

```ts
type BottomNavProps = {
  active: Exclude<TabKey, 'publish'>
  onChange: (key: Exclude<TabKey, 'publish'>) => void
  onPublish: () => void
}
```

UI：
- 5 个位置
- 中间 PublishFAB 是视觉主动作
- 业务上 Publish 不作为普通 Tab 页面常驻选中态

---

## PublishFAB

```ts
type PublishFABProps = {
  onClick: () => void
}
```

仅负责动作入口。

---

## PublishActionSheet

```ts
type PublishActionSheetProps = {
  open: boolean
  onClose: () => void
  onPublishProduct: () => void
  onPublishWanted: () => void
}
```

仅两个 action：
- 出闲置
- 发求购

---

## ContactRequestSheet

```ts
type ContactRequestSheetProps = {
  open: boolean
  counterpartName: string
  productTitle: string
  mode: 'incoming' | 'outgoing'
  onReject?: () => void
  onApprove?: () => void
  onClose: () => void
}
```

聊天页调用，不在消息列表调用。

---

## ProfileHeader

```ts
type ProfileHeaderProps = {
  avatar: string
  nickname: string
  communityLabel: string
  onOpenContactSettings: () => void
}
```

---

## ListingManageRow

```ts
type ListingManageRowProps = {
  id: string
  image: string
  title: string
  price: number
  views?: number
  favorites?: number
  updatedAtText?: string
  onOpen: (id: string) => void
  onMarkSold: (id: string) => void
}
```

---

## StatusBadge

```ts
type StatusBadgeProps = {
  status:
    | 'chatting'
    | 'contact_pending'
    | 'contact_exchanged'
    | 'sold'
}
```

一行最多一个状态，默认尺寸小。
