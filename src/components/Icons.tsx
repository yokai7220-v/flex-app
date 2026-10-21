const s = { width: 24, height: 24, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const IconToday = () => (
  <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
)
export const IconProgram = () => (
  <svg {...s} viewBox="0 0 24 24"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" /></svg>
)
export const IconProgress = () => (
  <svg {...s} viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></svg>
)
export const IconSettings = () => (
  <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></svg>
)
export const IconBack = () => (
  <svg {...s} width={20} height={20} viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
)
export const IconCheck = () => (
  <svg {...s} width={16} height={16} strokeWidth={2.6} viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" /></svg>
)
export const IconPlus = () => (
  <svg {...s} width={20} height={20} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
)
export const IconChevron = () => (
  <svg {...s} width={18} height={18} viewBox="0 0 24 24" style={{ color: 'var(--muted)', flex: 'none' }}><path d="M9 18l6-6-6-6" /></svg>
)
