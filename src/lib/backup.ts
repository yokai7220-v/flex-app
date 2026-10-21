import type { Log, Photo, Settings } from '../db'
import { getState, replaceAll, updateSettings } from '../store'
import { today } from './date'

const toDataURL = (b: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = () => reject(r.error)
    r.readAsDataURL(b)
  })

const fromDataURL = async (s: string) => (await fetch(s)).blob()

type SerializedPhoto = Omit<Photo, 'blob' | 'thumb'> & { blob: string; thumb: string }
type BackupFile = { app: 'flex-app'; version: 1; exportedAt: number; settings: Settings; logs: Log[]; photos: SerializedPhoto[] }

export async function buildBackupFile(): Promise<File> {
  const { settings, logs, photos } = getState()
  const data: BackupFile = {
    app: 'flex-app',
    version: 1,
    exportedAt: Date.now(),
    settings,
    logs,
    photos: await Promise.all(photos.map(async (p) => ({ ...p, blob: await toDataURL(p.blob), thumb: await toDataURL(p.thumb) }))),
  }
  return new File([JSON.stringify(data)], `flex-backup-${today()}.json`, { type: 'application/json' })
}

export const canShareFile = (file: File) => !!navigator.canShare?.({ files: [file] })

export async function deliverBackup(file: File): Promise<'shared' | 'downloaded' | 'cancelled'> {
  if (canShareFile(file)) {
    try {
      await navigator.share({ files: [file], title: file.name })
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled'
      throw e
    }
    await updateSettings({ lastBackup: Date.now() })
    return 'shared'
  }
  const url = URL.createObjectURL(file)
  const a = Object.assign(document.createElement('a'), { href: url, download: file.name })
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  await updateSettings({ lastBackup: Date.now() })
  return 'downloaded'
}

export async function readBackup(file: File) {
  let data: BackupFile
  try {
    data = JSON.parse(await file.text())
  } catch {
    throw new Error('Не получилось прочитать файл. Это не бэкап.')
  }
  if (data?.app !== 'flex-app' || !Array.isArray(data.logs) || !Array.isArray(data.photos)) throw new Error('Это не файл бэкапа этого приложения.')
  return data
}

export async function restoreBackup(data: BackupFile) {
  const photos: Photo[] = await Promise.all(data.photos.map(async (p) => ({ ...p, blob: await fromDataURL(p.blob), thumb: await fromDataURL(p.thumb) })))
  await replaceAll({ settings: { ...data.settings, lastBackup: data.exportedAt }, logs: data.logs, photos })
}

export const approxSizeMB = (photos: Photo[]) => photos.reduce((s, p) => s + p.blob.size + p.thumb.size, 0) / 1024 / 1024
