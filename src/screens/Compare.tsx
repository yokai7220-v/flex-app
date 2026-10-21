import { useState } from 'react'
import { CompareSlider, SideBySide } from '../components/CompareSlider'
import { Seg, Top } from '../components/ui'
import { POSES, type Photo } from '../db'
import { diffDays, human, plural } from '../lib/date'
import { useStore } from '../store'
import { PhotoGrid } from './Photos'

const coldWarm = (p: Photo) => (p.state === 'cold' ? 'холодный' : 'разогретый')

export function CompareScreen() {
  const { photos } = useStore()
  const poses = POSES.filter((p) => photos.some((x) => x.pose === p.id))
  const busiest = [...poses].sort((a, b) => photos.filter((x) => x.pose === b.id).length - photos.filter((x) => x.pose === a.id).length)[0]
  const [pose, setPose] = useState<string>(busiest?.id ?? '')
  const ofPose = photos.filter((p) => p.pose === pose)
  const [sel, setSel] = useState<string[]>(() => defaultPair(photos.filter((p) => p.pose === busiest?.id)))
  const [mode, setMode] = useState<'slider' | 'side'>('slider')

  const pickPose = (id: string) => {
    setPose(id)
    setSel(defaultPair(photos.filter((p) => p.pose === id)))
  }
  const toggle = (p: Photo) => setSel((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s.slice(-1), p.id]))

  const chosen = sel.map((id) => photos.find((p) => p.id === id)).filter((p): p is Photo => !!p)
  const [before, after] = [...chosen].sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt)
  const gap = before && after ? diffDays(after.date, before.date) : 0
  const labels: [string, string] = before && after ? [`${human(before.date)} · ${coldWarm(before)}`, `${human(after.date)} · ${coldWarm(after)}`] : ['', '']

  return (
    <div className="screen">
      <Top title="Сравнение" back />
      {poses.length === 0 ? (
        <div className="card empty">Сначала добавь хотя бы два фото одной позы.</div>
      ) : (
        <>
          <Seg value={pose} onChange={pickPose} options={poses.map((p) => ({ id: p.id, label: p.label }))} />

          {before && after ? (
            <>
              <Seg
                value={mode}
                onChange={setMode}
                variant="switch"
                options={[
                  { id: 'slider', label: 'Ползунок' },
                  { id: 'side', label: 'Рядом' },
                ]}
              />
              {mode === 'slider' ? <CompareSlider before={before.blob} after={after.blob} labels={labels} /> : <SideBySide before={before.blob} after={after.blob} labels={labels} />}
              <div className="small" style={{ margin: '10px 4px 0' }}>
                {gap === 0 ? 'Один и тот же день.' : `${gap} ${plural(gap, 'день', 'дня', 'дней')} между фото.`}
                {before.state !== after.state && <div className="muted">Одно фото до разминки, другое после, сравнение неточное.</div>}
              </div>
            </>
          ) : (
            <div className="note">
              {ofPose.length < 2 ? 'У этой позы одно фото. Для сравнения нужно второе.' : 'Выбери два фото ниже.'}
            </div>
          )}

          <div className="section-title">Выбери два фото · {sel.length} из 2</div>
          <PhotoGrid photos={ofPose} onPick={toggle} selected={sel} />
        </>
      )}
    </div>
  )
}

function defaultPair(list: Photo[]) {
  if (list.length < 2) return list.map((p) => p.id)
  return [list[list.length - 1].id, list[0].id]
}
