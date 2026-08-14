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
        <Text className='cover-label'>邻里集市</Text>
        <Text className='cover-title'>买卖闲置，<Text className='cover-title-accent'>就在附近。</Text></Text>
        <Text className='cover-subtitle'>只做一件事：让附近邻居更快完成一次闲置交易。</Text>
      </View>
      <View className='cover-actions fade-in'>
        <View className='cover-location'>
          <Text className='cover-location-dot'>●</Text>
          <View>
            <Text className='cover-location-label'>当前浏览</Text>
          <Text className='cover-location-value'>金水花园</Text>
          </View>
          <Text className='cover-location-arrow'>↗</Text>
        </View>
        <Button className='cover-button' onClick={() => Taro.reLaunch({ url: '/pages/home/index' })}>进入附近闲置</Button>
        <Text className='cover-note'>看闲置 · 聊价格 · 约自提</Text>
      </View>
    </View>
  )
}
