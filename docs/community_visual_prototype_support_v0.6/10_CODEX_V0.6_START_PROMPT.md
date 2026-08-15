# Codex V0.6 组件复刻启动指令

当前 V0.3 H5 的功能方向基本存在，但视觉实现不合格。立即停止整页自由发挥，切换到组件级高保真复刻。

先读取：
1. `09_CODEX_COMPONENT_REPLICATION_TASKS_v0.6.md`
2. `08_NINE_SCREENS_PM_NOTES_v0.5.md`
3. `02_UI_SPEC_v0.3.md`

## 本轮只做 6 个组件

- SearchLocationBar
- CategoryTabs
- ProductCard
- WantedCard
- BottomNav + PublishFAB
- ListingManageRow

新增开发路由 `/components-preview`，六个组件必须先在这里独立展示和验收。

视觉基线必须使用 `references/` 下的原型 PNG。当前 H5 只能作为功能参考，不能作为视觉参考。

## 核心验收

每个组件：
1. 在 390×844 下截图；
2. 与原型并排对比；
3. 修正结构、比例、间距、字体层级、圆角、颜色；
4. 只有达到 `MATCHED` 才允许组装页面。

不要：
- 整页重做
- 自己重新设计
- 改原型信息结构
- 增加绿色按钮
- 引入电商卡片逻辑
- 为了工程方便删头像、小区、距离、CTA
- 重构无关业务代码

先把组件做准，再谈页面。
