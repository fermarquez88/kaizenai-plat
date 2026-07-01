import { useEffect, useState } from 'react'
import { ArrowLeft, BookOpen, Brain, ClipboardCheck, FileText, HandHeart, HeartPulse, Lightbulb, LifeBuoy, Users } from 'lucide-react'
import { useSettings } from '../../lib/store'
import { INSTRUMENTS } from '../../scoring/instruments'
import { Tarjeta as Rama } from '../../components/Tarjeta'
import { Onboarding } from '../profile/Onboarding'
import { useEscalas, ultimoResultado } from './escalasStore'
import { EscalaRunner } from './EscalaRunner'

// Espacio del CUIDADOR — estilo kaizen-cuidadores: bienvenida "¿qué necesita hoy?" + ramas.
// Cuidarse (escalas con fecha + su propio cerebro) es nativo; el contenido educativo
// (Entender/Hacer/Recursos/Apoyo) se está portando — interim enlaza a la guía existente.
const GUIA = 'https://fermarquez88.github.io/kaizenai-cuidadores/'
// Escalas del cuidador (parte del CUIDADO, no investigación). Zarit/PSS se suman luego.
const ESCALAS = ['zaritR', 'phq9', 'gad', 'autoeficacia', 'apoyoSocial', 'pac'].filter((id) => INSTRUMENTS[id])

const fechaCorta = (ms: number) => new Date(ms).toLocaleDateString('es-AR')

export function CuidadorEspacio() {
  const usuarioRol = useSettings((s) => s.usuarioRol)
  const setUsuarioRol = useSettings((s) => s.setUsuarioRol)
  const activePersonId = useSettings((s) => s.activePersonId)
  const personas = useSettings((s) => s.personas)
  const cuidados = useSettings((s) => s.cuidados)
  const ensureSelf = useSettings((s) => s.ensureSelfPersonId)
  const porPersona = useEscalas((s) => s.porPersona)
  const [vista, setVista] = useState<'home' | 'cuidarse'>('home')
  const [escala, setEscala] = useState<string | null>(null)

  useEffect(() => {
    if (usuarioRol !== 'cuidador') setUsuarioRol('cuidador')
  }, [usuarioRol, setUsuarioRol])
  const cared = activePersonId ? personas[activePersonId] : undefined
  if (!cared) return <Onboarding />
  const alias = cared.alias
  const selfId = ensureSelf() // el cuidador, para SUS escalas

  if (escala) {
    return (
      <div className="mx-auto max-w-md px-4 py-6">
        <EscalaRunner scaleId={escala} personId={selfId} onDone={() => setEscala(null)} />
      </div>
    )
  }

  if (vista === 'cuidarse') {
    return (
      <div className="mx-auto max-w-md px-4 py-6">
        <button onClick={() => setVista('home')} className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> Volver</button>
        <h1 className="font-serif text-2xl text-ink">Cuidarse para poder cuidar</h1>
        <p className="mt-1 text-sm text-muted">Cuidar al cuidador es parte del tratamiento. Esto es para vos.</p>

        <Rama icon={BookOpen} titulo="Cómo cuidarse (guía)" sub="Sobrecarga, emociones, autocuidado, cuándo pedir ayuda" to="/p/cuidador/guia/apoyo" />
        <div className="mt-1" />

        <h2 className="mt-5 text-sm font-semibold uppercase tracking-wide text-muted">¿Cómo está usted?</h2>
        <ul className="mt-2 space-y-2">
          {ESCALAS.map((id) => {
            const u = ultimoResultado(porPersona, selfId, id)
            return (
              <li key={id}>
                <button onClick={() => setEscala(id)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3 text-left hover:border-secondary">
                  <span><span className="block text-ink">{INSTRUMENTS[id].name}</span><span className="block text-xs text-muted">{u ? `Última: ${fechaCorta(u.fecha)} · ${u.text}` : 'Sin completar'}</span></span>
                  <span className="shrink-0 rounded-lg bg-secondary/10 px-3 py-1.5 text-sm font-medium text-secondary">{u ? 'Repetir' : 'Hacer'}</span>
                </button>
              </li>
            )
          })}
        </ul>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted">Cuide su propio cerebro</h2>
        <Rama icon={Brain} titulo="Su chequeo de salud cerebral" sub="El mismo chequeo, sobre usted" to="/p/paciente" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="font-serif text-2xl text-ink">Acompañando a {alias}</h1>
      <p className="mt-1 text-muted">¿Qué necesita hoy?</p>

      <div className="mt-5 space-y-2.5">
        {/* 1º Completar */}
        {cuidados.length > 1 ? (
          <Rama icon={ClipboardCheck} titulo="Completar info de mis personas cuidadas" sub={`Acompañás a ${cuidados.length} — elegí a quién`} to="/p/cuidador/personas?ir=preconsulta" />
        ) : (
          <Rama icon={ClipboardCheck} titulo={`Completar lo de ${alias}`} sub="Responder sus formularios (lo que usted observa)" to="/p/cuidador/preconsulta" />
        )}
        {/* 2º Resolver una situación AHORA (urgente, a mano) */}
        <Rama icon={Lightbulb} titulo="Necesito resolver una situación ahora" sub="Conductas difíciles, paso a paso (método DICE)" to="/p/cuidador/guia/dice" />
        {/* 3º Ver informe */}
        {cuidados.length > 1 ? (
          <Rama icon={FileText} titulo="Ver informes de mis personas cuidadas" sub="Elegí de quién ver el resultado" to="/p/cuidador/personas?ir=mi-resultado" />
        ) : (
          <Rama icon={FileText} titulo={`Ver informe de ${alias}`} sub="Resultado del chequeo" to="/p/cuidador/mi-resultado" />
        )}
        <Rama icon={HeartPulse} titulo="Cuidarse" sub="¿Cómo está usted? + su propio cerebro" onClick={() => setVista('cuidarse')} />
        <Rama icon={BookOpen} titulo="Entender la enfermedad" sub="Qué pasa y por qué" to="/p/cuidador/guia/entender" />
        <Rama icon={BookOpen} titulo="Recursos y materiales" sub="Ejercicios, planillas, materiales oficiales" to="/p/cuidador/guia/recursos" />
        <Rama icon={LifeBuoy} titulo="Dónde pedir ayuda" sub="San Juan: turnos, asociaciones, contactos" to="/p/cuidador/guia/ayuda" />
        <Rama icon={Users} titulo={`Conectar a ${alias} con la comunidad`} sub="Lo que sabe y puede aportar → vínculos con propósito" to="/p/cuidador/conectar" />
        <Rama icon={HandHeart} titulo="Colaborar con la investigación" sub="Sumar tu experiencia (estudio)" to={GUIA} externo />
      </div>
    </div>
  )
}
