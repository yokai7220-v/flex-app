import { useRef, useState } from 'react'
import { useObjectURL } from '../lib/image'

export function CompareSlider({ before, after, labels }: { before: Blob; after: Blob; labels: [string, string] }) {
  const a = useObjectURL(before)
  const b = useObjectURL(after)
  const [pos, setPos] = useState(50)
  const box = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const move = (clientX: number) => {
    const r = box.current!.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }

  return (
    <div>
      <div
        ref={box}
        style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: 'var(--card)', touchAction: 'none', userSelect: 'none', aspectRatio: '3 / 4' }}
        onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); move(e.clientX) }}
        onPointerMove={(e) => dragging.current && move(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        {a && <img src={a} alt="До" draggable={false} style={imgStyle} />}
        {b && <img src={b} alt="После" draggable={false} style={{ ...imgStyle, clipPath: `inset(0 0 0 ${pos}%)` }} />}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pos}%`, width: 2, marginLeft: -1, background: '#fff', boxShadow: '0 0 4px rgba(0,0,0,0.4)' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 34, height: 34, margin: '-17px 0 0 -17px', borderRadius: '50%', background: '#fff', boxShadow: '0 1px 6px rgba(0,0,0,0.3)', display: 'grid', placeItems: 'center', fontSize: 14, color: 'var(--text)' }}>‹›</div>
        </div>
        <span className="chip" style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.9)', color: 'var(--text)' }}>До</span>
        <span className="chip" style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.9)', color: 'var(--text)' }}>После</span>
      </div>
      <div className="row between tiny muted" style={{ marginTop: 4 }}>
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
      </div>
    </div>
  )
}

const imgStyle: React.CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }

export function SideBySide({ before, after, labels }: { before: Blob; after: Blob; labels: [string, string] }) {
  const a = useObjectURL(before)
  const b = useObjectURL(after)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {[a, b].map((u, i) => (
        <div key={i}>
          <div style={{ aspectRatio: '3 / 4', borderRadius: 12, overflow: 'hidden', background: 'var(--card)' }}>
            {u && <img src={u} alt={i ? 'После' : 'До'} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />}
          </div>
          <div className="tiny muted" style={{ marginTop: 4, textAlign: 'center' }}>{labels[i]}</div>
        </div>
      ))}
    </div>
  )
}
