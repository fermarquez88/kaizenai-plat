import { useEffect, useState, type ComponentType } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { usePreconsulta } from './preconsultaStore'
import { useSettings } from '../../lib/store'
import { ConsentScreen } from '../gov/ConsentScreen'
import { ModoStep } from './steps/ModoStep'
import { DemografiaStep } from './steps/DemografiaStep'
import { PrevencionStep } from './steps/PrevencionStep'
import { FactoresStep } from './steps/FactoresStep'
import { InstrumentStep } from './steps/InstrumentStep'
import { MedicacionStep } from './steps/MedicacionStep'
import { BanderasRojasStep } from './steps/BanderasRojasStep'
import { ResultadoStep } from './steps/ResultadoStep'

interface Step {
  id: string
  Component?: ComponentType
  inst?: string
}

// La persona y el agente usan instrumentos AUTORREPORTADOS; el cuidador, de INFORMANTE.
const SELF = ['cqc', 'gds', 'tadlq']
const INFORMANT = ['ad8', 'iqcode', 'faq']

// El PERFIL ya dijo quién es: derivamos el modo y NO lo volvemos a preguntar.
// Sólo el agente (perfil sin modo fijo) elige "¿quién responde?" en el flujo.
function modoFromProfile(profileId?: string): 'persona' | 'cuidador' | undefined {
  if (profileId === 'paciente') return 'persona'
  if (profileId === 'cuidador') return 'cuidador'
  return undefined
}

function buildSteps(modo: string | undefined, askModo: boolean): Step[] {
  const inst = modo === 'cuidador' ? INFORMANT : SELF
  const steps: Step[] = []
  if (askModo) steps.push({ id: 'modo', Component: ModoStep })
  steps.push(
    { id: 'demografia', Component: DemografiaStep },
    { id: 'prevencion', Component: PrevencionStep },
    { id: 'factores', Component: FactoresStep },
    ...inst.map((id) => ({ id, inst: id })),
    { id: 'medicacion', Component: MedicacionStep },
    { id: 'banderas', Component: BanderasRojasStep },
    { id: 'resultado', Component: ResultadoStep },
  )
  return steps
}

export function PreconsultaFlow() {
  const { t } = useTranslation()
  const { profileId } = useParams()
  const navigate = useNavigate()
  const reset = usePreconsulta((s) => s.reset)
  const setDemo = usePreconsulta((s) => s.setDemo)
  const modo = usePreconsulta((s) => s.demo.modo)
  const consent = useSettings((s) => s.consentAccepted)
  const setConsent = useSettings((s) => s.setConsent)
  const [step, setStep] = useState(0)

  // Empieza limpio y, si el perfil define el modo, lo setea (sin re-preguntar).
  useEffect(() => {
    reset()
    const m = modoFromProfile(profileId)
    if (m) setDemo({ modo: m })
  }, [reset, setDemo, profileId])

  // Consentimiento antes de cualquier captura.
  if (!consent) return <ConsentScreen onAccept={() => setConsent(true)} />

  const askModo = !modoFromProfile(profileId)
  const STEPS = buildSteps(modo, askModo)
  const entry = STEPS[step]
  const isLast = step === STEPS.length - 1
  const Current = entry.Component

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-28">
      <div
        className="mb-3 flex items-center gap-1.5 no-print"
        role="progressbar"
        aria-valuenow={step + 1}
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-label={t(`preconsulta.steps.${entry.id}`)}
      >
        {STEPS.map((s, i) => (
          <div key={s.id} className={'h-2 flex-1 rounded-full ' + (i <= step ? 'bg-secondary' : 'bg-line')} />
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
          {!isLast ? (
            <button
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="ml-auto inline-flex items-center gap-1 rounded-xl bg-primary px-5 py-2.5 font-medium text-white"
            >
              {t('common.next')} <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={() => navigate(`/p/${profileId ?? 'paciente'}`)}
              className="ml-auto inline-flex items-center gap-1 rounded-xl bg-primary px-5 py-2.5 font-medium text-white"
            >
              <Check size={18} /> {t('preconsulta.finish')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
