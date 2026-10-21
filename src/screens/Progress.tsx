import { useState } from 'react'
import { BarChart } from '../components/BarChart'
import { MonthCalendar } from '../components/MonthCalendar'
import { Seg, Sheet, Top } from '../components/ui'
import { findLevel, findRoutine, testRoutine } from '../data/program'
import { human, plural, type DateStr } from '../lib/date'
import { kindLabel } from '../lib/labels'
import { weekBars, windowStats, type WindowStats } from '../lib/stats'
import { useNav } from '../nav'
import { removeLog, useStore } from '../store'
import { PhotosView } from './Photos'
import { RoutineDetail } from './RoutineDetail'

const fmt = (n: number) => (Number.isInteger(+n.toFixed(1)) ? String(Math.round(n)) : n.toFixed(1).replace('.', ','))

export function ProgressScreen() {
  const { route, replace } = useNav()
  const sub = route.sub ?? 'stats'
  return (
    <div className="screen">
      <Top title="Прогресс" big />
      <Seg
        value={sub}
        onChange={(s) => replace({ tab: 'progress', sub: s })}
        variant="tabs"
        options={[
          { id: 'stats', label: 'Статистика' },
          { id: 'photos', label: 'Фото' },
          { id: 'measure', label: 'Замер' },
        ]}
      />
      {sub === 'photos' ? <PhotosView /> : sub === 'measure' ? <RoutineDetail id={testRoutine.id} embed /> : <StatsView />}
    </div>
  )
}

function Metric({ label, unit, target, w7, w30, pick, pct }: { label: string; unit?: (n: number) => string; target?: number; w7: WindowStats; w30: WindowStats; pick: (s: WindowStats) => number; pct?: boolean }) {
  const show = (s: WindowStats) => (pct ? `${Math.round(pick(s) * 100)}%` : fmt(pick(s)))
  return (
    <div className="card">
      <div className="row between">
        <div className="bold">{label}</div>
        {target !== undefined && <span className="tiny muted">цель {target}</span>}
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 4 }}>
        {show(w7)}
        {unit && <span className="small muted" style={{ fontWeight: 500, letterSpacing: 0 }}> {unit(pick(w7))}</span>}
      </div>
      <div className="row between small muted">
        <span>за 7 дней</span>
        <span>за {w30.days} {plural(w30.days, 'день', 'дня', 'дней')}: {show(w30)}</span>
      </div>
    </div>
  )
}

const perWeek = (one: string, few: string, many: string) => (n: number) => `${Number.isInteger(+n.toFixed(1)) ? plural(Math.round(n), one, few, many) : few} в неделю`

function StatsView() {
  const { logs, settings } = useStore()
  const [metric, setMetric] = useState<'light' | 'heavy'>('light')
  const [day, setDay] = useState<DateStr | null>(null)
  const target = findLevel(settings.currentLevel)!.heavyPerWeek
  const w7 = windowStats(logs, 7, target)
  const w30 = windowStats(logs, 30, target)

  const dayLogs = day ? logs.filter((l) => l.date === day) : []

  if (!w7 || !w30)
    return <div className="card empty">Здесь будут средние за неделю и месяц. Пока нет отметок.</div>

  return (
    <>
      <Metric label="Лёгкая" unit={perWeek('день', 'дня', 'дней')} target={7} w7={w7} w30={w30} pick={(s) => s.lightPerWeek} />
      <Metric label="Тяжёлая" unit={perWeek('раз', 'раза', 'раз')} target={target} w7={w7} w30={w30} pick={(s) => s.heavyPerWeek} />
      <Metric label="Выполнение плана" w7={w7} w30={w30} pick={(s) => s.adherence} pct />

      <div className="section-title">По неделям</div>
      <div className="card">
        <Seg
          value={metric}
          onChange={setMetric}
          variant="switch"
          options={[
            { id: 'light', label: 'Лёгкая' },
            { id: 'heavy', label: 'Тяжёлая' },
          ]}
        />
        <BarChart bars={weekBars(logs)} metric={metric} target={metric === 'light' ? 7 : target} />
      </div>

      <div className="section-title">Календарь</div>
      <div className="card">
        <MonthCalendar logs={logs} onPick={setDay} />
      </div>

      {day && (
        <Sheet title={human(day)} onClose={() => setDay(null)}>
          {dayLogs.length === 0 ? (
            <div className="muted small">В этот день отметок нет.</div>
          ) : (
            dayLogs.map((l) => {
              const r = findRoutine(l.routineId)
              return (
                <div key={l.id} className="row between" style={{ padding: '8px 0', borderTop: '1px solid var(--line)' }}>
                  <div className="grow">
                    <div className="small bold wrap">{r?.title ?? 'Удалённая рутина'}</div>
                    <div className="tiny muted">{r ? kindLabel(r) : l.kind}</div>
                  </div>
                  <button className="btn sm danger" onClick={() => removeLog(l.id)}>Удалить</button>
                </div>
              )
            })
          )}
        </Sheet>
      )}
    </>
  )
}
