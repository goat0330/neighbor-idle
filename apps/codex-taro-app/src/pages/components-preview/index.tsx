import { Image, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import {
  BottomNav,
  CategoryTabs,
  ListingManageRow,
  ProductCard,
  SearchLocationBar,
  WantedCard,
  type BottomNavTab,
  type CategoryTab,
} from '@/components/community'
import './index.scss'

import deskImage from '@/assets/mock/product-desk.png'
import washerImage from '@/assets/mock/product-washer.png'
import sofaImage from '@/assets/mock/product-sofa.png'
import booksImage from '@/assets/mock/product-books.png'
import riceCookerImage from '@/assets/mock/product-rice-cooker.png'
import strollerImage from '@/assets/mock/product-stroller.png'
import airpodsImage from '@/assets/mock/product-airpods.png'
import bagImage from '@/assets/mock/product-bag.png'
import bicycleImage from '@/assets/mock/product-bicycle.png'
import avatarOrange from '@/assets/mock/avatar-orange.png'
import avatarGreen from '@/assets/mock/avatar-green.png'
import avatarBlue from '@/assets/mock/avatar-blue.png'
import avatarBrown from '@/assets/mock/avatar-brown.png'
import referenceProductCard from '@/assets/mock/reference-product-card.png'
import referenceWantedCard from '@/assets/mock/reference-wanted-card.png'
import referenceListingRow from '@/assets/mock/reference-listing-row.png'

const categories: CategoryTab[] = ['全部', '家具', '家电', '数码', '母婴', '图书', '其他'].map((label) => ({ key: label, label }))

const products = [
  { id: 'preview-desk', image: deskImage, title: '宜家书桌', price: 50, avatar: avatarOrange, nickname: '小橘子', communityName: '金水花园', distanceM: 320 },
  { id: 'preview-washer', image: washerImage, title: '小天鹅洗衣机 6.5kg', price: 300, avatar: avatarGreen, nickname: '阿青', communityName: '金水花园二期', distanceM: 450 },
  { id: 'preview-sofa', image: sofaImage, title: '双人布艺沙发', price: 120, avatar: avatarBlue, nickname: '木木', communityName: '金水花园', distanceM: 280 },
  { id: 'preview-books', image: booksImage, title: '《人间值得》全新', price: 10, avatar: avatarBrown, nickname: '阿禾', communityName: '金水花园南区', distanceM: 180 },
  { id: 'preview-rice', image: riceCookerImage, title: '苏泊尔电饭煲 3L', price: 60, avatar: avatarGreen, nickname: '七喜', communityName: '金水花园', distanceM: 520 },
  { id: 'preview-stroller', image: strollerImage, title: '婴儿推车可折叠', price: 80, avatar: avatarBrown, nickname: '可可妈', communityName: '金水花园二期', distanceM: 360 },
]

export default function ComponentsPreviewPage() {
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('全部')
  const [activeNav, setActiveNav] = useState<BottomNavTab>('idle')

  const notify = (title: string) => Taro.showToast({ title, icon: 'none' })

  return (
    <View className='components-preview-page'>
      <View className='preview-header'>
        <Text className='preview-title'>组件预览</Text>
        <Text className='preview-subtitle'>Round 1.1 · local mock · 390×844</Text>
      </View>

      <View className='preview-section'>
        <Text className='preview-label'>01 · SearchLocationBar</Text>
        <SearchLocationBar
          value={keyword}
          communityName='金水花园'
          onInput={setKeyword}
          onOpenCommunity={() => notify('打开社区选择')}
        />
      </View>

      <View className='preview-section'>
        <Text className='preview-label'>02 · CategoryTabs</Text>
        <CategoryTabs value={category} items={categories} onChange={setCategory} />
      </View>

      <View className='preview-section'>
        <Text className='preview-label'>03 · ProductCard</Text>
        <View className='preview-product-grid'>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              image={product.image}
              title={product.title}
              price={product.price}
              seller={{ avatar: product.avatar, nickname: product.nickname }}
              communityName={product.communityName}
              distanceM={product.distanceM}
              status='selling'
              onOpen={() => notify('打开商品详情')}
              onContact={() => notify('进入商品聊天')}
            />
          ))}
        </View>
      </View>

      <View className='preview-section'>
        <Text className='preview-label'>04 · WantedCard</Text>
        <View className='preview-wanted-list'>
          <WantedCard
            id='preview-wanted-01'
            avatar={avatarBlue}
            nickname='阿辉'
            title='求一个小书桌'
            budgetText='¥80 - ¥120'
            communityName='金水花园'
            publishedAtText='10分钟前'
            description='求购一张小书桌，尺寸不大，八成新以上，带抽屉更好。'
            onOffer={() => notify('进入求购会话')}
          />
          <WantedCard
            id='preview-wanted-02'
            avatar={avatarBrown}
            nickname='小鱼'
            title='求儿童自行车'
            budgetText='¥100 - ¥180'
            communityName='金水花园'
            publishedAtText='25分钟前'
            description='孩子 6 岁，求 16 寸左右的儿童自行车，最好九成新。'
            onOffer={() => notify('进入求购会话')}
          />
        </View>
      </View>

      <View className='preview-section'>
        <Text className='preview-label'>05 · BottomNav + PublishFAB</Text>
        <View className='preview-nav-sample'>
          <Text>点击底部导航查看选中态</Text>
        </View>
      </View>

      <View className='preview-section'>
        <Text className='preview-label'>06 · ListingManageRow</Text>
        <View className='preview-listing-list'>
          <ListingManageRow
            id='preview-listing-01'
            image={airpodsImage}
            title='宜家书桌'
            price={50}
            views={28}
            favorites={2}
            updatedAtText='昨天更新'
            onOpen={() => notify('打开我的商品')}
            onMarkSold={() => notify('确认标记已出')}
          />
          <ListingManageRow
            id='preview-listing-02'
            image={bagImage}
            title='复古帆布单肩包'
            price={65}
            views={12}
            favorites={1}
            updatedAtText='2天前更新'
            onOpen={() => notify('打开我的商品')}
            onMarkSold={() => notify('确认标记已出')}
          />
          <ListingManageRow
            id='preview-listing-03'
            image={bicycleImage}
            title='山地自行车 捷安特'
            price={900}
            views={56}
            favorites={3}
            updatedAtText='3天前更新'
            onOpen={() => notify('打开我的商品')}
            onMarkSold={() => notify('确认标记已出')}
          />
        </View>
      </View>

      <View className='preview-section preview-compare-section'>
        <Text className='preview-label'>REFERENCE / IMPLEMENTATION</Text>
        <View className='preview-compare'>
          <Text className='preview-compare-label'>ProductCard · P01</Text>
          <Image className='preview-reference-image preview-reference-product' src={referenceProductCard} mode='widthFix' />
          <Text className='preview-compare-label'>IMPLEMENTATION</Text>
          <View className='preview-compare-product'>
            <ProductCard
              id='compare-product'
              image={deskImage}
              title='宜家书桌'
              price={50}
              seller={{ avatar: avatarOrange, nickname: '小橘子' }}
              communityName='金水花园'
              distanceM={320}
              status='selling'
              onOpen={() => notify('打开商品详情')}
              onContact={() => notify('进入商品聊天')}
            />
          </View>
        </View>

        <View className='preview-compare'>
          <Text className='preview-compare-label'>WantedCard · P04</Text>
          <Image className='preview-reference-image' src={referenceWantedCard} mode='widthFix' />
          <Text className='preview-compare-label'>IMPLEMENTATION</Text>
          <WantedCard
            id='compare-wanted'
            avatar={avatarBlue}
            nickname='阿辉'
            title='求一个小书桌'
            budgetText='¥80 - ¥120'
            communityName='金水花园'
            publishedAtText='10分钟前'
            description='求购一张小书桌，尺寸不大，八成新以上，带抽屉更好。'
            onOffer={() => notify('进入求购会话')}
          />
        </View>

        <View className='preview-compare'>
          <Text className='preview-compare-label'>ListingManageRow · P09</Text>
          <Image className='preview-reference-image' src={referenceListingRow} mode='widthFix' />
          <Text className='preview-compare-label'>IMPLEMENTATION</Text>
          <View className='preview-compare-listing'>
            <ListingManageRow
              id='compare-listing'
              image={airpodsImage}
              title='Apple AirPods Pro 2代'
              price={1200}
              views={28}
              favorites={2}
              updatedAtText='昨天更新'
              onOpen={() => notify('打开我的商品')}
              onMarkSold={() => notify('确认标记已出')}
            />
          </View>
        </View>
      </View>

      <View className='preview-bottom-space' />
      <BottomNav
        active={activeNav}
        onChange={setActiveNav}
        onPublish={() => notify('打开发布动作')}
      />
    </View>
  )
}
