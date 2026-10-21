import { BottomNav } from './components/BottomNav'
import { useNav } from './nav'

export function App() {
  const { route } = useNav()
  return (
    <>
      <div className="screen">
        <div className="top"><h1>{route.tab}</h1></div>
      </div>
      <BottomNav />
    </>
  )
}
