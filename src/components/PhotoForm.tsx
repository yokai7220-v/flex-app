import { useState } from 'react'
import { POSES, type Photo, type PoseId } from '../db'
import { today } from '../lib/date'
import { useObjectURL } from '../lib/image'

export type PhotoMeta = Pick<Photo, 'date' | 'pose' | 'state' | 'note'>

export function PhotoForm({ preview, initial, onSave, saving }: { preview: Blob; initial?: PhotoMeta; onSave: (m: PhotoMeta) => void; saving?: boolean }) {
  const url = useObjectURL(preview)
  const [m, setM] = useState<PhotoMeta>(initial ?? { date: today(), pose: 'pike', state: 'warm', note: '' })
  const patch = (p: Partial<PhotoMeta>) => setM((x) => ({ ...x, ...p }))

  return (
    <div>
      {url && <img src={url} alt="" style={{ width: '100%', maxHeight: 260, objectFit: 'contain', borderRadius: 12, background: 'var(--bg)', marginBottom: 12 }} />}
      <div className="field">
        <span>Поза</span>
        <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
          {POSES.map((p) => (
            <button key={p.id} className={`btn sm ${m.pose === p.id ? 'primary' : ''}`} onClick={() => patch({ pose: p.id as PoseId })}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <span>Состояние</span>
        <div className="row" style={{ gap: 6 }}>
          <button className={`btn sm grow ${m.state === 'cold' ? 'primary' : ''}`} onClick={() => patch({ state: 'cold' })}>Холодный</button>
          <button className={`btn sm grow ${m.state === 'warm' ? 'primary' : ''}`} onClick={() => patch({ state: 'warm' })}>Разогретый</button>
        </div>
      </div>
      <label className="field">
        <span>Дата</span>
        <input type="date" value={m.date} max={today()} onChange={(e) => e.target.value && patch({ date: e.target.value })} />
      </label>
      <label className="field">
        <span>Заметка</span>
        <textarea value={m.note} placeholder="Например: 5 см до пола, тянуло слева" onChange={(e) => patch({ note: e.target.value })} />
      </label>
      <button className="btn primary block" disabled={saving} onClick={() => onSave(m)}>
        {saving ? 'Сохраняю…' : 'Сохранить'}
      </button>
    </div>
  )
}
