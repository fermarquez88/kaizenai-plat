import { useState } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { INSTRUMENTS, scoreInstrument } from '../../scoring/instruments'
import { useEscalas } from './escalasStore'

// Administra UNA escala (de INSTRUMENTS) y guarda el resultado CON FECHA (serie longitudinal).
// Una pregunta a la vez (cálido, baja escolaridad). Sin encuadre de "investigación".
export function EscalaRunner({ scaleId, personId, onDone }: { scaleId: string; personId: string; onDone: () => void }) {
  const inst = INSTRUMENTS[scaleId]
  const agregar = useEscalas((s) => s.agregar)
  const [resp, setResp] = useState<Record<number, number>>({})
  const [i, setI] = useState(0)
  const [listo, setListo] = useState<{ text: string } | null>(null)

  if (!inst) return null
  const total = inst.items.length
  const opts = inst.itemOptions?.[i] ?? inst.options

  const elegir = (v: number) => {
    const next = { ...resp, [i]: v }
    setResp(next)
    if (i < total - 1) {
      setI(i + 1)
    } else {
      const r = scoreInstrument(inst, next)
      agregar(personId, scaleId, { fecha: Date.now(), score: r.score, answered: r.answered, text: r.text })
      setListo({ text: r.text })
    }
  }

  if (listo) {
    return (
      <div className="rounded-2xl border border-verde bg-verde/10 p-5 text-center">
        <p className="flex items-center justify-center gap-2 font-serif text-lg text-verde-text">
          <Check size={20} /> {inst.name}
        </p>
        <p className="mt-1 text-ink">{listo.text}</p>
        <p className="mt-1 text-xs text-muted">Guardado hoy · se compara en el tiempo.</p>
        <button onClick={onDone} className="mt-4 rounded-xl bg-primary px-5 py-2.5 font-medium text-white">Listo</button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="mb-3 flex items-center gap-2">
        <button onClick={onDone} className="text-sm text-muted hover:text-ink"><ArrowLeft size={16} /></button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-secondary" style={{ width: `${Math.round(((i + 1) / total) * 100)}%` }} />
        </div>
        <span className="text-xs text-muted">{i + 1}/{total}</span>
      </div>
      <p className="text-xs font-medium text-secondary">{inst.name}</p>
      <p className="mt-1 font-serif text-lg text-ink">{inst.items[i]}</p>
      <div className="mt-4 flex flex-col gap-2">
        {opts.map((o) => (
          <button
            key={o.value}
            onClick={() => elegir(o.value)}
            className="rounded-xl border border-line bg-bg px-4 py-3 text-left text-base text-ink hover:border-secondary"
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
