import { Text, View } from '@tarojs/components'
import './index.scss'

export type PublishFABProps = {
  onClick: () => void
}

export default function PublishFAB({ onClick }: PublishFABProps) {
  return (
    <View className='publish-fab' onClick={onClick}>
      <View className='publish-fab-circle'><Text className='publish-fab-plus'>＋</Text></View>
      <Text className='publish-fab-label'>发布</Text>
    </View>
  )
}
