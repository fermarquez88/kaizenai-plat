import { useTranslation } from 'react-i18next'
import { MRCA_ITEMS } from '../../../scoring/mrca'
import { usePreconsulta } from '../preconsultaStore'

export function MrcaStep() {
  const { t } = useTranslation()
  const mrca = usePreconsulta((s) => s.mrca)
  const setMrca = usePreconsulta((s) => s.setMrca)

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">{t('pre.mrca.title')}</h1>
      <p className="mt-2 text-muted">{t('pre.mrca.intro')}</p>
      <ul className="mt-5 space-y-3">
        {MRCA_ITEMS.map((id) => (
          <li key={id} className="rounded-xl border border-line bg-surface p-4">
            <p className="text-ink">{t(`pre.mrca.items.${id}`)}</p>
            <div className="mt-3 flex gap-2" role="group" aria-label={t(`pre.mrca.items.${id}`)}>
              {([1, 0] as const).map((v) => {
                const selected = mrca[id] === v
                return (
                  <button
                    key={v}
                    onClick={() => setMrca(id, v)}
                    aria-pressed={selected}
                    className={
                      'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ' +
                      (selected
                        ? 'border-secondary bg-secondary text-white'
                        : 'border-line bg-bg text-ink hover:border-secondary')
                    }
                  >
                    {t(v === 1 ? 'pre.prevencion.answer.si' : 'pre.prevencion.answer.no')}
                  </button>
                )
              })}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">{t('pre.mrca.note')}</p>
    </div>
  )
}
