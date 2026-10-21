import { useState } from 'react'
import { MonthCalendar } from '../components/MonthCalendar'
import { Seg, Sheet, Top } from '../components/ui'
import { findRoutine } from '../data/program'
import { human, type DateStr } from '../lib/date'
import { kindLabel } from '../lib/labels'
import { useNav } from '../nav'
import { removeLog, useStore } from '../store'
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
  const { logs } = useStore()
  const [day, setDay] = useState<DateStr | null>(null)
  const dayLogs = day ? logs.filter((l) => l.date === day) : []

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
        </Sheet>
      )}
    </>
  )
}
