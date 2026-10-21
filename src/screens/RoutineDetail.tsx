import { DoneSection } from '../components/DoneControls'
import { Top } from '../components/ui'
import { VideoList } from '../components/VideoList'
import { WARMUP_STEP, findRoutine, levelOfRoutine, type Routine, type Step } from '../data/program'
import { kindChip, kindLabel } from '../lib/labels'
import { useStore } from '../store'

export function stepsFor(r: Routine, heavyMode: 'between' | 'after'): Step[] {
  if (r.kind !== 'heavy' || heavyMode !== 'between' || r.steps[0]?.name.startsWith('Разминка')) return r.steps
  return [WARMUP_STEP, ...r.steps]
}

export function RoutineDetail({ id, embed }: { id: string; embed?: boolean }) {
  const { settings } = useStore()
  const r = findRoutine(id)
  if (!r) return <div className="screen"><Top title="Не найдено" back /></div>
  const level = levelOfRoutine(id)
  const steps = stepsFor(r, settings.heavyMode)

  return (
    <div className={embed ? undefined : 'screen'}>
      {!embed && <Top title={r.title} back />}
      {!embed && (
        <div className="row" style={{ gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <span className={kindChip(r)}>{kindLabel(r)}</span>
          {level && <span className="chip">{level.short}</span>}
          {r.freq && <span className="chip">{r.freq}</span>}
          <span className="chip">{r.duration}</span>
        </div>
      )}

      {r.kind === 'heavy' && settings.heavyMode === 'after' && (
        <div className="banner info">Финишер после силовой: ты уже разогрет, отдельная разминка не нужна. Не делай это перед силовой.</div>
      )}
      {r.intro && <div className="card small">{r.intro}</div>}

      <div className="section-title">Видео</div>
      <div className="card" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <VideoList videos={r.videos} />
      </div>

      <div className="section-title">Упражнения</div>
      <div className="card" style={{ paddingTop: 6, paddingBottom: 6 }}>
        <ol className="steps">
          {steps.map((s, i) => (
            <li key={i}>
              <div className="wrap">{s.name}</div>
              {s.dose && <div className="dose">{s.dose}</div>}
              {s.note && <div className="small muted">{s.note}</div>}
            </li>
          ))}
        </ol>
      </div>

      {r.notes && r.notes.length > 0 && (
        <div className="card small muted stack">
          {r.notes.map((n) => <div key={n}>{n}</div>)}
        </div>
      )}

      <DoneSection routine={r} />
    </div>
  )
}
