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

export function VideoList({ videos }: { videos: Video[] }) {
  return (
    <div>
      {videos.map((v, i) => (
        <a key={v.id} className="video" href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" onClick={(e) => openVideo(e, v.id)}>
          <div className="thumb" style={{ backgroundImage: `url(https://i.ytimg.com/vi/${v.id}/mqdefault.jpg)` }} />
          <div className="grow">
            <div className="vt">{v.title}</div>
            <div className="tiny muted">
              {v.year}
              {i === 0 && videos.length > 1 ? ' · основное' : ''}
              {v.note ? ` · ${v.note}` : ''}
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}
