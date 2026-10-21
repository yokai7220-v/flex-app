import { useSyncExternalStore } from 'react'
import type { Routine } from './data/program'
import { dbPromise, defaultSettings, uid, type Log, type Photo, type Settings } from './db'
import type { DateStr } from './lib/date'

export type State = {
  ready: boolean
  settings: Settings
  logs: Log[]
  photos: Photo[]
}

let state: State = { ready: false, settings: defaultSettings(), logs: [], photos: [] }
const listeners = new Set<() => void>()

const set = (patch: Partial<State>) => {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const useStore = () => useSyncExternalStore(subscribe, () => state)

const byDate = <T extends { date: string; createdAt: number }>(a: T, b: T) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt

export async function loadStore() {
  const db = await dbPromise
  const [logs, photos, saved] = await Promise.all([db.getAll('logs'), db.getAll('photos'), db.get('kv', 'settings')])
  set({
    ready: true,
    logs: logs.sort(byDate),
    photos: photos.sort(byDate),
    settings: { ...defaultSettings(), ...(saved as Partial<Settings> | undefined) },
  })
  navigator.storage?.persist?.()
}

export async function updateSettings(patch: Partial<Settings>) {
  const settings = { ...state.settings, ...patch }
  set({ settings })
  await (await dbPromise).put('kv', settings, 'settings')
}

export async function addLog(routine: Routine, date: DateStr) {
  const log: Log = { id: uid(), routineId: routine.id, kind: routine.kind, date, createdAt: Date.now() }
  set({ logs: [log, ...state.logs].sort(byDate) })
  await (await dbPromise).put('logs', log)
}

export async function removeLog(id: string) {
  set({ logs: state.logs.filter((l) => l.id !== id) })
  await (await dbPromise).delete('logs', id)
}

export async function savePhoto(photo: Photo) {
  set({ photos: [photo, ...state.photos.filter((p) => p.id !== photo.id)].sort(byDate) })
  await (await dbPromise).put('photos', photo)
}

export async function deletePhoto(id: string) {
  set({ photos: state.photos.filter((p) => p.id !== id) })
  await (await dbPromise).delete('photos', id)
}

export async function replaceAll(data: { settings: Settings; logs: Log[]; photos: Photo[] }) {
  const db = await dbPromise
  const tx = db.transaction(['logs', 'photos', 'kv'], 'readwrite')
  await Promise.all([tx.objectStore('logs').clear(), tx.objectStore('photos').clear()])
  await Promise.all([
    ...data.logs.map((l) => tx.objectStore('logs').put(l)),
    ...data.photos.map((p) => tx.objectStore('photos').put(p)),
    tx.objectStore('kv').put(data.settings, 'settings'),
  ])
  await tx.done
  set({ settings: { ...defaultSettings(), ...data.settings }, logs: data.logs.sort(byDate), photos: data.photos.sort(byDate) })
}

export const getState = () => state
