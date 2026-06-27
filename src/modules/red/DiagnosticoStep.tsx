import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Printer, Save, Stethoscope } from 'lucide-react'
import { SEED_PERSONAS } from '../../seed/personas'
import { usePedidos } from './pedidosStore'
import { CDR, cdrLabel, DIAGNOSTICOS, Diagnostico, dxLabel, ultimoDiagnostico, useDiagnostico } from './diagnosticoStore'

// Etiquetado de DIAGNÓSTICO (médico): impresión clínica + estadio CDR + detalle → guarda en
// la serie (evolución) → constancia imprimible firmada. Mirror de Vitales/Social.
const fmtFecha = (ms: number) => new Date(ms).toLocaleDateString('es-AR')

export function DiagnosticoStep() {
  const { profileId, personId } = useParams()
  const registrar = useDiagnostico((s) => s.registrar)
  const porPersona = useDiagnostico((s) => s.porPersona)
  const cerrarPedido = usePedidos((s) => s.cerrarPedido)
  const persona = SEED_PERSONAS.find((p) => p.id === personId)
  const alias = persona?.alias ?? personId ?? '—'
  const previo = personId ? ultimoDiagnostico(porPersona, personId) : undefined

  const [dx, setDx] = useState(previo?.dx ?? '')
  const [cdr, setCdr] = useState(previo?.cdr ?? '')
  const [detalle, setDetalle] = useState('')
  const [modo, setModo] = useState<'cargar' | 'informe'>('cargar')
  const [guardado, setGuardado] = useState<Diagnostico | null>(null)

  const guardar = () => {
    if (!personId || !dx) return
    const d: Diagnostico = { fecha: Date.now(), dx, cdr: cdr || undefined, detalle: detalle.trim() || undefined }
    registrar(personId, d)
    cerrarPedido(`${personId}:pedidoCompletar:modulo:diagnostico`)
    setGuardado(d)
    setModo('informe')
    window.scrollTo({ top: 0 })
  }

  if (modo === 'informe' && guardado) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="no-print mb-4 flex items-center gap-2">
          <button onClick={() => setModo('cargar')} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><Pencil size={16} /> Volver a editar</button>
          <button onClick={() => window.print()} className="ml-auto inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white"><Printer size={16} /> Imprimir</button>
        </div>
        <article className="rounded-2xl border border-line bg-surface p-6 print:border-0 print:p-0">
          <header className="border-b-2 border-ink pb-2">
            <p className="text-xs text-muted">Programa de Salud Cerebral · San Juan · KaizenAI</p>
            <h1 className="font-serif text-2xl text-ink">Constancia diagnóstica</h1>
            <p className="text-sm text-ink">{alias}{persona ? ` · ${persona.age} años` : ''} · {fmtFecha(guardado.fecha)}</p>
          </header>
          <section className="mt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">Impresión diagnóstica</h2>
            <p className="mt-1 text-lg text-ink">{dxLabel(guardado.dx)}</p>
            {guardado.cdr && <p className="text-sm text-ink">Estadio: {cdrLabel(guardado.cdr)}</p>}
            {guardado.detalle && <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{guardado.detalle}</p>}
          </section>
          <div className="mt-10 flex items-end justify-between gap-6">
            <div className="flex-1 border-t border-ink pt-1 text-center text-xs text-muted">Firma y matrícula del médico</div>
            <div className="h-20 w-32 rounded border border-dashed border-line text-center text-[10px] text-muted">Sello</div>
          </div>
          <p className="mt-4 border-t border-line pt-2 text-[11px] text-muted">Impresión clínica del profesional firmante. Se compara con evaluaciones previas en el seguimiento.</p>
        </article>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-28">
      <Link to={`/p/${profileId}/alarmas`} className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink no-print"><ArrowLeft size={16} /> Volver</Link>
      <h1 className="flex items-center gap-2 font-serif text-2xl text-ink sm:text-3xl"><Stethoscope className="text-secondary" /> Diagnóstico</h1>
      <p className="mt-1 text-sm text-muted">{alias}. {previo ? `Último: ${dxLabel(previo.dx)} (${fmtFecha(previo.fecha)}).` : 'Primera etiqueta diagnóstica.'}</p>

      <section className="mt-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Impresión diagnóstica</h2>
        <div className="mt-2 flex flex-col gap-2">
          {DIAGNOSTICOS.map((d) => (
            <button key={d.id} onClick={() => setDx(d.id)} aria-pressed={dx === d.id}
              className={'rounded-xl border px-4 py-2.5 text-left text-base ' + (dx === d.id ? 'border-secondary bg-secondary/10 text-secondary-text' : 'border-line bg-surface text-ink hover:bg-bg')}>
              {d.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Estadio (CDR)</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {CDR.map((c) => (
            <button key={c.id} onClick={() => setCdr(cdr === c.id ? '' : c.id)} aria-pressed={cdr === c.id}
              className={'rounded-xl border px-3 py-2 text-sm ' + (cdr === c.id ? 'border-secondary bg-secondary/10 text-secondary-text' : 'border-line bg-surface text-ink hover:bg-bg')}>
              {c.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <label className="text-sm font-semibold uppercase tracking-wide text-muted">Detalle / fundamento</label>
        <textarea value={detalle} onChange={(e) => setDetalle(e.target.value)} placeholder="Hallazgos, etiología probable, conducta…" className="mt-2 min-h-[90px] w-full rounded-lg border border-line bg-bg p-2 text-sm text-ink" />
      </section>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-bg/90 backdrop-blur no-print">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button onClick={guardar} disabled={!dx} className="ml-auto inline-flex items-center gap-1 rounded-xl bg-primary px-5 py-2.5 font-medium text-white disabled:opacity-40"><Save size={18} /> Guardar y firmar</button>
        </div>
      </div>
    </div>
  )
}
