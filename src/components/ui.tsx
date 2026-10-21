import type { ReactNode } from 'react'
import { useNav } from '../nav'
import { IconBack } from './Icons'

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

export function Seg<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string; dot?: boolean }[]; onChange: (v: T) => void }) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button key={o.id} className={o.id === value ? 'on' : ''} onClick={() => onChange(o.id)}>
          {o.label}
          {o.dot && <span className="dot" />}
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
