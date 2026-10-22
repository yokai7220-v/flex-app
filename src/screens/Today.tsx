import { useState } from 'react'
import { CheckButton } from '../components/DoneControls'
import { IconPlus } from '../components/Icons'
import { InstallHint } from '../components/InstallHint'
import { Sheet, Top } from '../components/ui'
import { findLevel, type Routine } from '../data/program'
import { dayLabel, diffDays, human, today } from '../lib/date'
import { heavyInWeek, isDeload, lastMeasure, nextHeavy } from '../lib/schedule'
import { useNav } from '../nav'
import { addLog, useStore } from '../store'
import { RoutineCard } from './Program'

const DAY = 86400000

export function TodayScreen() {
  const { settings, logs, photos } = useStore()
  const { go } = useNav()
  const [pick, setPick] = useState(false)
  const level = findLevel(settings.currentLevel)!
  const light = level.routines.find((r) => r.kind === 'light')!
  const support = level.routines.filter((r) => r.kind === 'support')
  const heavies = level.routines.filter((r) => r.kind === 'heavy')
  const t = today()
  const next = nextHeavy(level, logs)
  const rest = heavies.filter((r) => r.id !== next.id)
  const doneHeavy = heavies.filter((r) => logs.some((l) => l.routineId === r.id && l.date === t))
  const weekCount = heavyInWeek(logs, t)
  const measured = lastMeasure(logs, photos)
  const measureDue = !measured || diffDays(t, measured) > 28
  const deload = isDeload(settings)
  const backupDue = photos.length > 0 && (!settings.lastBackup || Date.now() - settings.lastBackup > 30 * DAY)

  const add = (r: Routine) => {
    addLog(r, t)
    setPick(false)
  }

  return (
    <div className="screen">
      <Top title="Сегодня" big />
      <div className="small muted" style={{ margin: '-8px 4px 4px' }}>{dayLabel(t)}</div>
      <div className="row" style={{ gap: 6, flexWrap: 'wrap', margin: '0 4px 12px' }}>
        <span className="chip">{level.short}</span>
        {deload && <span className="chip warn">Разгрузочная неделя</span>}
      </div>

      <div className="section-title">Каждый день</div>
      <RoutineCard r={light} right={<CheckButton routine={light} />} hideFreq />

      <div className="section-title">
        Тяжёлая · {weekCount} из {level.heavyPerWeek} за неделю
      </div>
      {doneHeavy.map((r) => <RoutineCard key={r.id} r={r} right={<CheckButton routine={r} />} />)}
      <div className="card tap row" onClick={() => setPick(true)}>
        <div className="grow bold">Добавить тяжёлую</div>
        <IconPlus />
      </div>

      {support.length > 0 && (
        <>
          <div className="section-title">Дополнительно</div>
          {support.map((r) => <RoutineCard key={r.id} r={r} right={<CheckButton routine={r} />} />)}
        </>
      )}

      <div style={{ marginTop: 24 }}>
        {measureDue && (
          <div className="banner info" style={{ cursor: 'pointer' }} onClick={() => go({ tab: 'progress', sub: 'photos' })}>
            {measured ? `Последний замер ${human(measured)}. Пора замериться и сделать фото →` : 'Сделай первый замер и фото, чтобы было с чем сравнивать →'}
          </div>
        )}
        {backupDue && (
          <div className="banner" style={{ cursor: 'pointer' }} onClick={() => go({ tab: 'settings' })}>
            {settings.lastBackup ? 'Больше месяца без бэкапа' : 'Бэкапа ещё не было'}. Фото есть только в этом телефоне. Сохранить →
          </div>
        )}
        <InstallHint />
      </div>

      {pick && (
        <Sheet title="Тяжёлая" onClose={() => setPick(false)}>
          <p className="note">
            {deload && 'Разгрузочная неделя: вдвое меньше подходов. '}
            {settings.heavyMode === 'between' ? 'Разминка 5–10 мин в начале.' : 'Сразу после силовой, не перед ней.'}
            {weekCount >= level.heavyPerWeek && ' Норма на неделю уже выполнена.'}
          </p>
          <div className="section-title" style={{ marginTop: 0 }}>Следующая по циклу</div>
          <RoutineCard r={next} onPick={add} />
          {rest.length > 0 && (
            <>
              <div className="section-title">Другие</div>
              {rest.map((r) => <RoutineCard key={r.id} r={r} onPick={add} />)}
            </>
          )}
        </Sheet>
      )}
    </div>
  )
}
