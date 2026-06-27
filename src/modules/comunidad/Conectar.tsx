import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, HandHeart, Heart } from 'lucide-react'
import { useSettings } from '../../lib/store'
import { labelDe, PerfilActivos, SABERES, TEMAS, useActivos } from './activosStore'
import { sugerirConexiones } from './match'

// Cuestionario de Activos — administrado en VOZ por el agente (no autoadministrado): una
// pregunta por turno, lenguaje concreto, baja escolaridad. Cierra mostrando conexiones con
// propósito (el "casamentero"). Combatir la soledad = prevención de deterioro cognitivo.

type Kind = 'multi' | 'single' | 'bool' | 'text'
type Draft = Partial<Omit<PerfilActivos, 'fecha'>>

interface Q {
  id: keyof Draft
  prompt: string
  kind: Kind
  options?: { value: string; label: string }[]
  source?: { id: string; label: string }[]
  fromChosen?: boolean
  optional?: boolean
  multiText?: boolean // el valor se guarda como string[] (p. ej. quiereAprender) y no como string
  when?: (d: Draft) => boolean
}

const QUESTIONS: Q[] = [
  { id: 'saberes', prompt: '¿Qué sabe hacer que le podría enseñar a otro?', kind: 'multi', source: SABERES },
  { id: 'destacado', prompt: '¿Cuál es lo que más le sale, lo que hace con los ojos cerrados?', kind: 'single', fromChosen: true, when: (d) => (d.saberes?.length ?? 0) > 1 },
  { id: 'dispuestoEnsenar', prompt: '¿Le gustaría enseñarle eso a alguien?', kind: 'bool', when: (d) => (d.saberes?.length ?? 0) > 0 },
  { id: 'quiereAprender', prompt: '¿Hay algo que siempre quiso aprender o le daría curiosidad?', kind: 'text', optional: true, multiText: true },
  { id: 'temas', prompt: '¿De qué tema podría hablar horas?', kind: 'multi', source: TEMAS },
  { id: 'epoca', prompt: '¿Qué época de su vida recuerda con más ganas?', kind: 'single', options: [
    { value: 'infancia', label: 'La infancia, el pueblo' },
    { value: 'juventud', label: 'La juventud, el trabajo' },
    { value: 'adultez', label: 'El casamiento, los hijos' },
  ] },
  { id: 'movilidad', prompt: '¿Puede salir de la casa?', kind: 'single', options: [
    { value: 'sola', label: 'Sí, solo/a' },
    { value: 'acompanado', label: 'Sí, acompañado/a' },
    { value: 'noSale', label: 'No sale' },
  ] },
  { id: 'oyeBienTel', prompt: '¿Oye y conversa bien por teléfono?', kind: 'bool', when: (d) => d.movilidad === 'noSale' },
  { id: 'paraje', prompt: '¿En qué paraje o barrio vive?', kind: 'text', optional: true },
  { id: 'contactoSemanal', prompt: 'En una semana común, ¿con cuánta gente habla?', kind: 'single', options: [
    { value: 'varias', label: 'Con varias' },
    { value: 'pocas', label: 'Con pocas' },
    { value: 'casiNadie', label: 'Casi con nadie' },
  ] },
  { id: 'sienteCarga', prompt: 'A veces, ¿siente que ya no le sirve a nadie, que es una carga?', kind: 'bool' },
  { id: 'quiereSerUtil', prompt: '¿Le gustaría volver a sentirse útil, hacer algo que le gustaba?', kind: 'bool' },
]

const activa = (q: Q, d: Draft) => !q.when || q.when(d)
function siguiente(from: number, d: Draft): number {
  for (let k = from; k < QUESTIONS.length; k++) if (activa(QUESTIONS[k], d)) return k
  return -1
}

