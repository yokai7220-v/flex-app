export type DateStr = string

const pad = (n: number) => String(n).padStart(2, '0')

export const toStr = (d: Date): DateStr => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const parse = (s: DateStr) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const today = (): DateStr => toStr(new Date())

export const addDays = (s: DateStr, n: number): DateStr => {
  const d = parse(s)
  d.setDate(d.getDate() + n)
  return toStr(d)
}

export const diffDays = (a: DateStr, b: DateStr) => Math.round((parse(a).getTime() - parse(b).getTime()) / 86400000)

export const weekdayIdx = (s: DateStr) => (parse(s).getDay() + 6) % 7

export const weekStart = (s: DateStr) => addDays(s, -weekdayIdx(s))

export const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
export const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

export const human = (s: DateStr) => {
  const d = parse(s)
  const t = today()
  if (s === t) return 'сегодня'
  if (s === addDays(t, -1)) return 'вчера'
  const base = `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`
  return d.getFullYear() === new Date().getFullYear() ? base : `${base} ${d.getFullYear()}`
}

export const dayLabel = (s: DateStr) => {
  const d = parse(s)
  return `${WEEKDAYS[weekdayIdx(s)].toLowerCase()}, ${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`
}

export const shortDate = (s: DateStr) => {
  const d = parse(s)
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)}`
}

export const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}
