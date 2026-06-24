import { useTranslation } from 'react-i18next'
import { LANCET_FACTORS, type FactorAnswer } from '../../../scoring/lancet'
import { usePreconsulta } from '../preconsultaStore'

const OPTIONS: FactorAnswer[] = ['si', 'no', 'nose']

export function PrevencionStep() {
  const { t } = useTranslation()
  const lancet = usePreconsulta((s) => s.lancet)
  const setLancet = usePreconsulta((s) => s.setLancet)

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">{t('pre.prevencion.title')}</h1>
      <p className="mt-2 text-muted">{t('pre.prevencion.intro')}</p>
      <ul className="mt-5 space-y-3">
        {LANCET_FACTORS.map((f) => (
          <li key={f.id} className="rounded-xl border border-line bg-surface p-4">
            <p className="font-medium text-ink">{t(`factors.${f.id}.label`)}</p>
            <p className="mt-1 text-sm text-muted">{t(`factors.${f.id}.question`)}</p>
            <div className="mt-3 flex gap-2" role="group" aria-label={t(`factors.${f.id}.label`)}>
              {OPTIONS.map((opt) => {
                const selected = lancet[f.id] === opt
                return (
                  <button
                    key={opt}
                    onClick={() => setLancet(f.id, opt)}
                    aria-pressed={selected}
                    className={
                      'flex-1 rounded-lg border px-4 py-3 text-base font-medium transition ' +
                      (selected
                        ? 'border-secondary bg-secondary text-white'
                        : 'border-line bg-bg text-ink hover:border-secondary')
                    }
                  >
                    {t(`pre.prevencion.answer.${opt}`)}
                  </button>
                )
              })}
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-secondary-text">
                {t('pre.prevencion.whatToDo')}
              </summary>
              <p className="mt-1 text-sm text-muted">{t(`factors.${f.id}.advice`)}</p>
            </details>
          </li>
        ))}
      </ul>
    </div>
  )
}
