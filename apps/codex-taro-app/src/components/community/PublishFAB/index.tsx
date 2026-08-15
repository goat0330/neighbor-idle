import { Text, View } from '@tarojs/components'
import './index.scss'

export type PublishFABProps = {
  onClick: () => void
}

export default function PublishFAB({ onClick }: PublishFABProps) {
  return (
    <View className='publish-fab' onClick={onClick}>
      <View className='publish-fab-visual'>
        <View className='publish-fab-halo' />
        <View className='publish-fab-pedestal'>
          <View className='publish-fab-circle'><View className='publish-fab-plus' /></View>
        </View>
      </View>
      <Text className='publish-fab-label'>发布</Text>
    </View>
  )
}
