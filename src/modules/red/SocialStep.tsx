import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Pencil, Printer, Save } from 'lucide-react'
import { usePersona } from '../../data/usePersona'
import { useSocial } from './socialStore'
import { usePedidos } from './pedidosStore'

// Evaluación de TRABAJO SOCIAL: lo que un/a trabajador/a social necesita tener presente —
// situación socioeconómica, vivienda/entorno, red de apoyo y cuidado, acceso a derechos, y
// ALERTAS de riesgo social. Carga → guarda → informe social imprimible + gestiones.
interface Q {
  id: string
  label: string
  opts: [string, string][]
  /** valor que enciende una ALERTA de riesgo social. */
  riesgo?: string
}
interface Grupo {
  titulo: string
  qs: Q[]
}

const GRUPOS: Grupo[] = [
  {
    titulo: 'Situación socioeconómica',
    qs: [
      { id: 'ingreso', label: '¿El ingreso del hogar alcanza para lo básico?', opts: [['si', 'Sí'], ['aveces', 'A veces no'], ['no', 'No alcanza']], riesgo: 'no' },
      { id: 'cobertura', label: 'Cobertura de salud', opts: [['pami', 'PAMI'], ['obra', 'Obra social'], ['publica', 'Solo pública'], ['nose', 'No sé']] },
      { id: 'beneficios', label: '¿Recibe algún beneficio?', opts: [['jub', 'Jubilación / pensión'], ['disc', 'Pensión por discapacidad'], ['asig', 'Asignaciones (AUH)'], ['ninguno', 'Ninguno'], ['nose', 'No sé']], riesgo: 'ninguno' },
      { id: 'tramites', label: '¿Trámites de beneficios pendientes?', opts: [['si', 'Sí'], ['no', 'No'], ['nose', 'No sé']] },
    ],
  },
  {
    titulo: 'Vivienda y entorno',
    qs: [
      { id: 'tenencia', label: 'La vivienda es…', opts: [['propia', 'Propia'], ['alquila', 'Alquilada'], ['prestada', 'Prestada / cedida'], ['irregular', 'Situación irregular']], riesgo: 'irregular' },
      { id: 'hacinamiento', label: '¿Hay hacinamiento?', opts: [['si', 'Sí'], ['no', 'No']], riesgo: 'si' },
      { id: 'accesible', label: '¿La vivienda es accesible para la persona?', opts: [['si', 'Sí'], ['dificultad', 'Con dificultad'], ['no', 'No']], riesgo: 'no' },
    ],
  },
  {
    titulo: 'Red de apoyo y cuidado',
    qs: [
      { id: 'convivencia', label: '¿Con quién vive?', opts: [['solo', 'Solo/a'], ['pareja', 'Con pareja'], ['familia', 'Con hijos / familia'], ['otros', 'Otros']], riesgo: 'solo' },
      { id: 'cuida', label: '¿Quién la cuida principalmente?', opts: [['conviviente', 'Familiar conviviente'], ['noconv', 'Familiar no conviviente'], ['pago', 'Cuidador/a pago'], ['nadie', 'Nadie']], riesgo: 'nadie' },
      { id: 'sobrecarga', label: 'Sobrecarga del cuidador (percibida)', opts: [['baja', 'Baja'], ['media', 'Media'], ['alta', 'Alta']], riesgo: 'alta' },
      { id: 'unico', label: '¿Es el único cuidador?', opts: [['si', 'Sí'], ['no', 'No']], riesgo: 'si' },
    ],
  },
  {
    titulo: 'Acceso a derechos',
    qs: [
      { id: 'cud', label: 'Certificado de Discapacidad (CUD)', opts: [['vigente', 'Vigente'], ['tramite', 'En trámite'], ['vencido', 'Vencido'], ['no', 'No tiene'], ['nose', 'No sé']], riesgo: 'no' },
      { id: 'desarrollo', label: '¿Derivado a Desarrollo Social?', opts: [['si', 'Sí'], ['pendiente', 'Pendiente'], ['no', 'No']] },
    ],
  },
  {
    titulo: 'Alertas de riesgo social',
    qs: [
      { id: 'aislamiento', label: '¿Aislamiento social?', opts: [['si', 'Sí'], ['no', 'No']], riesgo: 'si' },
      { id: 'alimentaria', label: '¿Inseguridad alimentaria?', opts: [['si', 'Sí'], ['no', 'No']], riesgo: 'si' },
      { id: 'maltrato', label: '¿Sospecha de maltrato o abandono?', opts: [['si', 'Sí'], ['observar', 'A observar'], ['no', 'No']], riesgo: 'si' },
      { id: 'habitacional', label: '¿Situación habitacional crítica?', opts: [['si', 'Sí'], ['no', 'No']], riesgo: 'si' },
    ],
  },
]

const labelDe = (q: Q, val?: string) => q.opts.find(([v]) => v === val)?.[1] ?? '—'

