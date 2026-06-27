import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Check, Sparkles, Volume2, VolumeX } from 'lucide-react'
import { useSettings } from '../../lib/store'
import { usePreconsulta } from '../pre/preconsultaStore'
import { LANCET_FACTORS } from '../../scoring/lancet'
import { avancePerfil } from '../../scoring/avancePerfil'
import { colaPorRol, derivarAlarmas } from '../../scoring/alarmas'
import { inputFromSeed } from '../../scoring/alarmasFromSeed'
import { SEED_PERSONAS } from '../../seed/personas'
import { usePedidos } from '../red/pedidosStore'
import { Onboarding } from './Onboarding'

// EL HILO — la piel de la díada: una conversación cálida, UNA pregunta por turno (inline),
// voz que lee sola, sujeto según quién responde. Sin barra, sin tabs, sin %, sin grilla.
// Reusa las preguntas Lancet (factors.*) y los motores (avancePerfil, pedidos).
type Turn =
  | { id: 'edad'; kind: 'num' }
  | { id: 'sexo'; kind: 'sexo' }
  | { id: 'edu_anios'; kind: 'num' }
  | { id: string; kind: 'lancet' }

function speak(txt: string) {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined
  if (!synth) return
  synth.cancel()
  const u = new SpeechSynthesisUtterance(txt.slice(0, 240))
  u.lang = 'es-AR'
  u.rate = 0.95
  synth.speak(u)
}

