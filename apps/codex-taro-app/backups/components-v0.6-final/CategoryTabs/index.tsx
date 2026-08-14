import { ScrollView, Text, View } from '@tarojs/components'
import './index.scss'

export type CategoryTab = {
  key: string
  label: string
}

export type CategoryTabsProps = {
  value: string
  items: CategoryTab[]
  onChange: (key: string) => void
}

export default function CategoryTabs({ value, items, onChange }: CategoryTabsProps) {
  return (
    <ScrollView className='category-tabs' scrollX enhanced showScrollbar={false}>
      <View className='category-tabs-inner'>
        {items.map((item) => (
          <Text
            key={item.key}
            className={`category-tab ${value === item.key ? 'category-tab-active' : ''}`}
            onClick={() => onChange(item.key)}
          >
            {item.label}
          </Text>
        ))}
      </View>
    </ScrollView>
  )
}
