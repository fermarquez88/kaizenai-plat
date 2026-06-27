import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check, ChevronRight } from 'lucide-react'
import { usePreconsulta } from '../pre/preconsultaStore'
import { MODULES, type ModuleTier } from './moduleRegistry'
import { computeModuleStatus, resumenObligatorios, type ModuloEstado } from './moduleStatus'

// HUB del perfil modular VIVO: el chooser "elegir qué completar". Agrupa los módulos por
// tier (de obligatorio a deseable a capa clínica), muestra el ESTADO de cada uno y ofrece
// completarlo. Lee el store de preconsulta para el estado real.
const TIERS: ModuleTier[] = ['obligatorio', 'deseable', 'posterior', 'aparte']
const ESTADO_CHIP: Record<ModuloEstado, string> = {
  hecho: 'border-verde bg-verde/10 text-verde-text',
  empezado: 'border-amarillo bg-amarillo/10 text-ink',
  pendiente: 'border-line bg-bg text-muted',
  otraCapa: 'border-line bg-bg text-muted',
}

function Bar({ pct }: { pct: number }) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-line" aria-hidden>
      <div className="h-full rounded-full bg-secondary" style={{ width: `${Math.round(pct * 100)}%` }} />
    </div>
  )
}

export function PerfilHub() {
  const { t } = useTranslation()
  const demo = usePreconsulta((s) => s.demo)
  const lancet = usePreconsulta((s) => s.lancet)
  const instruments = usePreconsulta((s) => s.instruments)
  const status = useMemo(
    () => computeModuleStatus({ demo, lancet: lancet as Record<string, string | undefined>, instruments }),
    [demo, lancet, instruments],
  )
  const resumen = resumenObligatorios(status)

  const grupos = TIERS.map((tier) => ({
    tier,
    mods: MODULES.filter((m) => m.tier === tier).sort((a, b) => b.weight - a.weight),
  })).filter((g) => g.mods.length > 0)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-serif text-2xl text-ink sm:text-3xl">{t('perfil.title')}</h1>
      <p className="mt-1 text-muted">{t('perfil.intro')}</p>

      <section className="mt-4 rounded-2xl border border-line bg-surface p-4">
        <p className="text-sm text-ink">{t('perfil.resumen', { h: resumen.hechos, total: resumen.total })}</p>
        <div className="mt-2">
          <Bar pct={resumen.total ? resumen.hechos / resumen.total : 0} />
        </div>
      </section>

      <div className="mt-6 space-y-6">
        {grupos.map(({ tier, mods }) => (
          <section key={tier}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t(`perfil.tier.${tier}`)}</h2>
            <ul className="mt-2 space-y-2">
              {mods.map((m) => {
                const st = status[m.id]
                const self = m.ownerRole === 'persona'
                const completable = self && (st.estado === 'pendiente' || st.estado === 'empezado')
                return (
                  <li key={m.id} className="rounded-xl border border-line bg-surface p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-ink">{m.nombre}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {self ? t('perfil.completaVos') : t('perfil.loCarga', { rol: t(`perfil.rol.${m.ownerRole}`) })}
                        </p>
                      </div>
                      <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${ESTADO_CHIP[st.estado]}`}>
                        {st.estado === 'hecho' && <Check size={12} />}
                        {t(`perfil.estado.${st.estado}`)}
                      </span>
                    </div>
                    {completable && (
                      <Link
                        to="/p/paciente/preconsulta"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-secondary"
                      >
                        {t('perfil.completar')} <ChevronRight size={15} />
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted">{t('perfil.nota')}</p>
    </div>
  )
}
