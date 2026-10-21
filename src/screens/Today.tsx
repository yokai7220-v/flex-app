import { CheckButton } from '../components/DoneControls'
import { InstallHint } from '../components/InstallHint'
import { Top } from '../components/ui'
import { findLevel, levels } from '../data/program'
import { dayLabel, diffDays, human, today } from '../lib/date'
import { isDeload, lastMeasure, levelWeek, nextHeavy, planToday, programProgress } from '../lib/schedule'
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
  const prog = programProgress(settings)
  const month = Math.min(12, Math.floor(prog.months) + 1)
  const pct = Math.round(prog.pct * 100)

  return (
    <div className="screen">
      <Top title="Сегодня" big />
      <div className="small muted" style={{ margin: '-8px 4px 4px' }}>{dayLabel(t)}</div>
      <div className="row" style={{ gap: 6, flexWrap: 'wrap', margin: '0 4px 12px' }}>
        <span className={plan.strength ? 'chip accent' : 'chip'}>{plan.strength ? 'Силовой день' : 'Без силовой'}</span>
        <span className="chip">{level.num} · {level.short}</span>
        <span className="chip">Неделя {levelWeek(settings)}</span>
      </div>
      <div className="card">
        <div className="row between" style={{ marginBottom: 8 }}>
          <span className="small muted">Месяц {month} из 12</span>
          <span className="bold">{pct}%</span>
        </div>
        <div className="pbar">
          <div className="fill" style={{ width: `${pct}%` }} />
          {levels.slice(1).map((l) => <div key={l.id} className="tick" style={{ left: `${(l.span[0] / 12) * 100}%` }} />)}
        </div>
      </div>

      <InstallHint />
      {isDeload(settings) && (
        <div className="banner">
          <b>Разгрузочная неделя.</b> В тяжёлых блоках вдвое меньше подходов, лёгкая — как обычно.
        </div>
      )}
      {measureDue && (
        <div className="banner info" style={{ cursor: 'pointer' }} onClick={() => go({ tab: 'progress', sub: 'measure' })}>
          {measured ? `Последний замер ${human(measured)} — пора замериться и сделать фото →` : 'Сделай первый замер и фото, чтобы было с чем сравнивать →'}
        </div>
      )}
      {backupDue && (
        <div className="banner" style={{ cursor: 'pointer' }} onClick={() => go({ tab: 'settings' })}>
          {settings.lastBackup ? 'Больше месяца без бэкапа' : 'Бэкапа ещё не было'} — фото хранятся только в телефоне. Сохранить →
        </div>
      )}

      <div className="section-title">Каждый день</div>
      <RoutineCard r={light} right={<CheckButton routine={light} />} />

      <div className="section-title">
        Тяжёлый блок · {plan.weekCount} из {level.heavyPerWeek} на этой неделе
      </div>
      {plan.heavy ? (
        <>
          <RoutineCard r={plan.heavy} right={<CheckButton routine={plan.heavy} />} />
          {!plan.heavyDone && (
            <div className="small muted" style={{ margin: '0 4px 10px' }}>
              {settings.heavyMode === 'between'
                ? `Начни с разминки 5–10 мин — она уже добавлена в рутину.${plan.tomorrowStrength ? ' Завтра силовая: если это ноги, лучше перенеси блок на ноги.' : ''}`
                : 'Сразу после силовой, пока тело тёплое. Не перед ней.'}
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <div className="small">{plan.reason}</div>
          <button className="btn soft sm" style={{ marginTop: 10 }} onClick={() => go({ tab: 'today', routine: nextHeavy(level, logs).id })}>
            Всё равно сделать: «{nextHeavy(level, logs).title}»
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
