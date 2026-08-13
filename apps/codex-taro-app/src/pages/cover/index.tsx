import { Button, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function CoverPage() {
  return (
    <View className='cover-page'>
      <View className='cover-orb cover-orb-one' />
      <View className='cover-orb cover-orb-two' />
      <View className='cover-topbar'>邻里集市</View>
      <View className='cover-copy fade-in'>
        <Text className='cover-label'>LOCAL LOOP · 01</Text>
        <Text className='cover-title'>闲置置换，<Text className='cover-title-accent'>就在附近。</Text></Text>
        <Text className='cover-subtitle'>邻居之间，今天就能拿走的好东西。</Text>
      </View>
      <View className='cover-actions fade-in'>
        <View className='cover-location'>
          <Text className='cover-location-dot'>●</Text>
          <View>
            <Text className='cover-location-label'>当前浏览</Text>
            <Text className='cover-location-value'>云杉里小区</Text>
          </View>
          <Text className='cover-location-arrow'>↗</Text>
        </View>
        <Button className='cover-button' onClick={() => Taro.switchTab({ url: '/pages/home/index' })}>逛逛附近闲置</Button>
        <Text className='cover-note'>小区认证后，可发布、留言和约定自提</Text>
      </View>
    </View>
  )
}

