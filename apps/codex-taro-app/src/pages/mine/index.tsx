import { Button, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const entries = [
  ['我发布的', '3 件在售 · 1 件已成交'],
  ['我发起的求购', '2 条进行中'],
  ['交易评价', '4.9 分 · 爽快 12 · 描述相符 10'],
  ['隐私与黑名单', '管理联系方式授权和屏蔽用户'],
]

export default function MinePage() {
  const copyServiceWechat = () => Taro.setClipboardData({ data: 'neighbor_service_demo' })

  return (
    <View className='page-shell mine-page'>
      <Text className='eyebrow'>TRUSTED NEIGHBOR</Text>
      <View className='profile-card'>
        <View className='avatar'>邻</View>
        <View className='profile-main'>
          <Text className='profile-name'>云杉里邻居</Text>
          <Text className='profile-meta'>已认证 · 3 栋住户 · 信用 4.9</Text>
        </View>
        <Text className='verified-badge'>住户认证</Text>
      </View>
      <View className='trust-row'>
        <View><Text className='trust-value'>12</Text><Text className='trust-label'>爽快</Text></View>
        <View><Text className='trust-value'>10</Text><Text className='trust-label'>描述相符</Text></View>
        <View><Text className='trust-value'>0</Text><Text className='trust-label'>纠纷</Text></View>
      </View>
      <View className='mine-list'>
        {entries.map(([title, detail]) => (
          <View className='mine-entry' key={title}>
            <View><Text className='entry-title'>{title}</Text><Text className='entry-detail'>{detail}</Text></View>
            <Text className='entry-arrow'>›</Text>
          </View>
        ))}
      </View>
      <View className='service-card'>
        <Text className='service-title'>帮助与反馈</Text>
        <Text className='service-copy'>客服微信仅用于认证、举报和纠纷处理，不会要求提前付款或索取验证码。</Text>
        <Button className='service-button' onClick={copyServiceWechat}>复制客服微信</Button>
      </View>
      <Button className='map-demo-button' onClick={() => Taro.navigateTo({ url: '/pages/map-demo/index' })}>查看地图组件演示</Button>
    </View>
  )
}
