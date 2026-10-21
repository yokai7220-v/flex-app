import { useNav, type Tab } from '../nav'
import { IconProgram, IconProgress, IconSettings, IconToday } from './Icons'

const tabs: { id: Tab; label: string; icon: () => React.JSX.Element }[] = [
  { id: 'today', label: 'Сегодня', icon: IconToday },
  { id: 'program', label: 'Программа', icon: IconProgram },
  { id: 'progress', label: 'Прогресс', icon: IconProgress },
  { id: 'settings', label: 'Настройки', icon: IconSettings },
]

export function BottomNav() {
  const { route, go } = useNav()
  return (
    <div className="tabbar">
      <nav>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} className={route.tab === id ? 'on' : ''} onClick={() => route.tab !== id && go({ tab: id })}>
            <Icon />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}
