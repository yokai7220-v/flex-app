import { useState } from 'react'
import type { Routine } from '../data/program'
import { addDays, human, today } from '../lib/date'
import { addLog, removeLog, useStore } from '../store'
import { IconCheck } from './Icons'
import { Sheet } from './ui'

export function CheckButton({ routine }: { routine: Routine }) {
  const { logs } = useStore()
  const t = today()
  const log = logs.find((l) => l.routineId === routine.id && l.date === t)
  return (
    <button
      className={`check ${log ? 'on' : ''}`}
      style={{ width: 34, height: 34 }}
      aria-label={log ? 'Снять отметку' : 'Отметить выполненным'}
      onClick={(e) => {
        e.stopPropagation()
        log ? removeLog(log.id) : addLog(routine, t)
      }}
    >
      {log && <IconCheck />}
    </button>
  )
}

export function DoneSection({ routine }: { routine: Routine }) {
  const { logs } = useStore()
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState(addDays(today(), -2))
  const t = today()
  const mine = logs.filter((l) => l.routineId === routine.id)
  const todayLog = mine.find((l) => l.date === t)

  const mark = (date: string) => {
    addLog(routine, date)
    setOpen(false)
  }

  return (
    <>
      <div className="section-title">Выполнение</div>
      <div className="card">
        {todayLog ? (
          <div className="row between">
            <span className="done-mark">✓ Сделано сегодня</span>
            <button className="btn sm" onClick={() => removeLog(todayLog.id)}>Отменить</button>
          </div>
        ) : (
          <button className="btn primary block" onClick={() => addLog(routine, t)}>Отметить выполненным</button>
        )}
        <button className="btn sm block" style={{ marginTop: 8, background: 'none', color: 'var(--accent)' }} onClick={() => setOpen(true)}>
          Отметить за другой день
        </button>
        {mine.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div className="tiny muted" style={{ marginBottom: 4 }}>Последние разы · всего {mine.length}</div>
            {mine.slice(0, 5).map((l) => (
              <div key={l.id} className="row between small" style={{ padding: '4px 0' }}>
                <span>{human(l.date)}</span>
                <button className="btn sm" style={{ background: 'none', color: 'var(--muted)', fontSize: 18, fontWeight: 400, padding: '0 8px' }} onClick={() => removeLog(l.id)} aria-label="Удалить отметку">
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <Sheet title="Когда сделал?" onClose={() => setOpen(false)}>
          <div className="stack">
            <button className="btn block" onClick={() => mark(addDays(t, -1))}>Вчера</button>
            <label className="field" style={{ marginTop: 16 }}>
              <span>Другая дата</span>
              <input type="date" value={custom} max={t} onChange={(e) => setCustom(e.target.value)} />
            </label>
            <button className="btn primary block" disabled={!custom || custom > t} onClick={() => mark(custom)}>Отметить {custom ? human(custom) : ''}</button>
          </div>
        </Sheet>
      )}
    </>
  )
}
