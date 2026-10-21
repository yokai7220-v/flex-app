import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type Tab = 'today' | 'program' | 'progress' | 'settings'

export type Route = {
  tab: Tab
  routine?: string
  level?: string
  sub?: 'stats' | 'photos'
  photo?: string
  compare?: boolean
}

type Nav = {
  route: Route
  go: (r: Route) => void
  replace: (r: Route) => void
  back: () => void
}

const NavContext = createContext<Nav>(null!)

export function NavProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => ({ tab: (history.state as Route | null)?.tab ?? 'today' }))

  useEffect(() => {
    history.replaceState(route, '')
    const onPop = (e: PopStateEvent) => setRoute((e.state as Route) ?? { tab: 'today' })
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [])

  const go = useCallback((r: Route) => {
    history.pushState(r, '')
    setRoute(r)
    scrollTo(0, 0)
  }, [])

  const replace = useCallback((r: Route) => {
    history.replaceState(r, '')
    setRoute(r)
  }, [])

  const back = useCallback(() => history.back(), [])

  return <NavContext.Provider value={{ route, go, replace, back }}>{children}</NavContext.Provider>
}

export const useNav = () => useContext(NavContext)
