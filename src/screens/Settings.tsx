import { BackupCard } from '../components/BackupCard'
import { Seg, Top } from '../components/ui'
import { updateSettings, useStore } from '../store'
import { WEEKDAYS, addDays, parse, today, weekStart } from '../lib/date'
import { isHeavyDay, isStrengthDay } from '../lib/schedule'

function WeekPreview() {
  const { settings } = useStore()
  const start = weekStart(today())
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="weekdays">
        {days.map((d, i) => {
          const str = isStrengthDay(settings, d)
          const heavy = isHeavyDay(settings, d)
          return (
            <div key={d} style={{ flex: 1, textAlign: 'center', borderRadius: 10, padding: '8px 0', background: str ? 'var(--text)' : 'var(--bg)', color: str ? '#fff' : 'var(--muted)', outline: d === today() ? '2px solid var(--accent)' : 'none' }}>
              <div className="tiny bold">{WEEKDAYS[i]}</div>
              <div className="tiny">{parse(d).getDate()}</div>
              <div style={{ height: 6, marginTop: 2 }}>{heavy && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 3, background: 'var(--accent)' }} />}</div>
            </div>
          )
        })}
      </div>
      <div className="tiny muted" style={{ marginTop: 6 }}>Тёмные — силовые. Точка — день для тяжёлого блока.</div>
    </div>
  )
}

export function SettingsScreen() {
  const { settings: s } = useStore()

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
          options={[
            { id: 'alternate', label: 'Через день' },
            { id: 'weekdays', label: 'По дням недели' },
          ]}
        />
        {s.strengthMode === 'alternate' ? (
          <label className="field">
            <span>Дата одной из силовых (от неё считается «через день»)</span>
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

      <div className="section-title">Тяжёлый блок гибкости</div>
      <div className="card">
        <Seg
          value={s.heavyMode}
          onChange={(heavyMode) => updateSettings({ heavyMode })}
          options={[
            { id: 'between', label: 'Между силовыми' },
            { id: 'after', label: 'После силовой' },
          ]}
        />
        <WeekPreview />
        <div className="small muted">
          {s.heavyMode === 'between'
            ? 'Блок ставится в дни без силовой. В начало автоматически добавляется разминка 5–10 мин.'
            : 'Блок ставится в силовые дни — финишер 15–30 мин сразу после тренировки, отдельная разминка не нужна.'}
        </div>
      </div>

      <div className="section-title">Текущий уровень</div>
      <div className="card">
        <label className="field" style={{ marginBottom: 0 }}>
          <span>Дата начала уровня (для разгрузочных недель)</span>
          <input type="date" value={s.levelStart} max={today()} onChange={(e) => e.target.value && updateSettings({ levelStart: e.target.value })} />
        </label>
      </div>

      <div className="section-title">Данные и бэкап</div>
      <BackupCard />
    </div>
  )
}
