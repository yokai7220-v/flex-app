import type { Video } from '../data/program'

export function VideoList({ videos }: { videos: Video[] }) {
  return (
    <div>
      {videos.map((v, i) => (
        <a key={v.id} className="video" href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer">
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
