import { useState } from 'react'
import { MonthCalendar } from '../components/MonthCalendar'
import { Seg, Sheet, Top } from '../components/ui'
import { findLevel, findRoutine, testRoutine } from '../data/program'
import { human, type DateStr } from '../lib/date'
import { kindLabel } from '../lib/labels'
import { useNav } from '../nav'
import { addLog, removeLog, useStore } from '../store'
import { PhotosView } from './Photos'

export function ProgressScreen() {
  const { route, replace } = useNav()
  const sub = route.sub ?? 'calendar'
  return (
    <div className="screen">
      <Top title="Прогресс" big />
      <Seg
        value={sub}
        onChange={(s) => replace({ tab: 'progress', sub: s })}
        variant="tabs"
        options={[
          { id: 'calendar', label: 'Календарь' },
          { id: 'photos', label: 'Фото' },
        ]}
      />
      {sub === 'photos' ? <PhotosView /> : <CalendarView />}
    </div>
  )
}

function CalendarView() {
  const { logs, settings } = useStore()
  const [day, setDay] = useState<DateStr | null>(null)
  const dayLogs = day ? logs.filter((l) => l.date === day) : []
  const level = findLevel(settings.currentLevel)
  const missing = day && level ? [...level.routines, testRoutine].filter((r) => !dayLogs.some((l) => l.routineId === r.id)) : []

  return (
    <>
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
                    {(!r || r.kind !== 'test') && <div className="tiny muted">{r ? kindLabel(r) : l.kind}</div>}
                  </div>
                  <button className="btn sm danger" onClick={() => removeLog(l.id)}>Удалить</button>
                </div>
              )
            })
          )}
          {missing.length > 0 && (
            <>
              <div className="section-title" style={{ marginTop: 16 }}>Отметить</div>
              {missing.map((r) => (
                <div key={r.id} className="row between" style={{ padding: '8px 0', borderTop: '1px solid var(--line)' }}>
                  <div className="grow">
                    <div className="small bold wrap">{r.title}</div>
                    <div className="tiny muted">{kindLabel(r)}</div>
                  </div>
                  <button className="check" style={{ width: 34, height: 34 }} aria-label={`Отметить «${r.title}»`} onClick={() => addLog(r, day)} />
                </div>
              ))}
            </>
          )}
        </Sheet>
      )}
    </>
  )
}
