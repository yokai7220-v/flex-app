import { IconCheck, IconChevron, IconPlus } from '../components/Icons'
import { Seg, Top } from '../components/ui'
import { VideoList } from '../components/VideoList'
import { levels, theory, type Level, type Routine } from '../data/program'
import { daysAgoTxt, human, today } from '../lib/date'
import { kindChip, kindLabel } from '../lib/labels'
import { useNav } from '../nav'
import { updateSettings, useStore } from '../store'

const levelDone = (l: Level, s: { currentLevel: string; criteria: Record<string, boolean> }) =>
  levels.indexOf(l) < levels.findIndex((x) => x.id === s.currentLevel) || l.criteria.every((c) => s.criteria[c.id])

export function ProgramScreen() {
  const { route, replace } = useNav()
  const { settings } = useStore()
  if (route.level === 'theory') return <TheoryScreen />
  const sel = levels.some((l) => l.id === route.level) ? route.level! : settings.currentLevel

  return (
    <div className="screen">
      <Top title="Программа" big />
      <Seg
        value={sel}
        onChange={(level) => replace({ tab: 'program', level })}
        options={levels.map((l) => ({ id: l.id, label: l.short, done: levelDone(l, settings) }))}
      />
      <LevelView level={levels.find((l) => l.id === sel)!} />
    </div>
  )
}

function TheoryScreen() {
  return (
    <div className="screen">
      <Top title="Теория" back />
      {theory.map((t) => (
        <details className="card fold" key={t.title}>
          <summary className="bold">{t.title}</summary>
          <ul className="list small" style={{ marginTop: 10 }}>
            {t.body.map((p) => <li key={p}>{p}</li>)}
          </ul>
          {t.videos && <div style={{ marginTop: 10 }}><VideoList videos={t.videos} /></div>}
        </details>
      ))}
    </div>
  )
}

function LevelView({ level }: { level: Level }) {
  const { settings } = useStore()
  const { go } = useNav()
  const isCurrent = settings.currentLevel === level.id
  const done = levelDone(level, settings)
  const passed = level.criteria.filter((c) => settings.criteria[c.id]).length

  const toggle = (id: string) => updateSettings({ criteria: { ...settings.criteria, [id]: !settings.criteria[id] } })

  return (
    <>
      <div className="card">
        <div className="row between">
          <div className="grow">
            <div className="bold" style={{ fontSize: 20 }}>{level.title}{done && <span style={{ color: 'var(--accent)' }}> ✓</span>}</div>
            <div className="small muted">{level.months}</div>
          </div>
          {isCurrent ? (
            <span className="chip accent">Текущий</span>
          ) : (
            <button className="btn soft sm" onClick={() => updateSettings({ currentLevel: level.id, levelStart: today() })}>
              Сделать текущим
            </button>
          )}
        </div>
        <p className="small" style={{ margin: '10px 0 0' }}>{level.goal}</p>
      </div>

      <div className="section-title">Лёгкая</div>
      {level.routines.filter((r) => r.kind === 'light').map((r) => <RoutineCard key={r.id} r={r} />)}

      <div className="section-title">Тяжёлые</div>
      {level.rotation.map((s, i) => <RoutineCard key={i} r={level.routines.find((r) => r.kind === 'heavy' && r.slot === s)!} />)}

      {level.routines.some((r) => r.kind === 'support') && (
        <>
          <div className="section-title">Дополнительно</div>
          {level.routines.filter((r) => r.kind === 'support').map((r) => <RoutineCard key={r.id} r={r} />)}
        </>
      )}

      <div className="section-title">Критерии перехода · {passed} из {level.criteria.length}</div>
      <div className="card">
        {level.criteria.map((c) => (
          <div key={c.id} className="row" style={{ padding: '6px 0', cursor: 'pointer' }} onClick={() => toggle(c.id)}>
            <button className={`check ${settings.criteria[c.id] ? 'on' : ''}`} aria-label="Отметить">
              {settings.criteria[c.id] && <IconCheck />}
            </button>
            <div className="grow small">{c.text}</div>
          </div>
        ))}
      </div>

      <div className="card tap row" style={{ marginTop: 24 }} onClick={() => go({ tab: 'program', level: 'theory' })}>
        <div className="grow bold">Теория и словарь</div>
        <IconChevron />
      </div>
    </>
  )
}

export function RoutineCard({ r, right, hideFreq, onPick }: { r: Routine; right?: React.ReactNode; hideFreq?: boolean; onPick?: (r: Routine) => void }) {
  const { go, route } = useNav()
  const { logs } = useStore()
  const last = logs.find((l) => l.routineId === r.id)
  const lastTxt = last ? (r.kind === 'heavy' ? daysAgoTxt(last.date) : `последний раз ${human(last.date)}`) : ''
  const meta = r.kind === 'heavy' || hideFreq ? lastTxt : [r.freq, lastTxt].filter(Boolean).join(' · ')
  return (
    <div className="card tap" onClick={() => (onPick ? onPick(r) : go({ tab: route.tab, routine: r.id }))}>
      <div className="row">
        <div className="grow">
          <div className="row" style={{ gap: 6, marginBottom: 4 }}>
            <span className={kindChip(r)}>{kindLabel(r)}</span>
            <span className="tiny muted">{r.duration}</span>
          </div>
          <div className="bold wrap">{r.title}</div>
          {meta && <div className="small muted">{meta}</div>}
        </div>
        {right ?? (onPick ? <IconPlus /> : <IconChevron />)}
      </div>
    </div>
  )
}
