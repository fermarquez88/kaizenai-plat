import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Activity, AlertTriangle, ArrowLeft, Pencil, Printer, Save } from 'lucide-react'
import { usePersona } from '../../data/usePersona'
import { usePedidos } from './pedidosStore'
import { alertasVitales, imc, ultimoVital, useVitales, Vitales } from './vitalesStore'

// SIGNOS VITALES (enfermería): toma rápida en sala de espera / terreno. Carga numérica →
// IMC y alertas en vivo → guarda en la serie (longitudinal) → informe imprimible.
interface Campo {
  id: keyof Omit<Vitales, 'fecha'>
  label: string
  unidad: string
  paso?: string
}
interface Grupo {
  titulo: string
  campos: Campo[]
}

const GRUPOS: Grupo[] = [
  { titulo: 'Presión y pulso', campos: [
    { id: 'taSist', label: 'Presión sistólica', unidad: 'mmHg' },
    { id: 'taDiast', label: 'Presión diastólica', unidad: 'mmHg' },
    { id: 'fc', label: 'Frecuencia cardíaca', unidad: 'lpm' },
  ] },
  { titulo: 'Antropometría', campos: [
    { id: 'peso', label: 'Peso', unidad: 'kg', paso: '0.1' },
    { id: 'talla', label: 'Talla', unidad: 'cm' },
    { id: 'perimetro', label: 'Perímetro abdominal', unidad: 'cm' },
  ] },
  { titulo: 'Otros', campos: [
    { id: 'glucemia', label: 'Glucemia capilar', unidad: 'mg/dl' },
    { id: 'spo2', label: 'Saturación (SpO₂)', unidad: '%' },
    { id: 'temp', label: 'Temperatura', unidad: '°C', paso: '0.1' },
  ] },
]

const fmtFecha = (ms: number) => new Date(ms).toLocaleDateString('es-AR')

export function VitalesStep() {
  const { profileId, personId } = useParams()
  const registrar = useVitales((s) => s.registrar)
  const porPersona = useVitales((s) => s.porPersona)
  const cerrarPedido = usePedidos((s) => s.cerrarPedido)
  const { alias, edad } = usePersona(personId)
  const previo = personId ? ultimoVital(porPersona, personId) : undefined

  const [raw, setRaw] = useState<Record<string, string>>({})
  const [modo, setModo] = useState<'cargar' | 'informe'>('cargar')
  const [guardado, setGuardado] = useState<Vitales | null>(null)

  const vitalActual: Vitales = { fecha: 0, ...Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v === '' ? undefined : Number(v)])) }
  const b = imc(vitalActual)
  const alertas = alertasVitales(vitalActual)

  const guardar = () => {
    if (!personId) return
    const v: Vitales = { ...vitalActual, fecha: Date.now() }
    registrar(personId, v)
    for (const alc of ['modulo:vitales', 'test:vitales', 'modulo:signos']) cerrarPedido(`${personId}:pedidoCompletar:${alc}`)
    setGuardado(v)
    setModo('informe')
    window.scrollTo({ top: 0 })
  }

  if (modo === 'informe' && guardado) {
    const alertasG = alertasVitales(guardado)
    const bG = imc(guardado)
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="no-print mb-4 flex items-center gap-2">
          <button onClick={() => setModo('cargar')} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><Pencil size={16} /> Volver a editar</button>
          <button onClick={() => window.print()} className="ml-auto inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white"><Printer size={16} /> Imprimir</button>
        </div>
        <article className="rounded-2xl border border-line bg-surface p-6 print:border-0 print:p-0">
          <header className="border-b-2 border-ink pb-2">
            <p className="text-xs text-muted">Programa de Salud Cerebral · San Juan · KaizenAI</p>
            <h1 className="font-serif text-2xl text-ink">Control de signos vitales</h1>
            <p className="text-sm text-ink">{alias}{edad != null ? ` · ${edad} años` : ''} · {fmtFecha(guardado.fecha)}</p>
          </header>

          {alertasG.length > 0 && (
            <div className="mt-3 rounded-xl border border-rojo bg-rojo/10 p-3">
              <p className="flex items-center gap-1 text-sm font-medium text-rojo-text"><AlertTriangle size={16} /> Valores a revisar</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-ink">{alertasG.map((a, i) => <li key={i}>{a.texto}</li>)}</ul>
            </div>
          )}

          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-ink">
            {GRUPOS.flatMap((g) => g.campos).filter((c) => guardado[c.id] != null).map((c) => (
              <li key={c.id} className="flex justify-between border-b border-line/60 py-1"><span className="text-muted">{c.label}</span><strong>{guardado[c.id]} {c.unidad}</strong></li>
            ))}
            {bG != null && <li className="flex justify-between border-b border-line/60 py-1"><span className="text-muted">IMC</span><strong>{bG}</strong></li>}
          </ul>
          <p className="mt-6 border-t border-line pt-2 text-[11px] text-muted">Toma registrada por enfermería. Se compara con tomas anteriores en el seguimiento.</p>
        </article>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-28">
      <Link to={`/p/${profileId}/alarmas`} className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink no-print"><ArrowLeft size={16} /> Volver</Link>
      <h1 className="flex items-center gap-2 font-serif text-2xl text-ink sm:text-3xl"><Activity className="text-secondary" /> Signos vitales</h1>
      <p className="mt-1 text-sm text-muted">{alias}. {previo ? `Última toma: ${fmtFecha(previo.fecha)}.` : 'Primera toma.'}</p>

      <div className="mt-5 space-y-6">
        {GRUPOS.map((g) => (
          <section key={g.titulo}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{g.titulo}</h2>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {g.campos.map((c) => (
                <label key={c.id} className="block">
                  <span className="text-sm text-ink">{c.label}</span>
                  <span className="mt-1 flex items-center gap-1 rounded-xl border border-line bg-bg px-3 py-2 focus-within:border-secondary">
                    <input
                      type="number"
                      inputMode="decimal"
                      step={c.paso ?? '1'}
                      value={raw[c.id] ?? ''}
                      onChange={(e) => setRaw({ ...raw, [c.id]: e.target.value })}
                      placeholder={previo?.[c.id] != null ? String(previo[c.id]) : '—'}
                      className="w-full bg-transparent text-base text-ink outline-none"
                    />
                    <span className="shrink-0 text-xs text-muted">{c.unidad}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}

        {b != null && (
          <p className="rounded-xl border border-line bg-surface px-4 py-2 text-sm text-ink">IMC: <strong>{b}</strong></p>
        )}
        {alertas.length > 0 && (
          <div className="rounded-xl border border-rojo bg-rojo/10 p-3">
            <p className="flex items-center gap-1 text-sm font-medium text-rojo-text"><AlertTriangle size={16} /> Valores a revisar</p>
            <ul className="mt-1 list-disc pl-5 text-sm text-ink">{alertas.map((a, i) => <li key={i}>{a.texto}</li>)}</ul>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-bg/90 backdrop-blur no-print">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          {alertas.length > 0 && <span className="inline-flex items-center gap-1 text-sm text-rojo-text"><AlertTriangle size={16} /> {alertas.length} alerta(s)</span>}
          <button onClick={guardar} className="ml-auto inline-flex items-center gap-1 rounded-xl bg-primary px-5 py-2.5 font-medium text-white"><Save size={18} /> Guardar e informar</button>
        </div>
      </div>
    </div>
  )
}
