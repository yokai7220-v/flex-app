import { updateSettings, useStore } from '../store'

export const isStandalone = () =>
  matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export function InstallSteps() {
  return isIOS() ? (
    <ol className="small" style={{ margin: 0, paddingLeft: 18 }}>
      <li>Открой этот адрес в <b>Safari</b></li>
      <li>Нажми «Поделиться» (квадрат со стрелкой вверх)</li>
      <li>Выбери <b>«На экран Домой»</b> → «Добавить»</li>
    </ol>
  ) : (
    <ol className="small" style={{ margin: 0, paddingLeft: 18 }}>
      <li>Открой этот адрес в <b>Chrome</b></li>
      <li>Меню ⋮ в правом верхнем углу</li>
      <li>Выбери <b>«Установить приложение»</b> или «Добавить на главный экран»</li>
    </ol>
  )
}

export function InstallHint() {
  const { settings } = useStore()
  if (isStandalone() || settings.installHintDismissed) return null
  return (
    <div className="card" style={{ border: '1.5px solid var(--accent-soft)' }}>
      <div className="row between" style={{ marginBottom: 6 }}>
        <div className="bold">Установи на главный экран</div>
        <button className="btn sm" style={{ background: 'none', color: 'var(--muted)', padding: 4, minHeight: 0 }} onClick={() => updateSettings({ installHintDismissed: true })} aria-label="Скрыть">
          ✕
        </button>
      </div>
      <div className="small muted" style={{ marginBottom: 8 }}>Так приложение работает без интернета, а данные надёжнее хранятся в телефоне.</div>
      <InstallSteps />
    </div>
  )
}
