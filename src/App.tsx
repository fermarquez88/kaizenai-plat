import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { useSettings } from './lib/store'

export function App() {
  const fontScale = useSettings((s) => s.fontScale)

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(fontScale))
  }, [fontScale])

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
