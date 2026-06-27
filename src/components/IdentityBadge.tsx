import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, HeartHandshake, User } from 'lucide-react'
import { useSettings } from '../lib/store'

// "¿De quién es esta ficha?" siempre visible — para nunca completar a ciegas. Persona: su
// propia ficha (no clickeable). Cuidador/promotor: a quién acompaña AHORA, clickeable → selector.
export function IdentityBadge() {
  const { pathname } = useLocation()
  const m = pathname.match(/^\/p\/([^/]+)/)
  const usuarioRol = useSettings((s) => s.usuarioRol)
  const activePersonId = useSettings((s) => s.activePersonId)
  const personas = useSettings((s) => s.personas)

  if (!m || !activePersonId || !personas[activePersonId]) return null
  const profileId = m[1]
  const alias = personas[activePersonId].alias
  const esAcomp = usuarioRol === 'cuidador' || usuarioRol === 'promotor'
  const Icon = esAcomp ? HeartHandshake : User
  const texto = esAcomp ? `Acompañando a ${alias}` : `Tu ficha · ${alias}`

  return (
    <div className="border-b border-line bg-secondary/5 no-print">
      <div className="mx-auto flex max-w-5xl items-center px-4 py-1.5">
        {esAcomp ? (
          <Link to={`/p/${profileId}/personas`} className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-text">
            <Icon size={16} aria-hidden /> {texto} <ChevronDown size={15} aria-hidden />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-text">
            <Icon size={16} aria-hidden /> {texto}
          </span>
        )}
      </div>
    </div>
  )
}
