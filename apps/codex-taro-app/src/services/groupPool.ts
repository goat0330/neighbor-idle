import { backendEnabled } from './backend'
import { cloud } from './cloud'

export type DistanceValue = string | number

export type GeoCircleCenter = {
  latitude: number
  longitude: number
}

export type GeoCircleStatus = 'active' | 'inactive' | 'pending' | 'unknown'

export type GeoCircle = {
  id: string | null
  name: string
  center: GeoCircleCenter | null
  radiusM: number | null
  status: GeoCircleStatus
  distance?: DistanceValue
  locationLabel?: string
}

export type NearbyGeoCircleInput = {
  geoCircleId?: string | null
  geoCircleName?: string | null
  distance?: DistanceValue | null
  locationLabel?: string | null
  center?: GeoCircleCenter | null
  latitude?: number | null
  longitude?: number | null
  radiusM?: number | null
  status?: GeoCircleStatus | null
  /** Legacy fields remain accepted for existing display callers only. */
  community?: string | null
  communityName?: string | null
}

export type GroupPoolEntry = {
  geoCircleId: string | null
  geoCircleName: string
  displayName: string
  available: boolean
  subtitle: string
  geoCircle?: GeoCircle
  distance?: DistanceValue
  locationLabel?: string
  hidden?: boolean
  unavailableReason?: string
}

export type GroupJoinResult = {
  available: boolean
  joined: boolean
  entry: GroupPoolEntry | null
  message?: string
}

/**
 * Shape reserved for the first local fallback. It intentionally contains no
 * platform-specific join fields.
 */
export const mockGroupPoolEntry: GroupPoolEntry = {
  geoCircleId: null,
  geoCircleName: '附近生活圈',
  displayName: '附近生活群',
  available: false,
  subtitle: '附近生活群暂未开放，之后再来看看',
  unavailableReason: '附近生活群暂未开放',
}

type GroupPoolResponse = {
  geoCircle?: Partial<GeoCircle> | null
  entry?: Partial<GroupPoolEntry> | null
}

function cleanText(value?: string | null) {
  const text = value?.trim()
  return text || undefined
}

function cleanDistance(value?: DistanceValue | null) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  return cleanText(value)
}

function cleanCenter(input: NearbyGeoCircleInput): GeoCircleCenter | null {
  const center = input.center
  if (center && Number.isFinite(center.latitude) && Number.isFinite(center.longitude)) {
    return { latitude: center.latitude, longitude: center.longitude }
  }

  if (Number.isFinite(input.latitude) && Number.isFinite(input.longitude)) {
    return { latitude: input.latitude as number, longitude: input.longitude as number }
  }

  return null
}

function cleanRadiusM(value?: number | null) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

/**
 * Resolve only the user-facing nearby circle metadata. No backend call is
 * made; without either a geo-circle id or a display name there is no entry to
 * show.
 */
export function resolveNearbyGeoCircle(input?: NearbyGeoCircleInput | null): GeoCircle | null {
  if (!input) return null

  const id = cleanText(input.geoCircleId)
  const name = cleanText(input.geoCircleName) || cleanText(input.communityName) || cleanText(input.community)
  if (!id && !name) return null

  const circle: GeoCircle = {
    id: id || null,
    name: name || '附近生活圈',
    center: cleanCenter(input),
    radiusM: cleanRadiusM(input.radiusM),
    status: input.status || 'unknown',
  }

  const distance = cleanDistance(input.distance)
  if (distance !== undefined) circle.distance = distance

  const locationLabel = cleanText(input.locationLabel)
  if (locationLabel) circle.locationLabel = locationLabel

  return circle
}

/**
 * Return a safe local entry until a real group-pool backend is available.
 * A community id is never used as the entry key.
 */
export function getEntry(input?: NearbyGeoCircleInput | null): GroupPoolEntry | null {
  const circle = resolveNearbyGeoCircle(input)
  if (!circle) return null

  return {
    geoCircleId: circle.id,
    geoCircleName: circle.name,
    displayName: mockGroupPoolEntry.displayName,
    subtitle: mockGroupPoolEntry.subtitle,
    geoCircle: circle,
    distance: circle.distance,
    locationLabel: circle.locationLabel,
    available: false,
    unavailableReason: mockGroupPoolEntry.unavailableReason,
  }
}

/**
 * Resolve a real group-pool entry when the backend is configured. The page
 * still receives the local fallback when the function is unavailable, the
 * circle cannot be resolved, or the current environment is H5/local-only.
 */
export async function resolveEntry(input?: NearbyGeoCircleInput | null): Promise<GroupPoolEntry | null> {
  const fallback = getEntry(input)
  if (!backendEnabled || !input) return fallback

  const geoCircleId = cleanText(input.geoCircleId)
  const center = cleanCenter(input)
  const payload = geoCircleId
    ? { geoCircleId }
    : center
      ? { latitude: center.latitude, longitude: center.longitude }
      : null
  if (!payload) return fallback

  try {
    const result = await cloud.call<GroupPoolResponse>('groupPool', geoCircleId ? 'getEntry' : 'resolveNearby', payload)
    return normalizeServerEntry(result, fallback)
  } catch {
    return fallback
  }
}

function normalizeServerEntry(result: GroupPoolResponse | undefined, fallback: GroupPoolEntry | null) {
  const raw = result?.entry
  if (!raw) return fallback

  const serverCircle = result?.geoCircle
  const circleName = cleanText(raw.geoCircleName) || cleanText(serverCircle?.name) || fallback?.geoCircleName || '附近生活圈'
  const circleId = cleanText(raw.geoCircleId) || cleanText(serverCircle?.id || undefined) || fallback?.geoCircleId || null
  const available = raw.available === true
  return {
    geoCircleId: circleId,
    geoCircleName: circleName,
    displayName: cleanText(raw.displayName) || fallback?.displayName || '附近生活群',
    available,
    subtitle: cleanText(raw.subtitle) || fallback?.subtitle || '附近生活群暂未开放，之后再来看看',
    distance: raw.distance ?? fallback?.distance,
    locationLabel: cleanText(raw.locationLabel) || fallback?.locationLabel,
    unavailableReason: cleanText(raw.unavailableReason) || fallback?.unavailableReason,
    geoCircle: serverCircle ? {
      id: cleanText(serverCircle.id || undefined) || circleId,
      name: circleName,
      center: serverCircle.center || null,
      radiusM: typeof serverCircle.radiusM === 'number' ? serverCircle.radiusM : null,
      status: serverCircle.status || 'unknown',
    } : fallback?.geoCircle,
  }
}

/**
 * No-op join boundary for the front-end placeholder. It deliberately reports
 * unavailable instead of pretending that a group was joined.
 */
export async function joinGroup(entry?: GroupPoolEntry | null): Promise<GroupJoinResult> {
  return {
    available: false,
    joined: false,
    entry: entry || null,
    message: entry?.unavailableReason || '附近生活群暂未开放',
  }
}
