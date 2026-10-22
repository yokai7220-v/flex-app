import type { Routine } from '../data/program'
import { today } from '../lib/date'
import { addLog, removeLog, useStore } from '../store'
import { IconCheck } from './Icons'

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
