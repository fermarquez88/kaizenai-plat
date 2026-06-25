import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Activity, Brain, CalendarDays, ClipboardList, Home, LayoutGrid, LineChart, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Navegación entre módulos DENTRO de un rol (barra inferior), para saltar sin volver atrás.
// Role-aware: cada rol ve sus módulos principales. Resalta el módulo actual.
interface NavItem {
  key: string
  to: string
  icon: LucideIcon
}

function itemsFor(id: string): NavItem[] {
  const P = `/p/${id}`
  if (id === 'paciente' || id === 'cuidador')
    return [
      { key: 'espacio', to: P, icon: Home },
      { key: 'chequeo', to: `${P}/preconsulta`, icon: Brain },
      { key: 'pedidos', to: `${P}/alarmas`, icon: ClipboardList },
    ]
  if (id === 'agente')
    return [
      { key: 'gente', to: `${P}/promotor`, icon: Users },
      { key: 'seguimiento', to: `${P}/seguimiento`, icon: Activity },
      { key: 'alarmas', to: `${P}/alarmas`, icon: ClipboardList },
      { key: 'agenda', to: `${P}/agenda`, icon: CalendarDays },
    ]
  if (id === 'gestor')
    return [
      { key: 'panel', to: P, icon: LayoutGrid },
      { key: 'alarmas', to: `${P}/alarmas`, icon: ClipboardList },
      { key: 'metricas', to: `${P}/metricas`, icon: LineChart },
    ]
  if (id === 'unidad')
    return [
      { key: 'panel', to: P, icon: LayoutGrid },
      { key: 'alarmas', to: `${P}/alarmas`, icon: ClipboardList },
      { key: 'agenda', to: `${P}/agenda`, icon: CalendarDays },
    ]
  return [
    { key: 'panel', to: P, icon: LayoutGrid },
    { key: 'alarmas', to: `${P}/alarmas`, icon: ClipboardList },
  ]
}

export function ModuleNav({ profileId }: { profileId: string }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const items = itemsFor(profileId)
  const home = `/p/${profileId}`
  const isActive = (to: string) => (to === home ? pathname === home : pathname === to || pathname.startsWith(to + '/'))

  return (
    <nav
      aria-label={t('nav.modulos')}
      className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-bg/95 backdrop-blur no-print"
    >
      <div className="mx-auto flex max-w-2xl items-stretch justify-around">
        {items.map((it) => {
          const Icon = it.icon
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