function Tarjeta({ perfil, alias, onEditar }: { perfil: PerfilActivos; alias: string; onEditar: () => void }) {
  const { reencuadre, sugerencias } = useMemo(() => sugerirConexiones(perfil), [perfil])
  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <Link to=".." className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> Volver</Link>
      <h1 className="font-serif text-2xl text-ink">Lo que {alias} puede aportar</h1>
      <p className="mt-1 text-sm text-muted">Guardado el {new Date(perfil.fecha).toLocaleDateString('es-AR')}. Esto conecta a {alias} con su comunidad.</p>

      {reencuadre && (
        <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <p className="flex items-start gap-2 text-sm text-amber-900"><Heart size={18} className="mt-0.5 shrink-0" /> <span><b>Para el agente:</b> {alias} siente que es una carga. Normalizá ("a cualquiera le pasa, y tiene mucho para dar") y priorizá una conexión que le devuelva un rol. Si persiste, derivá a psicología.</span></p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {perfil.saberes.map((s) => <span key={s} className="rounded-full bg-secondary/10 px-3 py-1 text-xs text-secondary">{labelDe(SABERES, s)}</span>)}
        {perfil.temas.map((t) => <span key={t} className="rounded-full bg-bg px-3 py-1 text-xs text-muted">{labelDe(TEMAS, t)}</span>)}
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted">Conexiones sugeridas</h2>
      <ul className="mt-2 space-y-2">
        {sugerencias.map((s, idx) => (
          <li key={`${s.idea}-${idx}`} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-bg text-secondary"><HandHeart size={18} /></span>
            <span><span className="block font-medium text-ink">{s.titulo}</span><span className="block text-sm text-muted">{s.motivo}</span></span>
          </li>
        ))}
      </ul>
      <button onClick={onEditar} className="mt-5 w-full rounded-xl border border-line py-2.5 text-sm text-muted hover:text-ink">Actualizar las respuestas</button>
    </div>
  )
}

export function Conectar() {
  const personas = useSettings((s) => s.personas)
  const activePersonId = useSettings((s) => s.activePersonId)
  const ensureSelf = useSettings((s) => s.ensureSelfPersonId)
  const porPersona = useActivos((s) => s.porPersona)
  const guardar = useActivos((s) => s.guardar)

  const subjectId = activePersonId ?? ensureSelf()
  const alias = personas[subjectId]?.alias ?? 'esta persona'
  const guardado = porPersona[subjectId]

  const [editando, setEditando] = useState(false)
  const [draft, setDraft] = useState<Draft>({ saberes: [], temas: [], quiereAprender: [] })
  const [i, setI] = useState(0)
  const [texto, setTexto] = useState('')

  if (guardado && !editando) return <Tarjeta perfil={guardado} alias={alias} onEditar={() => { setDraft(guardado); setI(0); setEditando(true) }} />

  const q = QUESTIONS[i]
  const total = QUESTIONS.filter((qq) => activa(qq, draft)).length
  const pos = QUESTIONS.slice(0, i + 1).filter((qq) => activa(qq, draft)).length

  const avanzar = (d: Draft) => {
    const n = siguiente(i + 1, d)
    if (n === -1) {
      const perfil: PerfilActivos = { fecha: Date.now(), saberes: [], temas: [], quiereAprender: [], ...d }
      guardar(subjectId, perfil)
      setEditando(false)
    } else {
      setI(n)
      setTexto('')
    }
  }

  const setSingle = (v: string | boolean) => { const d = { ...draft, [q.id]: v }; setDraft(d); avanzar(d) }
  const toggleMulti = (v: string) => {
    const cur = (draft[q.id] as string[] | undefined) ?? []
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]
    setDraft({ ...draft, [q.id]: next })
  }
  const textoValor = (t: string) => (q.multiText ? (t ? [t] : []) : t || undefined)
  const opcionesMulti = q.kind === 'multi' ? q.source ?? [] : []
  const opcionesSingle = q.fromChosen ? (draft.saberes ?? []).map((s) => ({ value: s, label: labelDe(SABERES, s) })) : q.options ?? []
  const seleccion = (draft[q.id] as string[] | undefined) ?? []

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <Link to=".." className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> Volver</Link>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${Math.round((pos / total) * 100)}%` }} />
      </div>
      <p className="text-xs font-medium text-secondary">Conectar con la comunidad · {pos}/{total}</p>
      <p className="mt-1 font-serif text-2xl leading-snug text-ink">{q.prompt}</p>

      {q.kind === 'multi' && (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {opcionesMulti.map((o) => {
              const on = seleccion.includes(o.id)
              return (
                <button key={o.id} onClick={() => toggleMulti(o.id)} className={`rounded-xl border px-4 py-2.5 text-left text-base ${on ? 'border-secondary bg-secondary/10 text-secondary' : 'border-line bg-bg text-ink hover:border-secondary'}`}>
                  {on && <Check size={15} className="mr-1 inline" />}{o.label}
                </button>
              )
            })}
          </div>
          <button onClick={() => avanzar(draft)} className="mt-5 w-full rounded-xl bg-primary py-3 font-medium text-white">Seguir</button>
        </>
      )}

      {(q.kind === 'single') && (
        <div className="mt-4 flex flex-col gap-2">
          {opcionesSingle.map((o) => (
            <button key={o.value} onClick={() => setSingle(o.value)} className="rounded-xl border border-line bg-bg px-4 py-3 text-left text-base text-ink hover:border-secondary">{o.label}</button>
          ))}
        </div>
      )}

      {q.kind === 'bool' && (
        <div className="mt-4 flex gap-2">
          <button onClick={() => setSingle(true)} className="flex-1 rounded-xl border border-line bg-bg py-3 text-base text-ink hover:border-secondary">Sí</button>
          <button onClick={() => setSingle(false)} className="flex-1 rounded-xl border border-line bg-bg py-3 text-base text-ink hover:border-secondary">No</button>
        </div>
      )}

      {q.kind === 'text' && (
        <div className="mt-4">
          <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribilo (o saltá)" className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-base text-ink outline-none focus:border-secondary" />
          <div className="mt-3 flex gap-2">
            <button onClick={() => avanzar({ ...draft, [q.id]: textoValor(texto.trim()) })} className="flex-1 rounded-xl bg-primary py-3 font-medium text-white">Seguir</button>
            {q.optional && <button onClick={() => avanzar({ ...draft, [q.id]: textoValor('') })} className="rounded-xl border border-line px-4 text-sm text-muted hover:text-ink">No / saltar</button>}
          </div>
        </div>
      )}
    </div>
  )
}
