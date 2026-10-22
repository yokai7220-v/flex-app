import { Top } from '../components/ui'
import { VideoList } from '../components/VideoList'
import { WARMUP_STEP, findRoutine } from '../data/program'
import { useStore } from '../store'

export function RoutineDetail({ id }: { id: string }) {
  const { settings } = useStore()
  const r = findRoutine(id)
  if (!r) return <div className="screen"><Top title="Не найдено" back /></div>
  const warmup = r.kind === 'heavy' && settings.heavyMode === 'between' && !r.videos[0]?.steps?.[0]?.name.startsWith('Разминка')

  return (
    <div className="screen">
      <Top title={r.title} back />

      {r.kind === 'heavy' && settings.heavyMode === 'after' && (
        <p className="note">Делай сразу после силовой, пока разогрет, без отдельной разминки. Не перед силовой.</p>
      )}
      {r.intro && <p className="lead">{r.intro}</p>}

      <div className="section-title">Видео</div>
      <div className="card" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <VideoList videos={r.videos} />
      </div>

      {warmup && <p className="note">{WARMUP_STEP.name}: {WARMUP_STEP.dose}</p>}

      {r.notes && r.notes.length > 0 && (
        <div className="note stack">
          {r.notes.map((n) => <div key={n}>{n}</div>)}
        </div>
      )}
    </div>
  )
}
