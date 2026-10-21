import { useRef, useState } from 'react'
import { IconPlus } from '../components/Icons'
import { PhotoForm, type PhotoMeta } from '../components/PhotoForm'
import { Seg, Sheet } from '../components/ui'
import { POSES, uid, type Photo } from '../db'
import { shortDate } from '../lib/date'
import { compressPhoto, useObjectURL } from '../lib/image'
import { useNav } from '../nav'
import { savePhoto, useStore } from '../store'

export const poseLabel = (id: string) => POSES.find((p) => p.id === id)?.label ?? id

function Thumb({ photo, onClick, selected }: { photo: Photo; onClick: () => void; selected?: boolean }) {
  const url = useObjectURL(photo.thumb)
  return (
    <button onClick={onClick} style={{ border: 0, padding: 0, background: 'none', textAlign: 'left', cursor: 'pointer', minWidth: 0 }}>
      <div
        style={{
          aspectRatio: '3 / 4',
          borderRadius: 12,
          background: `var(--line) center / cover no-repeat`,
          backgroundImage: url ? `url(${url})` : undefined,
          outline: selected ? '3px solid var(--accent)' : 'none',
          outlineOffset: -3,
          position: 'relative',
        }}
      >
        <span className="chip" style={{ position: 'absolute', left: 6, bottom: 6, background: 'rgba(255,255,255,0.9)', color: 'var(--text)', padding: '2px 7px' }}>
          {photo.state === 'cold' ? '❄︎' : '♨︎'} {shortDate(photo.date)}
        </span>
      </div>
      <div className="tiny muted" style={{ marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{poseLabel(photo.pose)}</div>
    </button>
  )
}

export function PhotoGrid({ photos, onPick, selected }: { photos: Photo[]; onPick: (p: Photo) => void; selected?: string[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
      {photos.map((p) => <Thumb key={p.id} photo={p} onClick={() => onPick(p)} selected={selected?.includes(p.id)} />)}
    </div>
  )
}

export function PhotosView() {
  const { photos } = useStore()
  const { go } = useNav()
  const [pose, setPose] = useState<string>('all')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const input = useRef<HTMLInputElement>(null)

  const poses = POSES.filter((p) => photos.some((x) => x.pose === p.id))
  const shown = pose === 'all' ? photos : photos.filter((p) => p.pose === pose)

  const save = async (m: PhotoMeta) => {
    if (!file) return
    setSaving(true)
    setError('')
    try {
      const { blob, thumb } = await compressPhoto(file)
      await savePhoto({ id: uid(), ...m, blob, thumb, createdAt: Date.now() })
      setFile(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить фото')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null)
          e.target.value = ''
        }}
      />
      <div className="row" style={{ gap: 8, marginBottom: 12 }}>
        <button className="btn primary grow row" style={{ justifyContent: 'center', gap: 6, whiteSpace: 'nowrap' }} onClick={() => input.current?.click()}>
          <IconPlus /> Добавить фото
        </button>
        <button className="btn soft grow" style={{ whiteSpace: 'nowrap' }} disabled={photos.length < 2} onClick={() => go({ tab: 'progress', sub: 'photos', compare: true })}>
          Сравнить
        </button>
      </div>

      {photos.length === 0 ? (
        <div className="card empty">
          Фото пока нет. Снимай раз в 4 недели: с одной точки, в одинаковой одежде и свете — тогда сравнение будет честным.
        </div>
      ) : (
        <>
          {poses.length > 1 && (
            <Seg value={pose} onChange={setPose} options={[{ id: 'all', label: `Все · ${photos.length}` }, ...poses.map((p) => ({ id: p.id, label: p.label }))]} />
          )}
          <PhotoGrid photos={shown} onPick={(p) => go({ tab: 'progress', sub: 'photos', photo: p.id })} />
        </>
      )}

      {file && (
        <Sheet title="Новое фото" onClose={() => !saving && setFile(null)}>
          <PhotoForm preview={file} onSave={save} saving={saving} />
          {error && <div className="small" style={{ color: 'var(--danger)', marginTop: 8 }}>{error}</div>}
        </Sheet>
      )}
    </>
  )
}
