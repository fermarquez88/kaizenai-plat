import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { useSettings } from './lib/store'

export function App() {
  const fontScale = useSettings((s) => s.fontScale)
  const simpleMode = useSettings((s) => s.simpleMode)

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(fontScale))
  }, [fontScale])
  useEffect(() => {
    document.documentElement.dataset.simple = simpleMode ? 'on' : 'off'
  }, [simpleMode])

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
