import { useEffect, useRef, type ReactNode } from 'react'
import { useNav } from '../nav'
import { IconBack, IconCheck } from './Icons'

export function Top({ title, back, big, right }: { title: ReactNode; back?: boolean; big?: boolean; right?: ReactNode }) {
  const nav = useNav()
  return (
    <div className="top">
      {back && (
        <button className="back" onClick={nav.back} aria-label="Назад">
          <IconBack />
        </button>
      )}
      {big ? <h1>{title}</h1> : <h2>{title}</h2>}
      {right}
    </div>
  )
}

export function Seg<T extends string>({ value, options, onChange, variant }: { value: T; options: { id: T; label: string; done?: boolean }[]; onChange: (v: T) => void; variant?: 'tabs' | 'switch' }) {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const c = box.current
    const el = c?.querySelector('.on')
    if (!c || !el) return
    const r = el.getBoundingClientRect(), cr = c.getBoundingClientRect()
    if (r.right > cr.right - 16) c.scrollLeft += r.right - cr.right + 16
    else if (r.left < cr.left + 16) c.scrollLeft -= cr.left + 16 - r.left
  }, [value])
  return (
    <div ref={box} className={variant ? `seg ${variant}` : 'seg'}>
      {options.map((o) => (
        <button key={o.id} className={o.id === value ? 'on' : ''} onClick={() => onChange(o.id)}>
          {o.label}
          {o.done && <IconCheck size={12} />}
        </button>
      ))}
    </div>
  )
}

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  )
}