export function Hilo() {
  const { t } = useTranslation()
  const { profileId } = useParams()
  const demo = usePreconsulta((s) => s.demo)
  const lancet = usePreconsulta((s) => s.lancet)
  const instruments = usePreconsulta((s) => s.instruments)
  const setDemo = usePreconsulta((s) => s.setDemo)
  const setLancet = usePreconsulta((s) => s.setLancet)

  const usuarioRol = useSettings((s) => s.usuarioRol)
  const setUsuarioRol = useSettings((s) => s.setUsuarioRol)
  const activePersonId = useSettings((s) => s.activePersonId)
  const personas = useSettings((s) => s.personas)
  const voiceOn = useSettings((s) => s.voiceOn)
  const setVoiceOn = useSettings((s) => s.setVoiceOn)
  const pedidosCreados = usePedidos((s) => s.pedidos)

  useEffect(() => {
    if (!usuarioRol) setUsuarioRol(profileId === 'cuidador' ? 'cuidador' : 'persona')
  }, [profileId, usuarioRol, setUsuarioRol])

  const personaActiva = activePersonId ? personas[activePersonId] : undefined
  const [num, setNum] = useState('')
  const [festejo, setFestejo] = useState<string | null>(null)
  const lastSpoken = useRef('')

  // Lista de turnos del obligatorio: demografía (3) + Lancet (14).
  const turnos: Turn[] = useMemo(
    () => [
      { id: 'edad', kind: 'num' },
      { id: 'sexo', kind: 'sexo' },
      { id: 'edu_anios', kind: 'num' },
      ...LANCET_FACTORS.map((f) => ({ id: f.id, kind: 'lancet' as const })),
    ],
    [],
  )
  const respondido = (tn: Turn) =>
    tn.kind === 'lancet' ? lancet[tn.id] != null : (demo as Record<string, unknown>)[tn.id] != null
  const idx = turnos.findIndex((tn) => !respondido(tn))
  const actual = idx >= 0 ? turnos[idx] : null
  const completo = idx < 0

  const esCuidador = usuarioRol === 'cuidador'
  const alias = personaActiva?.alias ?? ''
  // Sujeto: la persona responde sobre sí; el cuidador, sobre quien acompaña.
  const sujeto = esCuidador ? alias : 'vos'
  const preguntaDe = (tn: Turn): string => {
    if (tn.id === 'edad') return esCuidador ? `¿Cuántos años tiene ${alias}?` : '¿Cuántos años tenés?'
    if (tn.id === 'sexo') return esCuidador ? `¿${alias} es mujer o varón?` : '¿Sos mujer o varón?'
    if (tn.id === 'edu_anios') return esCuidador ? `¿Cuántos años fue ${alias} a la escuela?` : '¿Cuántos años fuiste a la escuela?'
    return t(`factors.${tn.id}.question`)
  }

  // La voz lee sola la burbuja actual (decisión: proactiva, con apagado visible).
  useEffect(() => {
    if (!actual) return
    const q = preguntaDe(actual)
    if (voiceOn && q && lastSpoken.current !== q) {
      lastSpoken.current = q
      speak(q)
    }
    return () => window.speechSynthesis?.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, voiceOn])

  if (!personaActiva) return <Onboarding />

  const festejar = (msg: string) => {
    setFestejo(msg)
    window.setTimeout(() => setFestejo(null), 2000)
  }
  const trasResponder = (siguienteEsLancet: boolean, eraDemografia: boolean) => {
    setNum('')
    if (eraDemografia && siguienteEsLancet) festejar('¡Listo! Ya sabemos lo básico.')
  }
  const responderNum = (tn: Turn) => {
    const v = Number(num)
    if (num === '' || Number.isNaN(v)) return
    setDemo({ [tn.id]: v } as Record<string, number>)
    const next = turnos[idx + 1]
    trasResponder(next?.kind === 'lancet', true)
  }
  const responderSexo = (v: 'Mujer' | 'Hombre') => {
    setDemo({ sexo: v })
    setNum('')
  }
  const responderLancet = (id: string, v: 'si' | 'no' | 'nose') => {
    setLancet(id, v)
    if (id === turnos[turnos.length - 1].id) festejar('¡Terminamos lo necesario! 🎉')
  }

  const av = avancePerfil({ demo, lancet: lancet as Record<string, string | undefined>, instruments })
  const pedidos = useMemo(() => {
    const sj = SEED_PERSONAS.find((p) => p.id === 'p7')
    if (!sj) return 0
    const creados = pedidosCreados.filter((p) => p.personId === sj.id && p.estado !== 'cerrada')
    return colaPorRol([...derivarAlarmas(inputFromSeed(sj, Date.UTC(2026, 5, 25))), ...creados], 'diada').filter((a) => !a.brechaDeServicio).length
  }, [pedidosCreados])

  return (
    <div className="mx-auto max-w-md px-4 py-6 pb-10">
      {/* Encabezado: saludo + quién responde + voz */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="font-serif text-2xl text-ink">{esCuidador ? `Acompañando a ${alias}` : `Hola ${alias}`}</h1>
          <p className="mt-0.5 text-sm text-muted">{esCuidador ? `Lo que vos observás sobre ${alias}` : 'Cuidemos tu memoria, de a poco'}</p>
        </div>
        <button
          onClick={() => setVoiceOn(!voiceOn)}
          aria-pressed={voiceOn}
          className={'shrink-0 rounded-2xl px-3 py-2 text-sm font-medium ' + (voiceOn ? 'bg-secondary text-white' : 'border border-line bg-surface text-ink')}
        >
          {voiceOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>
      {voiceOn && <p className="mt-1 text-xs text-secondary">🔊 Te leo en voz alta · tocá el altavoz para apagar</p>}

      {festejo && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-verde bg-verde/10 px-3 py-1.5 text-sm text-verde-text">
          <Sparkles size={16} /> {festejo}
        </div>
      )}

      {/* TURNO ACTUAL — una sola pregunta */}
      {actual && (
        <section className="mt-5 rounded-2xl border border-line bg-surface p-5">
          {esCuidador && <p className="mb-1 text-xs font-medium text-secondary">Sobre {alias}</p>}
          <p className="font-serif text-xl text-ink">{preguntaDe(actual)}</p>

          {actual.kind === 'num' && (
            <div className="mt-4 flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                value={num}
                onChange={(e) => setNum(e.target.value)}
                className="w-28 rounded-xl border border-line bg-bg px-3 py-3 text-lg text-ink focus:border-secondary"
                autoFocus
              />
              <button onClick={() => responderNum(actual)} disabled={num === ''} className="inline-flex items-center gap-1 rounded-xl bg-primary px-5 py-3 font-medium text-white disabled:opacity-40">
                {t('common.next')} <ArrowRight size={18} />
              </button>
            </div>
          )}
          {actual.kind === 'sexo' && (
            <div className="mt-4 flex gap-2">
              {(['Mujer', 'Hombre'] as const).map((v) => (
                <button key={v} onClick={() => responderSexo(v)} className="flex-1 rounded-xl border border-line bg-bg px-4 py-3 text-lg font-medium text-ink hover:border-secondary">
                  {v}
                </button>
              ))}
            </div>
          )}
          {actual.kind === 'lancet' && (
            <div className="mt-4 flex gap-2">
              {(['si', 'no', 'nose'] as const).map((v) => (
                <button key={v} onClick={() => responderLancet(actual.id, v)} className="flex-1 rounded-xl border border-line bg-bg px-4 py-3 text-base font-medium text-ink hover:border-secondary">
                  {t(`pre.prevencion.answer.${v}`)}
                </button>
              ))}
            </div>
          )}
          <p className="mt-4 text-xs text-muted">{t('puerta.empezarNota')}</p>
        </section>
      )}

      {/* COMPLETO — listo + invitaciones suaves */}
      {completo && (
        <section className="mt-5 space-y-3">
          <div className="rounded-2xl border border-verde bg-verde/10 p-5">
            <p className="font-serif text-xl text-verde-text">¡Listo lo necesario para tu consulta!</p>
            <p className="mt-1 text-sm text-ink">Ya tenemos lo básico de {esCuidador ? alias : 'vos'}. Podés sumar más cuando quieras.</p>
          </div>
          <Link to={`/p/${profileId}/preconsulta`} className="flex items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-4 text-white">
            <span className="font-medium">Seguir completando el perfil</span> <ArrowRight size={22} />
          </Link>
          <Link to={`/p/${profileId}/mi-resultado`} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-5 py-4">
            <span className="font-medium text-ink">Ver mi resultado</span> <ArrowRight size={22} className="text-muted" />
          </Link>
          <Link to={`/p/${profileId}/conectar`} className="flex items-center justify-between gap-3 rounded-2xl border border-secondary bg-secondary/10 px-5 py-4">
            <span className="text-sm text-ink"><b>Conectarte con tu comunidad</b><br />Contanos qué sabés hacer y te acercamos a otros.</span> <ArrowRight size={20} className="shrink-0 text-secondary" />
          </Link>
        </section>
      )}

      {/* Lo que te pidieron (díada) */}
      {pedidos > 0 && (
        <Link to={`/p/${profileId}/alarmas`} className="mt-4 flex items-center gap-3 rounded-2xl border border-secondary bg-secondary/10 p-4">
          <Check className="text-secondary" />
          <span className="text-sm text-ink">{t('puerta.pedidos', { n: pedidos })}</span>
          <ArrowRight className="ml-auto text-muted" size={18} />
        </Link>
      )}

      {!completo && (
        <p className="mt-5 text-center text-xs text-muted">Nivel: {t(`puerta.nivel.${av.nivel}.t`)}</p>
      )}
    </div>
  )
}
