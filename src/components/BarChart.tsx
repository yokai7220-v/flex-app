import { parse } from '../lib/date'
import { movingAvg, type WeekBar } from '../lib/stats'

export function BarChart({ bars, metric, target }: { bars: WeekBar[]; metric: 'light' | 'heavy'; target: number }) {
  const values = bars.map((b) => b[metric])
  const firstActive = Math.max(0, bars.findIndex((b) => !b.before))
  const avg = movingAvg(values.slice(firstActive, bars.length - 1))
  const max = Math.max(target, ...values, 1)
  const W = 340, H = 156, top = 18, bottom = 22, left = 4
  const plotH = H - top - bottom
  const step = (W - left) / bars.length
  const y = (v: number) => top + plotH - (v / max) * plotH
  const bw = step * 0.56

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Недельные столбики">
      <line x1={left} x2={W} y1={y(target)} y2={y(target)} stroke="var(--muted)" strokeDasharray="3 4" strokeWidth={1} />
      <text x={left} y={y(target) - 5} fontSize="10" fill="var(--muted)">цель {target}</text>
      {bars.map((b, i) => {
        const x = left + i * step + (step - bw) / 2
        const v = values[i]
        return (
          <g key={b.start}>
            {!b.before && <rect x={x} y={y(v)} width={bw} height={Math.max(0, top + plotH - y(v))} rx={4} fill="var(--accent)" opacity={b.partial ? 0.35 : 0.85} />}
            {v === 0 && <rect x={x} y={top + plotH - 2} width={bw} height={2} rx={1} fill="var(--line)" />}
            {(i % 3 === 0 || i === bars.length - 1) && (
              <text x={b.partial ? x + bw : x + bw / 2} y={H - 6} textAnchor={b.partial ? 'end' : 'middle'} fontSize="10" fill="var(--muted)">
                {b.partial ? 'сейчас' : `${parse(b.start).getDate()}.${String(parse(b.start).getMonth() + 1).padStart(2, '0')}`}
              </text>
            )}
          </g>
        )
      })}
      {avg.length > 1 && (
        <text x={left + (avg.length - 1 + firstActive) * step + step / 2} y={y(avg[avg.length - 1]) - 8} textAnchor="end" fontSize="10" fill="var(--text)">
          среднее за 4 нед
        </text>
      )}
      {avg.length > 1 && (
        <polyline
          points={avg.map((v, i) => `${left + (i + firstActive) * step + step / 2},${y(v)}`).join(' ')}
          fill="none"
          stroke="var(--text)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}
