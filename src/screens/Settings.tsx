import { Fragment } from 'react'
import { BackupCard } from '../components/BackupCard'
import { IconCheck, IconPlus } from '../components/Icons'
import { InstallSteps, isStandalone } from '../components/InstallHint'
import { Seg, Top } from '../components/ui'
import { updateSettings, useStore } from '../store'
import { WEEKDAYS, addDays, parse, today, weekStart } from '../lib/date'
import { isHeavyDay, isStrengthDay } from '../lib/schedule'
import { ACCENT_PRESETS, readableOn } from '../lib/theme'

function WeekPreview() {
  const { settings } = useStore()
  const start = weekStart(today())
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const rows = [
    { label: 'Силовая', on: (d: string) => isStrengthDay(settings, d), color: 'var(--text)' },
    { label: 'Тяжёлая', on: (d: string) => isHeavyDay(settings, d), color: 'var(--accent)' },
  ]
  return (
    <div className="week-grid">
      <span />
      {days.map((d, i) => (
        <span key={d} className={d === today() ? 'today' : undefined}>
          {WEEKDAYS[i]}
          <br />
          {parse(d).getDate()}
        </span>
      ))}
      {rows.map((r) => (
        <Fragment key={r.label}>
          <span className="label">{r.label}</span>
          {days.map((d) => <span key={d}>{r.on(d) && <i style={{ background: r.color }} />}</span>)}
        </Fragment>
      ))}
    </div>
  )
}

export function SettingsScreen() {
  const { settings: s } = useStore()
  const accent = s.accent ?? '#1f7a6d'
  const isCustom = !ACCENT_PRESETS.includes(accent)

  const toggleDay = (i: number) => {
    const weekdays = s.weekdays.includes(i) ? s.weekdays.filter((d) => d !== i) : [...s.weekdays, i].sort()
    updateSettings({ weekdays })
  }

  return (
    <div className="screen">
      <Top title="Настройки" big />

      <div className="section-title">Силовые тренировки</div>
      <div className="card">
        <Seg
          value={s.strengthMode}
          onChange={(strengthMode) => updateSettings({ strengthMode })}
          variant="switch"
          options={[
            { id: 'alternate', label: 'Через день' },
            { id: 'weekdays', label: 'По дням недели' },
          ]}
        />
        {s.strengthMode === 'alternate' ? (
          <label className="field">
            <span>Последняя силовая</span>
            <input type="date" value={s.alternateStart} onChange={(e) => e.target.value && updateSettings({ alternateStart: e.target.value })} />
          </label>
        ) : (
          <div className="weekdays">
            {WEEKDAYS.map((d, i) => (
              <button key={d} className={s.weekdays.includes(i) ? 'on' : ''} onClick={() => toggleDay(i)}>
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="section-title">Когда делать тяжёлую</div>
      <div className="card">
        <Seg
          value={s.heavyMode}
          onChange={(heavyMode) => updateSettings({ heavyMode })}
          variant="switch"
          options={[
            { id: 'between', label: 'Между силовыми' },
            { id: 'after', label: 'После силовой' },
          ]}
        />
        <WeekPreview />
        <div className="small muted">
          {s.heavyMode === 'between'
            ? 'Тяжёлая в дни без силовой, с разминкой 5–10 мин в начале.'
            : 'Тяжёлая в силовые дни, 15–30 мин сразу после тренировки, без отдельной разминки.'}
        </div>
      </div>

      <div className="section-title">Уровень</div>
      <div className="card">
        <label className="field" style={{ marginBottom: 0 }}>
          <span>Начало текущего уровня. От него каждая 4-я неделя разгрузочная</span>
          <input type="date" value={s.levelStart} max={today()} onChange={(e) => e.target.value && updateSettings({ levelStart: e.target.value })} />
        </label>
      </div>

      <div className="section-title">Цвет</div>
      <div className="card">
        <div className="swatches">
          {ACCENT_PRESETS.map((c) => (
            <button key={c} className="swatch" style={{ background: c, color: readableOn(c) }} onClick={() => updateSettings({ accent: c })}>
              {accent === c && <IconCheck />}
            </button>
          ))}
          <label
            className={isCustom ? 'swatch' : 'swatch custom'}
            style={isCustom ? { background: accent, color: readableOn(accent) } : undefined}
          >
            {isCustom ? <IconCheck /> : <IconPlus />}
            <input type="color" value={accent} onChange={(e) => updateSettings({ accent: e.target.value })} />
          </label>
        </div>
      </div>

      <div className="section-title">Данные и бэкап</div>
      <BackupCard />

      <div className="section-title">Установка</div>
      <div className="card">
        {isStandalone() ? <div className="small">Установлено на главный экран.</div> : <InstallSteps />}
      </div>
    </div>
  )
}
