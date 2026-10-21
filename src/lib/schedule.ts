import type { Level, Routine } from '../data/program'
import type { Log, Photo, Settings } from '../db'
import { addDays, diffDays, today, weekStart, weekdayIdx, type DateStr } from './date'

export const isStrengthDay = (s: Settings, d: DateStr) =>
  s.strengthMode === 'alternate' ? ((diffDays(d, s.alternateStart) % 2) + 2) % 2 === 0 : s.weekdays.includes(weekdayIdx(d))

export const isHeavyDay = (s: Settings, d: DateStr) => (s.heavyMode === 'after' ? isStrengthDay(s, d) : !isStrengthDay(s, d))

export const heavyInWeek = (logs: Log[], d: DateStr) => {
  const start = weekStart(d)
  const end = addDays(start, 6)
  return logs.filter((l) => l.kind === 'heavy' && l.date >= start && l.date <= end).length
}

export function nextHeavy(level: Level, logs: Log[]): Routine {
  const ids = new Set(level.routines.filter((r) => r.kind === 'heavy').map((r) => r.id))
  const done = logs.filter((l) => ids.has(l.routineId)).length
  const slot = level.rotation[done % level.rotation.length]
  return level.routines.find((r) => r.kind === 'heavy' && r.slot === slot)!
}

export const levelWeek = (s: Settings, d: DateStr = today()) => Math.max(0, Math.floor(diffDays(d, s.levelStart) / 7)) + 1

export const isDeload = (s: Settings, d: DateStr = today()) => levelWeek(s, d) % 4 === 0

export function lastMeasure(logs: Log[], photos: Photo[]): DateStr | undefined {
  const t = logs.find((l) => l.kind === 'test')?.date
  const p = photos[0]?.date
  return [t, p].filter(Boolean).sort().pop()
}

export type TodayPlan = {
  strength: boolean
  heavyDay: boolean
  weekCount: number
  heavy?: Routine
  heavyDone: boolean
  reason?: string
  tomorrowStrength: boolean
}

export function planToday(level: Level, s: Settings, logs: Log[], d: DateStr = today()): TodayPlan {
  const strength = isStrengthDay(s, d)
  const heavyDay = isHeavyDay(s, d)
  const weekCount = heavyInWeek(logs, d)
  const tomorrowStrength = isStrengthDay(s, addDays(d, 1))
  const doneToday = logs.find((l) => l.kind === 'heavy' && l.date === d)
  if (doneToday) {
    const heavy = level.routines.find((r) => r.id === doneToday.routineId)
    return { strength, heavyDay, weekCount, heavy, heavyDone: true, tomorrowStrength }
  }
  const next = nextHeavy(level, logs)
  if (weekCount >= level.heavyPerWeek)
    return { strength, heavyDay, weekCount, heavyDone: false, tomorrowStrength, reason: `Недельная цель выполнена — ${weekCount} из ${level.heavyPerWeek}. Сегодня только лёгкая.` }
  if (!heavyDay)
    return {
      strength,
      heavyDay,
      weekCount,
      heavyDone: false,
      tomorrowStrength,
      reason: s.heavyMode === 'between' ? 'Сегодня силовая — тяжёлый блок в дни между силовыми.' : 'Сегодня без силовой — тяжёлый блок делаешь после силовой.',
    }
  return { strength, heavyDay, weekCount, heavy: next, heavyDone: false, tomorrowStrength }
}
