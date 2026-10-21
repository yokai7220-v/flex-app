import { DoneSection } from '../components/DoneControls'
import { Top } from '../components/ui'
import { VideoList } from '../components/VideoList'
import { WARMUP_STEP, findRoutine, type Routine, type Step } from '../data/program'
import { useStore } from '../store'

export function stepsFor(r: Routine, heavyMode: 'between' | 'after'): Step[] {
  if (r.kind !== 'heavy' || heavyMode !== 'between' || r.steps[0]?.name.startsWith('Разминка')) return r.steps
  return [WARMUP_STEP, ...r.steps]
}

export function RoutineDetail({ id, embed }: { id: string; embed?: boolean }) {
  const { settings } = useStore()
  const r = findRoutine(id)
  if (!r) return <div className="screen"><Top title="Не найдено" back /></div>
  const steps = stepsFor(r, settings.heavyMode)

  return (
    <div className={embed ? undefined : 'screen'}>
      {!embed && <Top title={r.title} back />}

      {r.kind === 'heavy' && settings.heavyMode === 'after' && (
        <p className="note">Делай сразу после силовой, пока разогрет, без отдельной разминки. Не перед силовой.</p>
      )}
      {r.intro && <p className="lead">{r.intro}</p>}

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
        <div className="note stack">
          {r.notes.map((n) => <div key={n}>{n}</div>)}
        </div>
      )}

      <DoneSection routine={r} />
    </div>
  )
}
