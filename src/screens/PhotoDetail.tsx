import { useState } from 'react'
import { PhotoForm } from '../components/PhotoForm'
import { Sheet, Top } from '../components/ui'
import { human } from '../lib/date'
import { useObjectURL } from '../lib/image'
import { useNav } from '../nav'
import { deletePhoto, savePhoto, useStore } from '../store'
import { poseLabel } from './Photos'

export function PhotoDetail({ id }: { id: string }) {
  const { photos } = useStore()
  const { back } = useNav()
  const photo = photos.find((p) => p.id === id)
  const url = useObjectURL(photo?.blob)
  const [editing, setEditing] = useState(false)
  const [confirm, setConfirm] = useState(false)

  if (!photo) return <div className="screen"><Top title="Фото удалено" back /></div>

  return (
    <div className="screen">
      <Top title={poseLabel(photo.pose)} back />
      {url && <img src={url} alt="" style={{ width: '100%', borderRadius: 16, display: 'block', background: 'var(--card)' }} />}
      <div className="card" style={{ marginTop: 10 }}>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          <span className="chip">{human(photo.date)}</span>
          <span className={photo.state === 'cold' ? 'chip' : 'chip warn'}>{photo.state === 'cold' ? 'Холодный' : 'Разогретый'}</span>
        </div>
        {photo.note && <p className="small wrap" style={{ margin: '10px 0 0' }}>{photo.note}</p>}
      </div>
      <div className="row" style={{ gap: 8 }}>
        <button className="btn grow" style={{ background: 'var(--card)' }} onClick={() => setEditing(true)}>Изменить</button>
        <button className="btn danger grow" onClick={() => setConfirm(true)}>Удалить</button>
      </div>

      {editing && (
        <Sheet title="Изменить фото" onClose={() => setEditing(false)}>
          <PhotoForm
            preview={photo.thumb}
            initial={photo}
            onSave={async (m) => {
              await savePhoto({ ...photo, ...m })
              setEditing(false)
            }}
          />
        </Sheet>
      )}
      {confirm && (
        <Sheet title="Удалить фото?" onClose={() => setConfirm(false)}>
          <p className="small muted" style={{ marginTop: 0 }}>Фото есть только в этом телефоне. Если его нет в бэкапе, вернуть не получится.</p>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn grow" onClick={() => setConfirm(false)}>Отмена</button>
            <button
              className="btn danger grow"
              onClick={async () => {
                await deletePhoto(photo.id)
                back()
              }}
            >
              Удалить
            </button>
          </div>
        </Sheet>
      )}
    </div>
  )
}
