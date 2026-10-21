import { Seg, Top } from '../components/ui'
import { updateSettings, useStore } from '../store'
import { WEEKDAYS, today } from '../lib/date'

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
    </div>
  )
}
