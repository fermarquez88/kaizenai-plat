import { useTranslation } from 'react-i18next'
import { usePreconsulta } from '../preconsultaStore'
import type { Modo } from '../../../data/preconsultaSummary'

const MODOS: Modo[] = ['persona', 'cuidador', 'agente']

export function ModoStep() {
  const { t } = useTranslation()
  const modo = usePreconsulta((s) => s.demo.modo)
  const setDemo = usePreconsulta((s) => s.setDemo)

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">{t('pre.modo.title')}</h1>
      <p className="mt-2 text-muted">{t('pre.modo.intro')}</p>
      <div className="mt-5 space-y-3">
        {MODOS.map((m) => (
          <button
            key={m}
            onClick={() => setDemo({ modo: m })}
            aria-pressed={modo === m}
            className={
              'flex w-full items-center rounded-xl border p-4 text-left transition ' +
              (modo === m
                ? 'border-secondary bg-secondary/10'
                : 'border-line bg-surface hover:border-secondary')
            }
          >
            <span className="font-medium text-ink">{t(`pre.modo.${m}`)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
