import { useState } from 'react'
import { BarChart } from '../components/BarChart'
import { MonthCalendar } from '../components/MonthCalendar'
import { Seg, Sheet, Top } from '../components/ui'
import { findLevel, findRoutine, testRoutine } from '../data/program'
import { human, type DateStr } from '../lib/date'
import { kindLabel } from '../lib/labels'
import { weekBars, windowStats, type WindowStats } from '../lib/stats'
import { useNav } from '../nav'
import { removeLog, useStore } from '../store'
import { PhotosView } from './Photos'
import { RoutineDetail } from './RoutineDetail'

const fmt = (n: number) => n.toFixed(1).replace('.', ',')

export function ProgressScreen() {
  const { route, replace } = useNav()
  const sub = route.sub ?? 'stats'
  return (
    <div className="screen">
      <Top title="Прогресс" big />
      <Seg
        value={sub}
        onChange={(s) => replace({ tab: 'progress', sub: s })}
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

function Metric({ label, unit, target, w7, w30, pick, pct }: { label: string; unit: string; target?: number; w7: WindowStats; w30: WindowStats; pick: (s: WindowStats) => number; pct?: boolean }) {
  const show = (s: WindowStats) => (pct ? `${Math.round(pick(s) * 100)}%` : fmt(pick(s)))
  return (
    <div className="card">
      <div className="row between">
        <div className="bold">{label}</div>
        {target !== undefined && <span className="tiny muted">цель {target} {unit}</span>}
      </div>
      <div className="row" style={{ marginTop: 8, gap: 0 }}>
        {[w7, w30].map((s, i) => (
          <div key={i} className="grow">
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', color: i === 0 ? 'var(--text)' : 'var(--muted)' }}>
              {show(s)}
              {!pct && <span className="small muted" style={{ fontWeight: 500 }}> {unit}</span>}
            </div>
            <div className="tiny muted">{i === 0 ? 'за 7 дней' : `за ${s.days < 30 ? `${s.days} дн (с начала)` : '30 дней'}`}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatsView() {
  const { logs, settings } = useStore()
  const [metric, setMetric] = useState<'light' | 'heavy'>('light')
  const [day, setDay] = useState<DateStr | null>(null)
  const target = findLevel(settings.currentLevel)!.heavyPerWeek
  const w7 = windowStats(logs, 7, target)
  const w30 = windowStats(logs, 30, target)

  const dayLogs = day ? logs.filter((l) => l.date === day) : []

  if (!w7 || !w30)
    return <div className="card empty">Отметь первую рутину — здесь появятся средние за неделю и за месяц. Никаких «дней подряд»: пропуск ничего не обнуляет.</div>

  return (
    <>
      <Metric label="Лёгкая" unit="дн/нед" target={7} w7={w7} w30={w30} pick={(s) => s.lightPerWeek} />
      <Metric label="Тяжёлая" unit="в нед" target={target} w7={w7} w30={w30} pick={(s) => s.heavyPerWeek} />
      <Metric label="Выполнение плана" unit="" w7={w7} w30={w30} pick={(s) => s.adherence} pct />

      <div className="section-title">По неделям · 12 недель</div>
      <div className="card">
        <Seg
          value={metric}
          onChange={setMetric}
          options={[
            { id: 'light', label: 'Лёгкая' },
            { id: 'heavy', label: 'Тяжёлая' },
          ]}
        />
        <BarChart bars={weekBars(logs)} metric={metric} target={metric === 'light' ? 7 : target} />
        <div className="tiny muted" style={{ marginTop: 4 }}>Столбик — неделя, линия — среднее за 4 недели. Бледный — текущая, в среднее не входит.</div>
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
