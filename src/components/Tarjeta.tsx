import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Tarjeta de acción CANÓNICA (terminación cálida de kaizen-cuidadores): ícono en cuadro
// redondeado + título + subtítulo, con lift al hover. Unifica la experiencia en toda la app.
// variant 'primary' = acción destacada (terracota); 'plain' = tarjeta de superficie.
export function Tarjeta({
  icon: Icon,
  titulo,
  sub,
  to,
  onClick,
  externo,
  variant = 'plain',
  flecha = false,
}: {
  icon: LucideIcon
  titulo: string
  sub?: string
  to?: string
  onClick?: () => void
  externo?: boolean
  variant?: 'plain' | 'primary'
  flecha?: boolean
}) {
  const primary = variant === 'primary'
  const cls =
    'flex w-full items-center gap-3 rounded-2xl p-4 text-left transition hover:-translate-y-0.5 ' +
    (primary ? 'border border-transparent bg-primary text-white shadow-card' : 'border border-line bg-surface hover:border-secondary')
  const inner = (
    <>
      <span className={'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ' + (primary ? 'bg-white/20 text-white' : 'border border-line bg-bg text-secondary')}>
        <Icon size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={'block font-medium ' + (primary ? 'text-white' : 'text-ink')}>{titulo}</span>
        {sub && <span className={'block text-sm ' + (primary ? 'text-white/90' : 'text-muted')}>{sub}</span>}
      </span>
      {flecha && <ArrowRight size={20} className={'shrink-0 ' + (primary ? 'text-white' : 'text-muted')} />}
    </>
  )
  if (to && externo) return <a href={to} target="_blank" rel="noreferrer" className={cls}>{inner}</a>
  if (to) return <Link to={to} className={cls}>{inner}</Link>
  return <button onClick={onClick} className={cls}>{inner}</button>
}
