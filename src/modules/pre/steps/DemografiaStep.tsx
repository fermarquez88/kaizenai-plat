import { useTranslation } from 'react-i18next'
import { usePreconsulta } from '../preconsultaStore'
import { DEPTOS } from '../../../data/sanjuan'
import type { Cerca, Vive } from '../../../scoring/equity'

const SEXOS = ['Mujer', 'Hombre'] as const
const VIVE: Vive[] = ['campo', 'pueblo', 'ciudad']
const CERCA: { value: Cerca; key: string }[] = [
  { value: '<15', key: 'lt15' },
  { value: '15-30', key: 'm15' },
  { value: '30-60', key: 'm30' },
  { value: '>60', key: 'gt60' },
  { value: 'nose', key: 'nose' },
]

const btn = (sel: boolean) =>
  'rounded-lg border px-3 py-2 text-sm font-medium transition ' +
  (sel ? 'border-secondary bg-secondary text-white' : 'border-line bg-bg text-ink hover:border-secondary')

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
            {SEXOS.map((sx) => (
              <button
                key={sx}
                onClick={() => setDemo({ sexo: sx })}
                aria-pressed={demo.sexo === sx}
                className={btn(demo.sexo === sx)}
              >
                {t(`pre.demografia.sexo_${sx === 'Mujer' ? 'mujer' : 'hombre'}`)}
              </button>
            ))}
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

        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="depto">
            {t('pre.demografia.deptoLabel')}
          </label>
          <select
            id="depto"
            value={demo.depto ?? ''}
            onChange={(e) => setDemo({ depto: e.target.value || undefined })}
            className="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink focus:border-secondary"
          >
            <option value="">{t('pre.demografia.deptoPlaceholder')}</option>
            {DEPTOS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="block text-sm font-medium text-ink">{t('pre.demografia.viveLabel')}</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {VIVE.map((vv) => (
              <button
                key={vv}
                onClick={() => setDemo({ vive: vv })}
                aria-pressed={demo.vive === vv}
                className={btn(demo.vive === vv)}
              >
                {t(`pre.demografia.vive_${vv}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium text-ink">{t('pre.demografia.cercaLabel')}</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {CERCA.map((c) => (
              <button
                key={c.key}
                onClick={() => setDemo({ cerca: c.value })}
                aria-pressed={demo.cerca === c.value}
                className={btn(demo.cerca === c.value)}
              >
                {t(`pre.demografia.cerca_${c.key}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
