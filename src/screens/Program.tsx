import { IconCheck, IconChevron } from '../components/Icons'
import { Seg, Top } from '../components/ui'
import { VideoList } from '../components/VideoList'
import { levels, testRoutine, theory, type Level, type Routine } from '../data/program'
import { human, today } from '../lib/date'
import { kindChip, kindLabel } from '../lib/labels'
import { useNav } from '../nav'
import { updateSettings, useStore } from '../store'

export function ProgramScreen() {
  const { route, replace } = useNav()
  const { settings } = useStore()
  const sel = route.level ?? settings.currentLevel

  return (
    <div className="screen">
      <Top title="Программа" big />
      <Seg
        value={sel}
        onChange={(level) => replace({ tab: 'program', level })}
        options={[
          { id: 'l0', label: 'Замер' },
          ...levels.map((l) => ({ id: l.id, label: `${l.num} · ${l.short}`, dot: l.id === settings.currentLevel })),
          { id: 'theory', label: 'Теория' },
        ]}
      />
      {sel === 'l0' ? <TestView /> : sel === 'theory' ? <TheoryView /> : <LevelView level={levels.find((l) => l.id === sel)!} />}
    </div>
  )
}

function TestView() {
  return (
    <>
      <div className="card">
        <div className="bold">Неделя 0 и каждые 4 недели</div>
        <div className="small muted" style={{ marginTop: 4 }}>
          Замер покажет прогресс, который не видно день ко дню. Три базовых теста Меррика: присед, наклон, «ангел» у стены — плюс фото позиций.
        </div>
      </div>
      <RoutineCard r={testRoutine} />
    </>
  )
}

function TheoryView() {
  return (
    <>
      {theory.map((t) => (
        <div className="card" key={t.title}>
          <div className="bold" style={{ marginBottom: 8 }}>{t.title}</div>
          <div className="stack small">
            {t.body.map((p) => <p key={p} style={{ margin: 0 }}>{p}</p>)}
          </div>
          {t.videos && <div style={{ marginTop: 10 }}><VideoList videos={t.videos} /></div>}
        </div>
      ))}
    </>
  )
}

function LevelView({ level }: { level: Level }) {
  const { settings } = useStore()
  const isCurrent = settings.currentLevel === level.id
  const passed = level.criteria.filter((c) => settings.criteria[c.id]).length
  const next = levels.find((l) => l.num === level.num + 1)

  const toggle = (id: string) => updateSettings({ criteria: { ...settings.criteria, [id]: !settings.criteria[id] } })

  return (
    <>
      <div className="card">
        <div className="row between">
          <div className="grow">
            <div className="bold" style={{ fontSize: 20 }}>{level.title}</div>
            <div className="small muted">{level.months} · {level.heavyPerWeek} тяжёлых в неделю</div>
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
      {passed === level.criteria.length && next && (
        <div className="banner info">Все критерии выполнены — можно переходить на уровень {next.num} «{next.short}».</div>
      )}

      <div className="section-title">Рутины</div>
      {level.routines.map((r) => <RoutineCard key={r.id} r={r} />)}
    </>
  )
}

export function RoutineCard({ r, right }: { r: Routine; right?: React.ReactNode }) {
  const { go, route } = useNav()
  const { logs } = useStore()
  const last = logs.find((l) => l.routineId === r.id)
  return (
    <div className="card tap" onClick={() => go({ tab: route.tab, routine: r.id })}>
      <div className="row">
        <div className="grow">
          <div className="row" style={{ gap: 6, marginBottom: 4 }}>
            <span className={kindChip(r)}>{kindLabel(r)}</span>
            <span className="tiny muted">{r.duration}</span>
          </div>
          <div className="bold wrap">{r.title}</div>
          <div className="small muted">
            {r.freq}
            {last ? ` · последний раз ${human(last.date)}` : ''}
          </div>
        </div>
        {right ?? <IconChevron />}
      </div>
    </div>
  )
}
