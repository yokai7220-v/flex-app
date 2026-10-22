import { BackupCard } from '../components/BackupCard'
import { IconCheck, IconPlus } from '../components/Icons'
import { InstallSteps, isStandalone } from '../components/InstallHint'
import { Seg, Top } from '../components/ui'
import { updateSettings, useStore } from '../store'
import { today } from '../lib/date'
import { ACCENT_PRESETS, readableOn } from '../lib/theme'

export function SettingsScreen() {
  const { settings: s } = useStore()
  const accent = s.accent ?? '#1f7a6d'
  const isCustom = !ACCENT_PRESETS.includes(accent)

  return (
    <div className="screen">
      <Top title="Настройки" big />

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
