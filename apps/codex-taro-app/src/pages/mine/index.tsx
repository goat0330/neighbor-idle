import { Button, Input, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { backendEnabled, userApi, type UserProfile } from '@/services/backend'
import './index.scss'

const entries = [
  ['我发布的', '3 件在售 · 1 件已成交'],
  ['我发起的求购', '2 条进行中'],
  ['交易评价', '4.9 分 · 爽快 12 · 描述相符 10'],
  ['隐私与黑名单', '管理联系方式授权和屏蔽用户'],
]

export default function MinePage() {
  const [profile, setProfile] = useState<UserProfile>({ id: 'demo', nickname: '云杉里邻居', avatarUrl: '', communityId: 'demo', communityName: '云杉里小区', building: '3 栋', verificationStatus: 'verified', hasWechat: false, creditScore: 100, status: 'active' })
  const [showWechatForm, setShowWechatForm] = useState(false)
  const [wechatId, setWechatId] = useState('')
  const copyServiceWechat = () => Taro.setClipboardData({ data: 'neighbor_service_demo' })

  useEffect(() => {
    if (!backendEnabled) return
    userApi.me().then(setProfile).catch((error) => Taro.showToast({ title: error.message || '资料加载失败', icon: 'none' }))
  }, [])

  async function saveWechat() {
    try {
      const result = backendEnabled ? await userApi.setWechat(wechatId) : { hasWechat: Boolean(wechatId.trim()) }
      setProfile((current) => ({ ...current, hasWechat: result.hasWechat }))
      setWechatId('')
      setShowWechatForm(false)
      Taro.showToast({ title: result.hasWechat ? '交易微信已保存' : '交易微信已清除', icon: 'none' })
    } catch (error: any) {
      Taro.showToast({ title: error.message || '保存失败', icon: 'none' })
    }
  }

  return (
    <View className='page-shell mine-page'>
      <Text className='eyebrow'>TRUSTED NEIGHBOR</Text>
      <View className='profile-card'>
        <View className='avatar'>邻</View>
        <View className='profile-main'>
          <Text className='profile-name'>{profile.nickname}</Text>
          <Text className='profile-meta'>{profile.verificationStatus === 'verified' ? '已认证' : profile.verificationStatus === 'pending' ? '认证审核中' : '未认证'} · {profile.building || '未填写楼栋'} · 信用 {profile.creditScore}</Text>
        </View>
        <Text className='verified-badge'>{profile.verificationStatus === 'verified' ? '住户认证' : '去认证'}</Text>
      </View>
      <View className='wechat-setting' onClick={() => setShowWechatForm(true)}><View><Text className='entry-title'>交易微信</Text><Text className='entry-detail'>{profile.hasWechat ? '已安全保存，仅在你同意后向买家展示' : '未设置，同意买家申请前需要填写'}</Text></View><Text className='entry-arrow'>›</Text></View>
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
      {showWechatForm && <View className='wechat-modal-mask' onClick={() => setShowWechatForm(false)}><View className='wechat-modal' onClick={(event) => event.stopPropagation()}><Text className='service-title'>设置交易微信</Text><Text className='service-copy'>微信号不会出现在公开资料中，只有你批准具体买家的申请后才会展示。</Text><Input value={wechatId} maxlength={20} onInput={(event) => setWechatId(event.detail.value)} placeholder='输入微信号；留空可清除' /><View className='wechat-modal-actions'><Button onClick={() => setShowWechatForm(false)}>取消</Button><Button className='confirm' onClick={saveWechat}>安全保存</Button></View></View></View>}
    </View>
  )
}
