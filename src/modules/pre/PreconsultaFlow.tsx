import { useEffect, useState, type ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { usePreconsulta } from './preconsultaStore'
import { useSettings } from '../../lib/store'
import { ConsentScreen } from '../gov/ConsentScreen'
import { DemografiaStep } from './steps/DemografiaStep'
import { PrevencionStep } from './steps/PrevencionStep'
import { InstrumentStep } from './steps/InstrumentStep'
import { MedicacionStep } from './steps/MedicacionStep'
import { BanderasRojasStep } from './steps/BanderasRojasStep'
import { ResultadoStep } from './steps/ResultadoStep'

interface Step {
  id: string
  Component?: ComponentType
  inst?: string
}

const STEPS: Step[] = [
  { id: 'demografia', Component: DemografiaStep },
  { id: 'prevencion', Component: PrevencionStep },
  { id: 'cqc', inst: 'cqc' },
  { id: 'gds', inst: 'gds' },
  { id: 'tadlq', inst: 'tadlq' },
  { id: 'ad8', inst: 'ad8' },
  { id: 'medicacion', Component: MedicacionStep },
  { id: 'banderas', Component: BanderasRojasStep },
  { id: 'resultado', Component: ResultadoStep },
]

export function PreconsultaFlow() {
  const { t } = useTranslation()
  const reset = usePreconsulta((s) => s.reset)
  const consent = useSettings((s) => s.consentAccepted)
  const setConsent = useSettings((s) => s.setConsent)
  const [step, setStep] = useState(0)

  // Empieza limpio cada vez que se entra al flujo.
  useEffect(() => {
    reset()
  }, [reset])

  // Consentimiento antes de cualquier captura.
  if (!consent) return <ConsentScreen onAccept={() => setConsent(true)} />

  const entry = STEPS[step]
  const isLast = step === STEPS.length - 1
  const Current = entry.Component

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-28">
      <div className="mb-3 flex items-center gap-1.5 no-print">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={'h-1.5 flex-1 rounded-full ' + (i <= step ? 'bg-secondary' : 'bg-line')}
          />
        ))}
      </div>
      <p className="mb-4 text-sm text-muted no-print">
        {t('preconsulta.stepLabel', {
          current: step + 1,
          total: STEPS.length,
          name: t(`preconsulta.steps.${entry.id}`),
        })}
      </p>

      {entry.inst ? <InstrumentStep id={entry.inst} /> : Current ? <Current /> : null}

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-bg/90 backdrop-blur no-print">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-ink disabled:opacity-40"
          >
            <ArrowLeft size={18} /> {t('common.prev')}
          </button>
          {!isLast && (
            <button
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="ml-auto inline-flex items-center gap-1 rounded-xl bg-primary px-5 py-2.5 font-medium text-white"
            >
              {t('common.next')} <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
