import { Image, Text, View } from '@tarojs/components'
import { useState } from 'react'
import './index.scss'

export type ProductStatus = 'selling' | 'sold'

export type ProductCardProps = {
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

function formatDistance(distanceM?: number) {
  if (distanceM === undefined) return '附近'
  if (distanceM < 1000) return `${distanceM}m`
  return `${(distanceM / 1000).toFixed(1)}km`
}

export default function ProductCard({
  id,
  image,
  title,
  price,
  seller,
  communityName,
  distanceM,
  status,
  onOpen,
  onContact,
}: ProductCardProps) {
  const sold = status === 'sold'
  const fallbackAvatar = seller.nickname.slice(0, 1) || '邻'
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <View className={`product-card ${sold ? 'product-card-sold' : ''}`} onClick={() => onOpen(id)}>
      {image && !imageFailed
        ? <Image className='product-card-image' src={image} mode='aspectFill' lazyLoad onError={() => setImageFailed(true)} />
        : <View className='product-card-image product-card-image-empty'><Text>邻里闲置</Text></View>}
      <View className='product-card-body'>
        <Text className='product-card-title'>{title}</Text>
        <Text className='product-card-price'>¥{price}</Text>
        <View className='product-card-seller-row'>
            <View className='product-card-seller'>
              {seller.avatar ? <Image className='product-card-avatar' src={seller.avatar} mode='aspectFill' /> : <View className='product-card-avatar product-card-avatar-fallback'>{fallbackAvatar}</View>}
              <View className='product-card-seller-copy'>
                <Text className='product-card-nickname'>{seller.nickname}</Text>
                <Text className='product-card-location'>{communityName} · {formatDistance(distanceM)}</Text>
              </View>
            </View>
          <View className='product-card-contact' onClick={(event) => { event.stopPropagation(); onContact(id) }}>
            <Text>问问卖家</Text>
          </View>
        </View>
      </View>
      {sold && <Text className='product-card-status'>已售出</Text>}
    </View>
  )
}
