import { ScrollView, Text, View } from '@tarojs/components'
import './index.scss'

export const QUICK_QUESTION_ITEMS = ['还在吗？', '今天方便拿吗？', '能便宜点吗？', '尺寸多大？'] as const

export type QuickQuestionChipsProps = {
  onSelect?: (question: string) => void
}

export default function QuickQuestionChips({ onSelect }: QuickQuestionChipsProps) {
  return (
    <ScrollView scrollX className='quick-question-chips'>
      <View className='quick-question-chips__track'>
        {QUICK_QUESTION_ITEMS.map((question) => (
          <View key={question} className='quick-question-chips__item' onClick={() => onSelect?.(question)}>
            <Text>{question}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