export function SocialStep() {
  const { profileId, personId } = useParams()
  const data = useSocial((s) => (personId ? s.porPersona[personId] : undefined)) ?? {}
  const setCampo = useSocial((s) => s.setCampo)
  const cerrarPedido = usePedidos((s) => s.cerrarPedido)
  const { alias, edad } = usePersona(personId)
  const [gestiones, setGestiones] = useState(data.gestiones ?? '')
  const [modo, setModo] = useState<'cargar' | 'informe'>('cargar')

  const elegir = (id: string, v: string) => personId && setCampo(personId, id, v)
  const riesgos = GRUPOS.flatMap((g) => g.qs).filter((q) => q.riesgo && data[q.id] === q.riesgo)

  const guardar = () => {
    if (!personId) return
    setCampo(personId, 'gestiones', gestiones)
    for (const alc of ['modulo:social', 'modulo:sdoh', 'test:bateria']) cerrarPedido(`${personId}:pedidoCompletar:${alc}`)
    setModo('informe')
    window.scrollTo({ top: 0 })
  }

  if (modo === 'informe') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="no-print mb-4 flex items-center gap-2">
          <button onClick={() => setModo('cargar')} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
            <Pencil size={16} /> Volver a editar
          </button>
          <button onClick={() => window.print()} className="ml-auto inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white">
            <Printer size={16} /> Imprimir
          </button>
        </div>
        <article className="rounded-2xl border border-line bg-surface p-6 print:border-0 print:p-0">
          <header className="border-b-2 border-ink pb-2">
            <p className="text-xs text-muted">Programa de Salud Cerebral · San Juan · KaizenAI</p>
            <h1 className="font-serif text-2xl text-ink">Informe social</h1>
            <p className="text-sm text-ink">{alias}{edad != null ? ` · ${edad} años` : ''}</p>
          </header>

          {riesgos.length > 0 && (
            <div className="mt-3 rounded-xl border border-rojo bg-rojo/10 p-3">
              <p className="flex items-center gap-1 text-sm font-medium text-rojo-text">
                <AlertTriangle size={16} /> Alertas de riesgo social
              </p>
              <ul className="mt-1 list-disc pl-5 text-sm text-ink">
                {riesgos.map((q) => (
                  <li key={q.id}>{q.label} → {labelDe(q, data[q.id])}</li>
                ))}
              </ul>
            </div>
          )}

          {GRUPOS.map((g) => (
            <section key={g.titulo} className="mt-4 break-inside-avoid">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">{g.titulo}</h2>
              <ul className="mt-1 text-sm text-ink">
                {g.qs.filter((q) => data[q.id]).map((q) => (
                  <li key={q.id}>{q.label}: <strong>{labelDe(q, data[q.id])}</strong></li>
                ))}
              </ul>
            </section>
          ))}

          {gestiones && (
            <section className="mt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">Gestiones / observaciones</h2>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{gestiones}</p>
            </section>
          )}

          <div className="mt-10 flex items-end justify-between gap-6">
            <div className="flex-1 border-t border-ink pt-1 text-center text-xs text-muted">Firma del/la trabajador/a social</div>
            <div className="h-20 w-32 rounded border border-dashed border-line text-center text-[10px] text-muted">Sello</div>
          </div>
          <p className="mt-4 border-t border-line pt-2 text-[11px] text-muted">Evaluación social de apoyo a la gestión de derechos y cuidados.</p>
        </article>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-28">
      <Link to={`/p/${profileId}/alarmas`} className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink no-print">
        <ArrowLeft size={16} /> Volver
      </Link>
      <h1 className="font-serif text-2xl text-ink sm:text-3xl">Evaluación social</h1>
      <p className="mt-1 text-sm text-muted">{alias}. Lo que el equipo necesita saber para acompañar y gestionar derechos.</p>

      <div className="mt-5 space-y-6">
        {GRUPOS.map((g) => (
          <section key={g.titulo}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{g.titulo}</h2>
            <div className="mt-2 space-y-4">
              {g.qs.map((q) => (
                <fieldset key={q.id}>
                  <legend className="text-sm text-ink">{q.label}</legend>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {q.opts.map(([v, label]) => {
                      const on = data[q.id] === v
                      const danger = on && q.riesgo === v
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => elegir(q.id, v)}
                          aria-pressed={on}
                          className={
                            'rounded-xl border px-3 py-2 text-sm ' +
                            (danger ? 'border-rojo bg-rojo/10 text-rojo-text' : on ? 'border-secondary bg-secondary/10 text-secondary-text' : 'border-line bg-surface text-ink hover:bg-bg')
                          }
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          </section>
        ))}

        <div>
          <label className="text-sm font-semibold uppercase tracking-wide text-muted">Gestiones / observaciones</label>
          <textarea
            value={gestiones}
            onChange={(e) => setGestiones(e.target.value)}
            placeholder="Qué se gestionó, derivaciones, próximos pasos…"
            className="mt-2 min-h-[90px] w-full rounded-lg border border-line bg-bg p-2 text-sm text-ink"
          />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-bg/90 backdrop-blur no-print">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          {riesgos.length > 0 && (
            <span className="inline-flex items-center gap-1 text-sm text-rojo-text">
              <AlertTriangle size={16} /> {riesgos.length} alerta(s)
            </span>
          )}
          <button onClick={guardar} className="ml-auto inline-flex items-center gap-1 rounded-xl bg-primary px-5 py-2.5 font-medium text-white">
            <Save size={18} /> Guardar e informar
          </button>
        </div>
      </div>
    </div>
  )
}
