import { useTranslation } from 'react-i18next'
import { FACTOR_QUESTIONS } from '../harmonizedFactores'
import { usePreconsulta } from '../preconsultaStore'

const btn = (sel: boolean) =>
  'rounded-lg border px-3 py-2.5 text-sm font-medium transition ' +
  (sel ? 'border-secondary bg-secondary text-white' : 'border-line bg-bg text-ink hover:border-secondary')

export function FactoresStep() {
  const { t } = useTranslation()
  const factores = usePreconsulta((s) => s.factores)
  const setFactor = usePreconsulta((s) => s.setFactor)

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">{t('pre.factores.title')}</h1>
      <p className="mt-2 text-muted">{t('pre.factores.intro')}</p>
      <ul className="mt-5 space-y-3">
        {FACTOR_QUESTIONS.map((q) => {
          const val = factores[q.id]
          return (
            <li key={q.id} className="rounded-xl border border-line bg-surface p-4">
              <p className="text-ink">
                {q.text}
                {q.unit ? ` (${q.unit})` : ''}
              </p>

              {q.type === 'number' && (
                <input
                  type="number"
                  inputMode="numeric"
                  value={(val as number | undefined) ?? ''}
                  onChange={(e) => setFactor(q.id, e.target.value ? Number(e.target.value) : undefined)}
                  className="mt-2 w-32 rounded-xl border border-line bg-bg px-3 py-2 text-ink focus:border-secondary"
                />
              )}

              {q.type === 'boolean' && (
                <div className="mt-2 flex gap-2">
                  {([['si', true], ['no', false]] as const).map(([lbl, bv]) => (
                    <button
                      key={lbl}
                      onClick={() => setFactor(q.id, bv)}
                      aria-pressed={val === bv}
                      className={btn(val === bv)}
                    >
                      {t(lbl === 'si' ? 'pre.prevencion.answer.si' : 'pre.prevencion.answer.no')}
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'choice' && q.options && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {q.options.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => setFactor(q.id, o.value)}
                      aria-pressed={val === o.value}
                      className={btn(val === o.value)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
