import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Pill, Plus, X } from 'lucide-react'
import { DRUG_CATALOG, computeMedFlags } from '../../../scoring/medications'
import { usePreconsulta } from '../preconsultaStore'

export function MedicacionStep() {
  const { t } = useTranslation()
  const meds = usePreconsulta((s) => s.meds)
  const addMed = usePreconsulta((s) => s.addMed)
  const removeMed = usePreconsulta((s) => s.removeMed)
  const [q, setQ] = useState('')

  const flags = computeMedFlags(meds)
  const results =
    q.trim().length >= 2
      ? DRUG_CATALOG.filter(
          (d) =>
            d.name.toLowerCase().includes(q.trim().toLowerCase()) && !meds.some((m) => m.id === d.id),
        ).slice(0, 6)
      : []

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">{t('pre.medicacion.title')}</h1>
      <p className="mt-2 text-muted">{t('pre.medicacion.intro')}</p>

      <div className="mt-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('pre.medicacion.search')}
          className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink placeholder:text-muted focus:border-secondary"
        />
        {results.length > 0 && (
          <ul className="mt-1 overflow-hidden rounded-xl border border-line bg-surface">
            {results.map((d) => (
              <li key={d.id}>
                <button
                  onClick={() => {
                    addMed(d)
                    setQ('')
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-bg"
                >
                  <Plus size={16} className="text-secondary" />
                  <span className="text-ink">{d.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ul className="mt-4 space-y-2">
        {meds.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-2.5"
          >
            <span className="flex items-center gap-2 text-ink">
              <Pill size={16} className="text-muted" /> {m.name}
            </span>
            <button
              onClick={() => removeMed(m.id)}
              aria-label={t('common.remove')}
              className="text-muted hover:text-rojo-text"
            >
              <X size={18} />
            </button>
          </li>
        ))}
        {meds.length === 0 && <li className="text-sm text-muted">{t('pre.medicacion.empty')}</li>}
      </ul>

      {meds.length > 0 && (
        <div className="mt-5 space-y-2">
          {flags.polypharmacy && <MedFlag text={t('pre.medicacion.flags.poly', { n: flags.count })} />}
          {flags.acbHigh && <MedFlag text={t('pre.medicacion.flags.acb', { n: flags.acbTotal })} />}
          {flags.bzdCount > 0 && <MedFlag text={t('pre.medicacion.flags.bzd', { n: flags.bzdCount })} />}
          {flags.beersCount > 0 && (
            <MedFlag text={t('pre.medicacion.flags.beers', { n: flags.beersCount })} />
          )}
          {!flags.anyConcern && (
            <p className="text-sm text-verde-text">{t('pre.medicacion.flags.none')}</p>
          )}
          <p className="pt-1 text-xs text-muted">{t('pre.medicacion.disclaimer')}</p>
        </div>
      )}
    </div>
  )
}

function MedFlag({ text }: { text: string }) {
  return (
    <p className="flex items-start gap-2 rounded-xl border border-amarillo bg-amarillo/10 p-3 text-sm text-ink">
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-accent-text" /> {text}
    </p>
  )
}
