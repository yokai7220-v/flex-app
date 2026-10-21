import type { Log } from '../db'
import type { DateStr } from './date'

const isLight = (l: Log) => l.kind === 'light' || l.kind === 'support'

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
