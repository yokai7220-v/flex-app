import type { Level, Routine } from '../data/program'
import type { Log, Photo, Settings } from '../db'
import { addDays, diffDays, today, weekStart, type DateStr } from './date'

export const heavyInWeek = (logs: Log[], d: DateStr) => {
  const start = weekStart(d)
  const end = addDays(start, 6)
  return new Set(logs.filter((l) => l.kind === 'heavy' && l.date >= start && l.date <= end).map((l) => l.date)).size
}

export function nextHeavy(level: Level, logs: Log[]): Routine {
  const ids = new Set(level.routines.filter((r) => r.kind === 'heavy').map((r) => r.id))
  const done = logs.filter((l) => ids.has(l.routineId)).length
  const slot = level.rotation[done % level.rotation.length]
  return level.routines.find((r) => r.kind === 'heavy' && r.slot === slot)!
}

export const swapDue = (r: Routine, logs: Log[], d: DateStr) => {
  if (!r.insteadOfLight) return false
  const last = logs.find((l) => l.routineId === r.id)
  return !last || diffDays(d, last.date) >= r.insteadOfLight
}

export const levelWeek = (s: Settings, d: DateStr = today()) => Math.max(0, Math.floor(diffDays(d, s.levelStart) / 7)) + 1

export const isDeload = (s: Settings, d: DateStr = today()) => levelWeek(s, d) % 4 === 0

export function lastMeasure(logs: Log[], photos: Photo[]): DateStr | undefined {
  const t = logs.find((l) => l.kind === 'test')?.date
  const p = photos[0]?.date
  return [t, p].filter(Boolean).sort().pop()
}
