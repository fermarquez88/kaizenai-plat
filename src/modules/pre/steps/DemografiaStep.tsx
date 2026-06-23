import { useTranslation } from 'react-i18next'
import { usePreconsulta } from '../preconsultaStore'

const SEXOS = ['Mujer', 'Hombre'] as const

export function DemografiaStep() {
  const { t } = useTranslation()
  const demo = usePreconsulta((s) => s.demo)
  const setDemo = usePreconsulta((s) => s.setDemo)

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">{t('pre.demografia.title')}</h1>
      <p className="mt-2 text-muted">{t('pre.demografia.intro')}</p>

      <div className="mt-5 space-y-5">
        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="edad">
            {t('pre.demografia.edad')}
          </label>
          <input
            id="edad"
            type="number"
            inputMode="numeric"
            min={40}
            max={110}
            value={demo.edad ?? ''}
            onChange={(e) => setDemo({ edad: e.target.value ? Number(e.target.value) : undefined })}
            className="mt-1 w-32 rounded-xl border border-line bg-surface px-4 py-3 text-ink focus:border-secondary"
          />
        </div>

        <div>
          <span className="block text-sm font-medium text-ink">{t('pre.demografia.sexoLabel')}</span>
          <div className="mt-2 flex gap-2">
            {SEXOS.map((sx) => {
              const sel = demo.sexo === sx
              return (
                <button
                  key={sx}
                  onClick={() => setDemo({ sexo: sx })}
                  aria-pressed={sel}
                  className={
                    'rounded-lg border px-4 py-2 text-sm font-medium transition ' +
                    (sel
                      ? 'border-secondary bg-secondary text-white'
                      : 'border-line bg-bg text-ink hover:border-secondary')
                  }
                >
                  {t(`pre.demografia.sexo_${sx === 'Mujer' ? 'mujer' : 'hombre'}`)}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="edu">
            {t('pre.demografia.eduLabel')}
          </label>
          <input
            id="edu"
            type="number"
            inputMode="numeric"
            min={0}
            max={25}
            value={demo.edu_anios ?? ''}
            onChange={(e) =>
              setDemo({ edu_anios: e.target.value ? Number(e.target.value) : undefined })
            }
            className="mt-1 w-32 rounded-xl border border-line bg-surface px-4 py-3 text-ink focus:border-secondary"
          />
          <p className="mt-1 text-sm text-muted">{t('pre.demografia.eduHint')}</p>
        </div>
      </div>
    </div>
  )
}
