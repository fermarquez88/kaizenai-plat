import { useEffect, useRef, useState, type ComponentType } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react'
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
import { IpaqStep } from './steps/IpaqStep'
import { ResultadoStep } from './steps/ResultadoStep'

interface Step {
  id: string
  Component?: ComponentType
  inst?: string
}

// La persona y el agente usan instrumentos AUTORREPORTADOS; el cuidador, de INFORMANTE.
const SELF = ['cqc', 'gds', 'tadlq', 'isi', 'mind']
const INFORMANT = ['ad8', 'iqcode', 'faq']

// Bloques del chequeo, para micro-logros y progreso cálido.
const BLOQUE: Record<string, string> = {
  modo: 'vos',
  demografia: 'vos',
  prevencion: 'salud',
  factores: 'salud',
  cqc: 'chequeo',
  gds: 'chequeo',
  tadlq: 'chequeo',
  isi: 'chequeo',
  mind: 'chequeo',
  ad8: 'chequeo',
  iqcode: 'chequeo',
  faq: 'chequeo',
  ipaq: 'chequeo',
  medicacion: 'medicacion',
  banderas: 'senales',
  resultado: 'resultado',
}

// El PERFIL ya dijo quién es: derivamos el modo y NO lo volvemos a preguntar.
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
    // Actividad física (IPAQ): autorreporte numérico, no informante.
    ...(modo !== 'cuidador' ? [{ id: 'ipaq', Component: IpaqStep }] : []),
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
  const [params] = useSearchParams()
  const reset = usePreconsulta((s) => s.reset)
  const setDemo = usePreconsulta((s) => s.setDemo)
  const storedModo = usePreconsulta((s) => s.demo.modo)
  const step = usePreconsulta((s) => s.step)
  const setStep = usePreconsulta((s) => s.setStep)
  const consent = useSettings((s) => s.consentAccepted)
  const setConsent = useSettings((s) => s.setConsent)
  const [victoria, setVictoria] = useState<string | null>(null)

  // Guardar-y-retomar: SOLO reseteamos si se pidió empezar de nuevo (?nuevo=1).
  // Si no, retomamos donde quedó (el store está persistido).
  useEffect(() => {
    if (params.get('nuevo') === '1') {
      reset()
      const m = modoFromProfile(profileId)
      if (m) setDemo({ modo: m })
      setStep(0)
    } else {
      const m = modoFromProfile(profileId)
      if (m && !storedModo) setDemo({ modo: m })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId])

  // Consentimiento antes de cualquier captura.
  if (!consent) return <ConsentScreen onAccept={() => setConsent(true)} />

  const profileModo = modoFromProfile(profileId)
  const askModo = !profileModo
  const STEPS = buildSteps(profileModo ?? storedModo, askModo)
  const safeStep = Math.min(Math.max(0, step), STEPS.length - 1)
  const entry = STEPS[safeStep]
  const isLast = safeStep === STEPS.length - 1
  const Current = entry.Component
  const restantes = STEPS.length - 1 - safeStep

  const empezarDeNuevo = () => {
    reset()
    const m = modoFromProfile(profileId)
    if (m) setDemo({ modo: m })
    setStep(0)
  }

  const go = (next: number) => {
    const target = Math.min(Math.max(0, next), STEPS.length - 1)
    // Micro-logro al CERRAR un bloque (solo avanzando).
    if (target > safeStep) {
      const bPrev = BLOQUE[STEPS[safeStep].id]
      const bNext = BLOQUE[STEPS[target].id]
      if (bPrev && bNext && bPrev !== bNext) {
        setVictoria(bPrev)
        window.setTimeout(() => setVictoria(null), 2200)
      }
    }
    setStep(target)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-28">
      <div
        className="mb-3 flex items-center gap-1.5 no-print"
        role="progressbar"
        aria-valuenow={safeStep + 1}
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-label={t(`preconsulta.steps.${entry.id}`)}
      >
        {STEPS.map((s, i) => (
          <div key={s.id} className={'h-2 flex-1 rounded-full ' + (i <= safeStep ? 'bg-secondary' : 'bg-line')} />
        ))}
      </div>
      <div className="mb-4 flex items-center justify-between gap-2 no-print">
        <p className="text-sm text-muted">
          {restantes > 0 ? t('preconsulta.faltaPoco', { n: restantes }) : t('preconsulta.ultimoPaso')}
        </p>
        <button onClick={empezarDeNuevo} className="text-xs text-muted underline">
          {t('preconsulta.empezarDeNuevo')}
        </button>
      </div>

      {victoria && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-verde bg-verde/10 px-3 py-1.5 text-sm text-verde-text">
          <Sparkles size={16} />
          {t(`preconsulta.microVictoria.${victoria}`, { defaultValue: t('preconsulta.microVictoriaGen') })}
        </div>
      )}

      {entry.inst ? <InstrumentStep id={entry.inst} /> : Current ? <Current /> : null}

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-bg/90 backdrop-blur no-print">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => go(safeStep - 1)}
            disabled={safeStep === 0}
            className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-ink disabled:opacity-40"
          >
            <ArrowLeft size={18} /> {t('common.prev')}
          </button>
          {!isLast ? (
            <button
              onClick={() => go(safeStep + 1)}
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
