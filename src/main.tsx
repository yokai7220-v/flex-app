import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { NavProvider } from './nav'
import { loadStore } from './store'
import './styles.css'

loadStore()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NavProvider>
      <App />
    </NavProvider>
  </StrictMode>,
)
