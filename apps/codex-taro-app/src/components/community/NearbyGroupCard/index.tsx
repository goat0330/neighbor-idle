import { Text, View } from '@tarojs/components'
import { joinGroup, type GroupPoolEntry } from '@services/groupPool'
import './index.scss'

export type NearbyGroupCardProps = {
  entry?: GroupPoolEntry | null
  onJoin?: (entry: GroupPoolEntry) => void | Promise<unknown>
}

export default function NearbyGroupCard({ entry, onJoin }: NearbyGroupCardProps) {
  if (!entry || entry.hidden) return null

  const displayName = entry.displayName.trim() || '附近生活群'
  const unavailable = !entry.available
  const meta = [
    entry.locationLabel,
    entry.distance === undefined ? undefined : String(entry.distance),
  ].filter(Boolean)

  const handleJoin = () => {
    if (unavailable) return
    if (onJoin) {
      void onJoin(entry)
      return
    }
    void joinGroup(entry)
  }

  return (
    <View className={`nearby-group-card ${unavailable ? 'is-unavailable' : ''}`}>
      <View className='nearby-group-card__copy'>
        <Text className='nearby-group-card__eyebrow'>附近生活圈</Text>
        <Text className='nearby-group-card__title'>
          {unavailable ? '附近生活群暂未开放' : `加入${displayName}`}
        </Text>
        {meta.length > 0 && <Text className='nearby-group-card__meta'>{meta.join(' · ')}</Text>}
        <Text className='nearby-group-card__subtitle'>
          {entry.subtitle || entry.unavailableReason || '附近生活群暂未开放，之后再来看看'}
        </Text>
      </View>
      {entry.available && (
        <View className='nearby-group-card__join' onClick={handleJoin}>
          <Text>加入</Text>
          <Text className='nearby-group-card__arrow'>›</Text>
        </View>
      )}
    </View>
  )
}
