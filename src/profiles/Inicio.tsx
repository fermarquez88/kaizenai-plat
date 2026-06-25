import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Brain, Compass, HeartHandshake, MapPin, ShieldCheck, Stethoscope } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ENTRADA DE PRODUCTO (task-first, no role-first). El benchmark es claro: los
// ecosistemas que funcionan entran por la INTENCIÓN, con la persona en el centro
// y el rol resuelto por contexto/invitación — no por un menú de 6 roles.
// El selector de 6 roles queda como "Recorrido de la red (demo)" en "/".
interface Task {
  key: string
  icon: LucideIcon
  to: string
  accent: string
}

const TASKS: Task[] = [
  { key: 'persona', icon: Brain, to: '/p/paciente', accent: 'text-secondary' },
  { key: 'cuidador', icon: HeartHandshake, to: '/p/cuidador', accent: 'text-primary' },
  { key: 'promotor', icon: MapPin, to: '/p/agente/promotor', accent: 'text-secondary' },
]

export function Inicio() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const invited = params.get('ref') === 'invite'
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {invited && (
        <div className="mx-auto mb-5 max-w-xl rounded-2xl border border-secondary bg-secondary/10 p-4 text-center text-sm text-secondary-text">
          {t('inicio.invitedBanner')}
        </div>
      )}
      <header className="text-center">
        <h1 className="font-serif text-3xl text-ink sm:text-4xl">{t('inicio.title')}</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">{t('inicio.subtitle')}</p>
      </header>

      <div className="mt-8 space-y-3">
        {TASKS.map((task) => {
          const Icon = task.icon
          return (
            <Link
              key={task.key}
              to={task.to}
              className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:border-secondary"
            >
              <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line bg-bg ${task.accent}`}>
                <Icon size={26} strokeWidth={1.8} aria-hidden />
              </span>
              <span>
                <span className="block font-serif text-xl text-ink">{t(`inicio.tasks.${task.key}.t`)}</span>
                <span className="mt-0.5 block text-sm text-muted">{t(`inicio.tasks.${task.key}.d`)}</span>
              </span>
            </Link>
          )
        })}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 text-sm">
        <Link to="/p/unidad/red/bandeja" className="inline-flex items-center gap-2 text-secondary-text hover:underline">
          <Stethoscope size={16} aria-hidden /> {t('inicio.pro')}
        </Link>
        <Link to="/demo" className="inline-flex items-center gap-2 text-muted hover:underline">
          <Compass size={16} aria-hidden /> {t('inicio.demo')}
        </Link>
        <Link to="/perfil" className="inline-flex items-center gap-2 text-muted hover:underline">
          <Brain size={16} aria-hidden /> {t('inicio.mapaPerfil')}
        </Link>
      </div>

      <Link
        to="/aviso-legal"
        className="mt-8 flex items-center justify-center gap-2 text-sm text-secondary-text hover:underline"
      >
        <ShieldCheck size={18} aria-hidden /> {t('inicio.privacy')}
      </Link>
    </div>
  )
}
