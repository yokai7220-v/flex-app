import { openDB, type DBSchema } from 'idb'
import type { RoutineKind } from './data/program'
import { today, type DateStr } from './lib/date'

export type Log = {
  id: string
  routineId: string
  kind: RoutineKind
  date: DateStr
  createdAt: number
}

export const POSES = [
  { id: 'pike', label: 'Наклон' },
  { id: 'squat', label: 'Присед' },
  { id: 'front-l', label: 'Продольный (Л)' },
  { id: 'front-r', label: 'Продольный (П)' },
  { id: 'middle', label: 'Поперечный' },
  { id: 'pancake', label: 'Pancake' },
  { id: 'bridge', label: 'Мост' },
  { id: 'shoulders', label: 'Плечи' },
  { id: 'other', label: 'Другое' },
] as const

export type PoseId = (typeof POSES)[number]['id']

export type Photo = {
  id: string
  date: DateStr
  pose: PoseId
  state: 'cold' | 'warm'
  note: string
  blob: Blob
  thumb: Blob
  createdAt: number
}

export type Settings = {
  currentLevel: string
  levelStart: DateStr
  strengthMode: 'alternate' | 'weekdays'
  alternateStart: DateStr
  weekdays: number[]
  heavyMode: 'between' | 'after'
  criteria: Record<string, boolean>
  accent?: string
  lastBackup?: number
  installHintDismissed?: boolean
}

export const defaultSettings = (): Settings => ({
  currentLevel: 'l1',
  levelStart: today(),
  strengthMode: 'alternate',
  alternateStart: today(),
  weekdays: [0, 2, 4],
  heavyMode: 'between',
  criteria: {},
})

interface FlexDB extends DBSchema {
  logs: { key: string; value: Log }
  photos: { key: string; value: Photo }
  kv: { key: string; value: unknown }
}

export const dbPromise = openDB<FlexDB>('flex-app', 1, {
  upgrade(db) {
    db.createObjectStore('logs', { keyPath: 'id' })
    db.createObjectStore('photos', { keyPath: 'id' })
    db.createObjectStore('kv')
  },
})

export const uid = () => crypto.randomUUID()
