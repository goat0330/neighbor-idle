import { Input, Text, View } from '@tarojs/components'
import './index.scss'

export type SearchLocationBarProps = {
  value?: string
  placeholder?: string
  communityName: string
  onInput?: (value: string) => void
  onSearch?: (value: string) => void
  onOpenCommunity?: () => void
}

export default function SearchLocationBar({
  value = '',
  placeholder = '搜索闲置物品',
  communityName,
  onInput,
  onSearch,
  onOpenCommunity,
}: SearchLocationBarProps) {
  return (
    <View className='search-location-bar'>
      <View className='search-location-input-wrap'>
        <View className='search-location-icon' />
        <Input
          className='search-location-input'
          value={value}
          placeholder={placeholder}
          confirmType='search'
          onInput={(event) => onInput?.(event.detail.value)}
          onConfirm={(event) => onSearch?.(event.detail.value)}
        />
      </View>
      <View className='search-location-community' onClick={onOpenCommunity}>
        <Text className='search-location-name'>{communityName}</Text>
        <Text className='search-location-chevron'>⌄</Text>
      </View>
    </View>
  )
}
