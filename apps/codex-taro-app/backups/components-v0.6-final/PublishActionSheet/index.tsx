import { Text, View } from '@tarojs/components'
import './index.scss'

export type PublishActionSheetProps = {
  open: boolean
  onClose: () => void
  onPublishProduct: () => void
  onPublishWanted: () => void
}

export default function PublishActionSheet({
  open,
  onClose,
  onPublishProduct,
  onPublishWanted,
}: PublishActionSheetProps) {
  if (!open) return null

  return (
    <View className='publish-sheet-mask' onClick={onClose}>
      <View className='publish-sheet' onClick={(event) => event.stopPropagation()}>
        <View className='publish-sheet-handle' />
        <Text className='publish-sheet-title'>发布什么</Text>
        <Text className='publish-sheet-copy'>选择一种方式，让邻居更快回应</Text>
        <View className='publish-sheet-options'>
          <View className='publish-sheet-option publish-sheet-option-primary' onClick={onPublishProduct}>
            <Text className='publish-sheet-option-icon'>＋</Text>
            <View className='publish-sheet-option-copy'>
              <Text className='publish-sheet-option-title'>出闲置</Text>
              <Text className='publish-sheet-option-description'>分享暂时用不到的好物</Text>
            </View>
            <Text className='publish-sheet-option-arrow'>›</Text>
          </View>
          <View className='publish-sheet-option' onClick={onPublishWanted}>
            <Text className='publish-sheet-option-icon'>⌕</Text>
            <View className='publish-sheet-option-copy'>
              <Text className='publish-sheet-option-title'>发求购</Text>
              <Text className='publish-sheet-option-description'>告诉邻居你正在找什么</Text>
            </View>
            <Text className='publish-sheet-option-arrow'>›</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
