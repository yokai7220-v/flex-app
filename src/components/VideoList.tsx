import { useState } from 'react'
import type { Video } from '../data/program'

function openVideo(e: React.MouseEvent, id: string) {
  const ua = navigator.userAgent
  const app = /iPhone|iPad|iPod/.test(ua)
    ? `youtube://watch?v=${id}`
    : /Android/.test(ua)
      ? `vnd.youtube:${id}`
      : ''
  if (!app) return
  e.preventDefault()
  const timer = setTimeout(() => window.open(`https://www.youtube.com/watch?v=${id}`, '_blank', 'noopener'), 2000)
  const cancel = () => {
    clearTimeout(timer)
    document.removeEventListener('visibilitychange', cancel)
    window.removeEventListener('pagehide', cancel)
  }
  document.addEventListener('visibilitychange', cancel)
  window.addEventListener('pagehide', cancel)
  window.location.href = app
}

function VideoItem({ v, primary }: { v: Video; primary: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="video-item">
      <div className="video-row">
        <a className="video" href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" onClick={(e) => openVideo(e, v.id)}>
          <div className="thumb" style={{ backgroundImage: `url(https://i.ytimg.com/vi/${v.id}/mqdefault.jpg)` }} />
          <div className="grow">
            <div className="vt">{v.title}</div>
            <div className="tiny muted">
              {v.year}
              {primary ? ' · основное' : ''}
              {v.note ? ` · ${v.note}` : ''}
            </div>
          </div>
        </a>
        {v.steps && (
          <button className={open ? 'vcaret on' : 'vcaret'} aria-label="Упражнения из видео" aria-expanded={open} onClick={() => setOpen(!open)} />
        )}
      </div>
      {open && v.steps && (
        <ol className="steps vsteps">
          {v.steps.map((s, i) => (
            <li key={i}>
              <div className="wrap">{s.name}</div>
              {s.dose && <div className="dose">{s.dose}</div>}
              {s.note && <div className="small muted">{s.note}</div>}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export function VideoList({ videos }: { videos: Video[] }) {
  return (
    <div>
      {videos.map((v, i) => (
        <VideoItem key={v.id} v={v} primary={i === 0 && videos.length > 1} />
      ))}
    </div>
  )
}
