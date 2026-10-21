import { useRef, useState } from 'react'
import { approxSizeMB, buildBackupFile, canShareFile, deliverBackup, readBackup, restoreBackup } from '../lib/backup'
import { human, plural, toStr } from '../lib/date'
import { useStore } from '../store'
import { Sheet } from './ui'

type Pending = Awaited<ReturnType<typeof readBackup>>

export function BackupCard() {
  const { logs, photos, settings } = useStore()
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState<{ text: string; error?: boolean }>()
  const [pending, setPending] = useState<Pending>()
  const [ready, setReady] = useState<File>()
  const input = useRef<HTMLInputElement>(null)

  const run = async (label: string, fn: () => Promise<string | void>) => {
    setBusy(label)
    setMsg(undefined)
    try {
      const text = await fn()
      if (text) setMsg({ text })
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : 'Что-то пошло не так', error: true })
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="card">
      <div className="small">
        {logs.length} {plural(logs.length, 'отметка', 'отметки', 'отметок')} · {photos.length} фото · ~{approxSizeMB(photos).toFixed(1).replace('.', ',')} МБ
      </div>
      <div className="small muted" style={{ marginBottom: 12 }}>
        Последний бэкап: {settings.lastBackup ? human(toStr(new Date(settings.lastBackup))) : 'не было'}. Данные есть только в этом телефоне. Если удалить приложение без бэкапа, их не вернуть.
      </div>
      {ready ? (
        <button
          className="btn primary block"
          disabled={!!busy}
          onClick={() =>
            run('save', async () => {
              const r = await deliverBackup(ready)
              if (r !== 'cancelled') setReady(undefined)
              return r === 'cancelled' ? '' : r === 'shared' ? 'Готово. Файл можно хранить в «Файлах», Telegram или Google Drive.' : 'Файл скачан.'
            })
          }
        >
          Поделиться файлом · {(ready.size / 1024 / 1024).toFixed(1).replace('.', ',')} МБ
        </button>
      ) : (
        <button
          className="btn primary block"
          disabled={!!busy}
          onClick={() =>
            run('build', async () => {
              const file = await buildBackupFile()
              if (canShareFile(file)) {
                setReady(file)
                return 'Файл готов. Нажми «Поделиться» и выбери, куда сохранить.'
              }
              await deliverBackup(file)
              return 'Файл скачан.'
            })
          }
        >
          {busy === 'build' ? 'Готовлю файл…' : 'Сохранить бэкап'}
        </button>
      )}
      <button className="btn block" style={{ marginTop: 8 }} disabled={!!busy} onClick={() => input.current?.click()}>
        {busy === 'restore' ? 'Восстанавливаю…' : 'Восстановить из файла'}
      </button>
      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (f) run('read', async () => setPending(await readBackup(f)))
        }}
      />
      {msg && <div className="small" style={{ marginTop: 10, color: msg.error ? 'var(--danger)' : 'var(--accent)' }}>{msg.text}</div>}

      {pending && (
        <Sheet title="Восстановить бэкап?" onClose={() => setPending(undefined)}>
          <p className="small" style={{ marginTop: 0 }}>
            Бэкап от {human(toStr(new Date(pending.exportedAt)))}: {pending.logs.length} {plural(pending.logs.length, 'отметка', 'отметки', 'отметок')}, {pending.photos.length} фото.
          </p>
          <p className="small muted">Текущие данные в телефоне будут заменены данными из файла.</p>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn grow" onClick={() => setPending(undefined)}>Отмена</button>
            <button
              className="btn primary grow"
              onClick={() => {
                const data = pending
                setPending(undefined)
                run('restore', async () => {
                  await restoreBackup(data)
                  return 'Данные восстановлены.'
                })
              }}
            >
              Восстановить
            </button>
          </div>
        </Sheet>
      )}
    </div>
  )
}
