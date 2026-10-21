import type { Routine } from '../data/program'

export const kindLabel = (r: Routine) =>
  r.kind === 'light' ? 'Лёгкая' : r.kind === 'heavy' ? 'Тяжёлая' : r.kind === 'support' ? 'Поддержка' : 'Замер'

export const kindChip = (r: Routine) => (r.kind === 'heavy' ? 'chip accent' : 'chip')
