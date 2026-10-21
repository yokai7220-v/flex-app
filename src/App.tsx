import { BottomNav } from './components/BottomNav'
import { useNav } from './nav'
import { SettingsScreen } from './screens/Settings'
import { useStore } from './store'

export function App() {
  const { route } = useNav()
  const { ready } = useStore()
  if (!ready) return null

  return (
    <>
      {route.tab === 'settings' ? <SettingsScreen /> : <div className="screen"><div className="top"><h1>{route.tab}</h1></div></div>}
      <BottomNav />
    </>
  )
}
