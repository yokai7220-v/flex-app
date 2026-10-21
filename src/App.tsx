import { BottomNav } from './components/BottomNav'
import { useNav } from './nav'
import { ProgramScreen } from './screens/Program'
import { RoutineDetail } from './screens/RoutineDetail'
import { SettingsScreen } from './screens/Settings'
import { useStore } from './store'

function Screen() {
  const { route } = useNav()
  if (route.routine) return <RoutineDetail id={route.routine} />
  switch (route.tab) {
    case 'program':
      return <ProgramScreen />
    case 'settings':
      return <SettingsScreen />
    default:
      return <div className="screen"><div className="top"><h1>{route.tab}</h1></div></div>
  }
}

export function App() {
  const { ready } = useStore()
  if (!ready) return null
  return (
    <>
      <Screen />
      <BottomNav />
    </>
  )
}
