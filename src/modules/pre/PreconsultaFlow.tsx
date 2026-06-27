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
import { DeterminantesStep } from './steps/DeterminantesStep'
import { EstudiosStep } from './steps/EstudiosStep'
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

// Bloques del chequeo, para micro-logros y progreso cálido.
const BLOQUE: Record<string, string> = {
  modo: 'vos',
  demografia: 'vos',
  prevencion: 'salud',
  factores: 'salud',
  determinantes: 'entorno',
  estudios: 'salud',
  cqc: 'chequeo',
  gds: 'chequeo',
  tadlq: 'chequeo',
  isi: 'chequeo',
  mind: 'chequeo',
  ad8: 'chequeo',
  iqcode: 'chequeo',
  faq: 'chequeo',
  ipaq: 'chequeo',
  auditc: 'chequeo',
  frail: 'chequeo',
  mnasf: 'chequeo',
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

// DESEABLES en ORDEN DE RELEVANCIA — se ofrecen DESPUÉS del resultado (opt-in, sin saturar).
function deseables(modo: string | undefined): Step[] {
  if (modo === 'cuidador')
    return [
      { id: 'ad8', inst: 'ad8' },
      { id: 'iqcode', inst: 'iqcode' },
      { id: 'faq', inst: 'faq' },
      { id: 'determinantes', Component: DeterminantesStep },
      { id: 'estudios', Component: EstudiosStep },
      { id: 'medicacion', Component: MedicacionStep },
    ]
  return [
    { id: 'cqc', inst: 'cqc' },
    { id: 'gds', inst: 'gds' },
    { id: 'tadlq', inst: 'tadlq' },
    { id: 'determinantes', Component: DeterminantesStep },
    { id: 'estudios', Component: EstudiosStep },
    { id: 'medicacion', Component: MedicacionStep },
    { id: 'factores', Component: FactoresStep },
    { id: 'isi', inst: 'isi' },
    { id: 'auditc', inst: 'auditc' },
    { id: 'ipaq', Component: IpaqStep },
    { id: 'mind', inst: 'mind' },
    { id: 'frail', inst: 'frail' },
    { id: 'mnasf', inst: 'mnasf' },
  ]
}

// OBLIGATORIO mínimo = demografía + Lancet (cubre el MRCA-7) + banderas (seguridad) →
// RESULTADO → y recién ahí los deseables, en orden de relevancia (no se fuerzan).
function buildSteps(modo: string | undefined, askModo: boolean): Step[] {
  const steps: Step[] = []
  if (askModo) steps.push({ id: 'modo', Component: ModoStep })
  steps.push(
    { id: 'demografia', Component: DemografiaStep },
    { id: 'prevencion', Component: PrevencionStep },
    { id: 'banderas', Component: BanderasRojasStep },
    { id: 'resultado', Component: ResultadoStep },
    ...deseables(modo),
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
  // Hub: al entrar mostramos un MENÚ de qué completar + ver informe (no caemos en el
  // "vómito" del resultado). En captura nueva (?nuevo=1) vamos derecho al paso.
  const [vista, setVista] = useState<'menu' | 'paso'>(() => (params.get('nuevo') === '1' ? 'paso' : 'menu'))
  const dDemo = usePreconsulta((s) => s.demo)
  const dLancet = usePreconsulta((s) => s.lancet)
  const dInst = usePreconsulta((s) => s.instruments)
  const dSdoh = usePreconsulta((s) => s.sdoh)
  const dCud = usePreconsulta((s) => s.cud)
  const dEstudios = usePreconsulta((s) => s.estudios)
  const dMeds = usePreconsulta((s) => s.meds)
  const dFactores = usePreconsulta((s) => s.factores)

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
  // El resultado parte el flujo: antes = obligatorio (incremental); después = deseables opt-in.
  const resultadoIdx = STEPS.findIndex((s) => s.id === 'resultado')
  const enDeseables = resultadoIdx >= 0 && safeStep >= resultadoIdx
  const restantesOblig = Math.max(0, resultadoIdx - safeStep)
  const finalizar = () => navigate(`/p/${profileId ?? 'paciente'}`)

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
  const irAPaso = (i: number) => { setStep(i); setVista('paso'); window.scrollTo({ top: 0 }) }

  // ── MENÚ (hub): qué completar + ver informe ──────────────────────────────────────────
  const hecho = (s: Step): boolean => {
    if (s.inst) return !!dInst[s.inst] && Object.keys(dInst[s.inst]).length > 0
    switch (s.id) {
      case 'demografia': return dDemo.edad != null
      case 'prevencion': return Object.keys(dLancet).length > 0
      case 'determinantes': return Object.keys(dSdoh).length > 0 || Object.keys(dCud).length > 0
      case 'estudios': return Object.keys(dEstudios).length > 0
      case 'medicacion': return dMeds.length > 0
      case 'factores': return Object.keys(dFactores).length > 0
      default: return false
    }
  }
  if (vista === 'menu') {
    const secciones = STEPS.map((s, i) => ({ s, i })).filter(({ s }) => s.id !== 'modo' && s.id !== 'resultado')
    const tieneAlgo = secciones.some(({ s }) => hecho(s))
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <button onClick={finalizar} className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> {t('common.back')}</button>
        <h1 className="font-serif text-2xl text-ink sm:text-3xl">¿Qué querés completar{dDemo.alias ? ` de ${dDemo.alias}` : ''}?</h1>
        <p className="mt-1 text-muted">Tocá lo que quieras cargar. No hace falta todo de una.</p>

        {tieneAlgo && resultadoIdx >= 0 && (
          <button onClick={() => irAPaso(resultadoIdx)} className="mt-5 flex w-full items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-4 text-white">
            <span className="font-medium">Ver informe / resultado</span> <ArrowRight size={20} />
          </button>
        )}

        <ul className="mt-4 space-y-2">
          {secciones.map(({ s, i }) => {
            const ok = hecho(s)
            return (
              <li key={s.id}>
                <button onClick={() => irAPaso(i)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3.5 text-left hover:border-secondary">
                  <span className="text-ink">{t(`preconsulta.steps.${s.id}`, { defaultValue: s.inst ?? s.id })}</span>
                  <span className={'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ' + (ok ? 'border border-verde bg-verde/10 text-verde-text' : 'bg-secondary/10 text-secondary')}>
                    {ok ? '✓ Cargado' : 'Sumar'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <button onClick={empezarDeNuevo} className="mt-5 text-sm text-muted underline">{t('preconsulta.empezarDeNuevo')}</button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-28">
      {/* Barra SOLO de lo obligatorio (hasta el resultado): corta y motivante. Los deseables
          van después y no se cuentan acá (evita la barra larguísima). */}
      {(() => {
        const totalBar = resultadoIdx >= 0 ? resultadoIdx + 1 : STEPS.length
        const fillBar = Math.min(safeStep, totalBar - 1) + 1
        return (
          <div className="mb-3 flex items-center gap-1.5 no-print" role="progressbar" aria-valuenow={fillBar} aria-valuemin={1} aria-valuemax={totalBar} aria-label={t(`preconsulta.steps.${entry.id}`)}>
            {Array.from({ length: totalBar }, (_, i) => (
              <div key={i} className={'h-2 flex-1 rounded-full ' + (i < fillBar ? 'bg-secondary' : 'bg-line')} />
            ))}
          </div>
        )
      })()}
      <div className="mb-4 flex items-center justify-between gap-2 no-print">
        <p className="text-sm text-muted">
          {enDeseables ? t('preconsulta.opcionalSumar') : t('preconsulta.faltaPoco', { n: restantesOblig })}
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
            onClick={() => { setVista('menu'); window.scrollTo({ top: 0 }) }}
            className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-ink"
          >
            <ArrowLeft size={18} /> Menú
          </button>
          <div className="ml-auto flex items-center gap-2">
            {!isLast && (
              <button
                onClick={() => go(safeStep + 1)}
                className={
                  'inline-flex items-center gap-1 rounded-xl px-5 py-2.5 font-medium ' +
                  (enDeseables ? 'border border-line bg-surface text-ink' : 'bg-primary text-white')
                }
              >
                {enDeseables ? t('preconsulta.sumarMas') : t('common.next')} <ArrowRight size={18} />
              </button>
            )}
            {enDeseables && (
              <button
                onClick={finalizar}
                className="inline-flex items-center gap-1 rounded-xl bg-primary px-5 py-2.5 font-medium text-white"
              >
                <Check size={18} /> {t('preconsulta.finish')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
