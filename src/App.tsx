import { BottomNav } from './components/BottomNav'
import { useNav } from './nav'
import { CompareScreen } from './screens/Compare'
import { PhotoDetail } from './screens/PhotoDetail'
import { ProgramScreen } from './screens/Program'
import { ProgressScreen } from './screens/Progress'
import { RoutineDetail } from './screens/RoutineDetail'
import { SettingsScreen } from './screens/Settings'
import { TodayScreen } from './screens/Today'
import { useStore } from './store'

function Screen() {
  const { route } = useNav()
  if (route.routine) return <RoutineDetail id={route.routine} />
  if (route.photo) return <PhotoDetail id={route.photo} />
  if (route.compare) return <CompareScreen />
  switch (route.tab) {
    case 'program':
      return <ProgramScreen />
    case 'settings':
      return <SettingsScreen />
    case 'progress':
      return <ProgressScreen />
    default:
      return <TodayScreen />
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
