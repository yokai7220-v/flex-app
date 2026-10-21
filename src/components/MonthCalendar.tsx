import { useState } from 'react'
import { MONTHS, WEEKDAYS, toStr, today, type DateStr } from '../lib/date'
import { dayKinds } from '../lib/stats'
import type { Log } from '../db'

export function MonthCalendar({ logs, onPick }: { logs: Log[]; onPick: (d: DateStr) => void }) {
  const now = new Date()
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const kinds = dayKinds(logs)
  const first = new Date(ym.y, ym.m, 1)
  const offset = (first.getDay() + 6) % 7
  const daysIn = new Date(ym.y, ym.m + 1, 0).getDate()
  const t = today()
  const cells: (DateStr | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysIn }, (_, i) => toStr(new Date(ym.y, ym.m, i + 1)))]
  const shift = (n: number) => setYm(({ y, m }) => ({ y: m + n < 0 ? y - 1 : m + n > 11 ? y + 1 : y, m: (m + n + 12) % 12 }))
  const isCurrent = ym.y === now.getFullYear() && ym.m === now.getMonth()

  return (
    <div>
      <div className="row between" style={{ marginBottom: 8 }}>
        <button className="btn sm" onClick={() => shift(-1)} aria-label="Предыдущий месяц">‹</button>
        <div className="bold">{MONTHS[ym.m]} {ym.y}</div>
        <button className="btn sm" onClick={() => shift(1)} disabled={isCurrent} aria-label="Следующий месяц">›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center' }}>
        {WEEKDAYS.map((d) => <div key={d} className="tiny muted">{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />
          const k = kinds.get(d)
          const future = d > t
          return (
            <button
              key={d}
              onClick={() => !future && onPick(d)}
              style={{
                border: 0,
                borderRadius: 10,
                padding: '6px 0 4px',
                background: d === t ? 'var(--accent-soft)' : 'transparent',
                color: future ? 'var(--line)' : 'var(--text)',
                cursor: future ? 'default' : 'pointer',
              }}
            >
              <div className="small">{Number(d.slice(8))}</div>
              <div style={{ display: 'flex', gap: 3, justifyContent: 'center', height: 6, marginTop: 2 }}>
                {k?.light && <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent-mid)' }} />}
                {k?.heavy && <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent)' }} />}
                {k?.test && <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--warn)' }} />}
              </div>
            </button>
          )
        })}
      </div>
      <div className="row tiny muted" style={{ gap: 12, marginTop: 8, justifyContent: 'center' }}>
        <span className="row" style={{ gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent-mid)' }} />лёгкая</span>
        <span className="row" style={{ gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent)' }} />тяжёлая</span>
        <span className="row" style={{ gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--warn)' }} />замер</span>
      </div>
    </div>
  )
}
