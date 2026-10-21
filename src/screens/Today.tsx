import { CheckButton } from '../components/DoneControls'
import { InstallHint } from '../components/InstallHint'
import { Top } from '../components/ui'
import { findLevel } from '../data/program'
import { dayLabel, diffDays, human, today } from '../lib/date'
import { isDeload, lastMeasure, nextHeavy, planToday } from '../lib/schedule'
import { useNav } from '../nav'
import { useStore } from '../store'
import { RoutineCard } from './Program'

const DAY = 86400000

export function TodayScreen() {
  const { settings, logs, photos } = useStore()
  const { go } = useNav()
  const level = findLevel(settings.currentLevel)!
  const light = level.routines.find((r) => r.kind === 'light')!
  const support = level.routines.filter((r) => r.kind === 'support')
  const t = today()
  const plan = planToday(level, settings, logs, t)
  const measured = lastMeasure(logs, photos)
  const measureDue = !measured || diffDays(t, measured) > 28
  const backupDue = photos.length > 0 && (!settings.lastBackup || Date.now() - settings.lastBackup > 30 * DAY)

  return (
    <div className="screen">
      <Top title="Сегодня" big />
      <div className="small muted" style={{ margin: '-8px 4px 4px' }}>{dayLabel(t)}</div>
      <div className="row" style={{ gap: 6, flexWrap: 'wrap', margin: '0 4px 12px' }}>
        <span className={plan.strength ? 'chip accent' : 'chip'}>{plan.strength ? 'Силовой день' : 'Без силовой'}</span>
        <span className="chip">{level.short}</span>
      </div>

      <InstallHint />
      {isDeload(settings) && (
        <div className="banner">
          <b>Разгрузочная неделя.</b> В тяжёлых вдвое меньше подходов, лёгкая как обычно.
        </div>
      )}
      {measureDue && (
        <div className="banner info" style={{ cursor: 'pointer' }} onClick={() => go({ tab: 'progress', sub: 'measure' })}>
          {measured ? `Последний замер ${human(measured)}. Пора замериться и сделать фото →` : 'Сделай первый замер и фото, чтобы было с чем сравнивать →'}
        </div>
      )}
      {backupDue && (
        <div className="banner" style={{ cursor: 'pointer' }} onClick={() => go({ tab: 'settings' })}>
          {settings.lastBackup ? 'Больше месяца без бэкапа' : 'Бэкапа ещё не было'}. Фото есть только в этом телефоне. Сохранить →
        </div>
      )}

      <div className="section-title">Каждый день</div>
      <RoutineCard r={light} right={<CheckButton routine={light} />} />

      <div className="section-title">
        Тяжёлая · {plan.weekCount} из {level.heavyPerWeek} за неделю
      </div>
      {plan.heavy ? (
        <>
          <RoutineCard r={plan.heavy} right={<CheckButton routine={plan.heavy} />} />
          {!plan.heavyDone && (
            <div className="small muted" style={{ margin: '0 4px 10px' }}>
              {settings.heavyMode === 'between'
                ? `Разминка 5–10 мин уже добавлена в начало.${plan.tomorrowStrength ? ' Завтра силовая. Если это ноги, сегодня лучше тяжёлая на плечи.' : ''}`
                : 'Сразу после силовой, не перед ней.'}
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <div className="small">{plan.reason}</div>
          <button className="btn soft sm" style={{ marginTop: 10 }} onClick={() => go({ tab: 'today', routine: nextHeavy(level, logs).id })}>
            Сделать сегодня «{nextHeavy(level, logs).title}»
          </button>
        </div>
      )}

      {support.length > 0 && (
        <>
          <div className="section-title">Дополнительно</div>
          {support.map((r) => <RoutineCard key={r.id} r={r} right={<CheckButton routine={r} />} />)}
        </>
      )}
    </div>
  )
}
