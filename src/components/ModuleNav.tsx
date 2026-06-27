import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Activity, Brain, CalendarDays, ClipboardList, Home, Inbox, LayoutGrid, LineChart, ListChecks, ScrollText, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { lenteDe, rutaDe } from '../app/lentes'

// Navegación inferior derivada de la MATRIZ DE LENTES (una sola fuente de verdad). Cada
// lente declara sus ≤4 destinos; todos llevan a un home/cola, nunca a un callejón.
const ICONS: Record<string, LucideIcon> = {
  espacio: Home,
  chequeo: Brain,
  pedidos: ClipboardList,
  gente: Users,
  seguimiento: Activity,
  alarmas: ClipboardList,
  cola: ListChecks,
  bandeja: Inbox,
  agenda: CalendarDays,
  panel: LayoutGrid,
  metricas: LineChart,
  gobernanza: ScrollText,
}

export function ModuleNav({ profileId }: { profileId: string }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const items = lenteDe(profileId).nav.map((n) => ({ key: n.key, to: rutaDe(profileId, n.seg) }))
  const home = `/p/${profileId}`
  const isActive = (to: string) => (to === home ? pathname === home : pathname === to || pathname.startsWith(to + '/'))

  return (
    <nav
      aria-label={t('nav.modulos')}
      className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-bg/95 backdrop-blur no-print"
    >
      <div className="mx-auto flex max-w-2xl items-stretch justify-around">
        {items.map((it) => {
          const Icon = ICONS[it.key] ?? Home
          const active = isActive(it.to)
          return (
            <Link
              key={it.key}
              to={it.to}
              aria-current={active ? 'page' : undefined}
              className={'flex flex-1 flex-col items-center gap-0.5 px-2 py-2 text-[11px] ' + (active ? 'text-secondary' : 'text-muted')}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} aria-hidden />
              <span>{t(`nav.mod.${it.key}`)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
