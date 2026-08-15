import { Image, Text, View } from '@tarojs/components'
import './index.scss'

export type ListingManageRowProps = {
  id: string
  image: string
  title: string
  price: number
  views?: number
  favorites?: number
  updatedAtText?: string
  sold?: boolean
  onOpen: (id: string) => void
  onMarkSold: (id: string) => void
}

export default function ListingManageRow({
  id,
  image,
  title,
  price,
  views,
  favorites,
  updatedAtText,
  sold = false,
  onOpen,
  onMarkSold,
}: ListingManageRowProps) {
  const stats = [
    views === undefined ? '' : `${views} 浏览`,
    favorites === undefined ? '' : `${favorites} 收藏`,
    updatedAtText || '',
  ].filter(Boolean).join(' · ')

  return (
    <View className='listing-manage-row' onClick={() => onOpen(id)}>
      <Image className='listing-manage-image' src={image} mode='aspectFill' />
      <View className='listing-manage-content'>
        <Text className='listing-manage-title'>{title}</Text>
        <Text className='listing-manage-price'>¥{price}</Text>
        {stats && <Text className='listing-manage-stats'>{stats}</Text>}
      </View>
      <View className={`listing-manage-action ${sold ? 'listing-manage-action--sold' : ''}`} onClick={(event) => { event.stopPropagation(); onMarkSold(id) }}>
        <Text>{sold ? '取消标记' : '标记已出'}</Text>
      </View>
    </View>
  )
}
