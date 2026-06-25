import { useTranslation } from 'react-i18next'
import { MODULES, type Dominio, type ModuleTier, type Role } from './moduleRegistry'

// HUB del perfil modular: mapa de lo que cubre el perfil de salud cerebral, organizado por
// DOMINIO OMS. Muestra cada módulo con su tier (obligatorio/deseable/posterior) y quién lo
// completa (rol = vista). Vista estructural (no requiere datos de una persona).
const TIER_STYLE: Record<ModuleTier, string> = {
  obligatorio: 'border-primary bg-primary/10 text-primary-text',
  deseable: 'border-secondary bg-secondary/10 text-secondary-text',
  posterior: 'border-line bg-bg text-muted',
  aparte: 'border-line bg-bg text-muted',
}

// Orden de dominios para la vista (esqueleto OMS + capas).
const ORDEN: Dominio[] = [
  'identidad', 'gate', 'cognitivo', 'socioemocional', 'conductual', 'sensorial', 'motor',
  'saludFisica', 'habitos', 'sueno', 'determinantesSociales', 'medico', 'cuidador', 'sintesis',
]

export function PerfilHub() {
  const { t } = useTranslation()
  const grupos = ORDEN.map((dom) => ({ dom, mods: MODULES.filter((m) => m.dominio === dom) })).filter(
    (g) => g.mods.length > 0,
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-serif text-2xl text-ink sm:text-3xl">{t('perfil.title')}</h1>
      <p className="mt-1 text-muted">{t('perfil.intro')}</p>

      <div className="mt-6 space-y-6">
        {grupos.map(({ dom, mods }) => (
          <section key={dom}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t(`perfil.dominio.${dom}`)}</h2>
            <ul className="mt-2 space-y-2">
              {mods.map((m) => (
                <li key={m.id} className="rounded-xl border border-line bg-surface p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-ink">{m.nombre}</p>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${TIER_STYLE[m.tier]}`}>
                      {t(`perfil.tier.${m.tier}`)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{t('perfil.completa', { rol: t(`perfil.rol.${m.ownerRole as Role}`) })}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted">{t('perfil.nota')}</p>
    </div>
  )
}
