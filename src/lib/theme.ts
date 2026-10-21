export const ACCENT_PRESETS = [
  '#1f7a6d',
  '#2e7d46',
  '#6f8a1f',
  '#3d7ea6',
  '#2563a8',
  '#4f51b8',
  '#744fb5',
  '#9a4fb0',
  '#bf4791',
  '#c2436b',
  '#c43d31',
  '#bd5d33',
  '#c47f28',
  '#8a5f45',
  '#55616e',
  '#3d3d38',
]

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const channel = (v: number) => {
  const c = v / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

const luminance = (hex: string) => {
  const [r, g, b] = rgb(hex)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export const readableOn = (hex: string) => (luminance(hex) > 0.38 ? '#1c1c1a' : '#ffffff')

const mix = (hex: string, target: string, t: number) => {
  const a = rgb(hex)
  const b = rgb(target)
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('')
}

export function applyAccent(accent?: string) {
  const style = document.documentElement.style
  if (!accent || !/^#[0-9a-f]{6}$/i.test(accent)) {
    style.removeProperty('--accent')
    style.removeProperty('--accent-soft')
    style.removeProperty('--accent-mid')
    style.removeProperty('--on-accent')
    return
  }
  style.setProperty('--accent', accent)
  style.setProperty('--accent-soft', mix(accent, '#ffffff', 0.87))
  style.setProperty('--accent-mid', mix(accent, '#ffffff', 0.6))
  style.setProperty('--on-accent', readableOn(accent))
}
