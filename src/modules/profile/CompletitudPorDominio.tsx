import { useTranslation } from 'react-i18next'
import type { CompletenessResult } from '../../scoring/domainCompleteness'

// Medidor de completitud del perfil organizado por DOMINIOS de salud cerebral.
// Barra total + barra por dominio + obligatorios (Lancet 14 · MRCA 7 ítems). Reutilizable
// (informe, HUB del perfil). Solo presentación; recibe el resultado ya calculado.
function Bar({ pct }: { pct: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-line" aria-hidden>
      <div className="h-full rounded-full bg-secondary" style={{ width: `${Math.round(pct * 100)}%` }} />
    </div>
  )
}

export function CompletitudPorDominio({ result }: { result: CompletenessResult }) {
  const { t } = useTranslation()
  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t('completitud.title')}</h2>
        <span className="font-serif text-xl text-ink">{Math.round(result.total.pct * 100)}%</span>
      </div>
      <div className="mt-2">
        <Bar pct={result.total.pct} />
      </div>

      <ul className="mt-4 space-y-3">
        {result.domains.map((d) => (
          <li key={d.id}>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="text-ink">{t(`completitud.dominio.${d.id}`)}</span>
              <span className="text-muted">
                {d.started ? `${Math.round(d.pct * 100)}%` : t('completitud.sinIniciar')}
              </span>
            </div>
            <div className="mt-1">
              <Bar pct={d.pct} />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-line bg-bg px-2.5 py-1 text-ink">
          {t('completitud.lancet', { a: result.lancet.answered, total: result.lancet.total })}
        </span>
        <span className="rounded-full border border-line bg-bg px-2.5 py-1 text-ink">
          {t('completitud.mrca', { a: result.mrca.answered, total: result.mrca.total })}
        </span>
      </div>
    </section>
  )
}
