import { Text, View } from '@tarojs/components'
import './index.scss'

type SectionHeadingProps = {
  eyebrow?: string
  title: string
  action?: string
  onAction?: () => void
}

export default function SectionHeading({ eyebrow, title, action, onAction }: SectionHeadingProps) {
  return (
    <View className='section-heading'>
      <View>
        {eyebrow && <Text className='section-eyebrow'>{eyebrow}</Text>}
        <Text className='section-title'>{title}</Text>
      </View>
      {action && <Text className='section-action' onClick={onAction}>{action}</Text>}
    </View>
  )
}

