import type { Log } from '../db'
import { addDays, diffDays, today, weekStart, type DateStr } from './date'

const isLight = (l: Log) => l.kind === 'light' || l.kind === 'support'

export type WindowStats = {
  days: number
  lightPerWeek: number
  heavyPerWeek: number
  adherence: number
}

export function windowStats(logs: Log[], window: number, heavyTarget: number, end: DateStr = today()): WindowStats | null {
  const first = logs.length ? logs[logs.length - 1].date : undefined
  if (!first) return null
  const days = Math.max(1, Math.min(window, diffDays(end, first) + 1))
  const start = addDays(end, -(days - 1))
  const inWin = logs.filter((l) => l.date >= start && l.date <= end)
  const lightDays = new Set(inWin.filter(isLight).map((l) => l.date)).size
  const heavy = inWin.filter((l) => l.kind === 'heavy').length
  const plannedHeavy = (days / 7) * heavyTarget
  const adherence = (Math.min(lightDays, days) + Math.min(heavy, plannedHeavy)) / (days + plannedHeavy)
  return {
    days,
    lightPerWeek: Math.min(7, (lightDays / days) * 7),
    heavyPerWeek: (heavy / days) * 7,
    adherence,
  }
}

export type WeekBar = { start: DateStr; light: number; heavy: number; partial: boolean; before: boolean }

export function weekBars(logs: Log[], count = 12, end: DateStr = today()): WeekBar[] {
  const thisWeek = weekStart(end)
  const firstWeek = logs.length ? weekStart(logs[logs.length - 1].date) : thisWeek
  return Array.from({ length: count }, (_, i) => {
    const start = addDays(thisWeek, -7 * (count - 1 - i))
    const stop = addDays(start, 6)
    const inWeek = logs.filter((l) => l.date >= start && l.date <= stop)
    return {
      start,
      light: new Set(inWeek.filter(isLight).map((l) => l.date)).size,
      heavy: inWeek.filter((l) => l.kind === 'heavy').length,
      partial: start === thisWeek,
      before: start < firstWeek,
    }
  })
}

export const movingAvg = (values: number[], n = 4) =>
  values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - n + 1), i + 1)
    return slice.reduce((a, b) => a + b, 0) / slice.length
  })

export const dayKinds = (logs: Log[]) => {
  const map = new Map<DateStr, { light: boolean; heavy: boolean; test: boolean }>()
  for (const l of logs) {
    const v = map.get(l.date) ?? { light: false, heavy: false, test: false }
    if (isLight(l)) v.light = true
    if (l.kind === 'heavy') v.heavy = true
    if (l.kind === 'test') v.test = true
    map.set(l.date, v)
  }
  return map
}
