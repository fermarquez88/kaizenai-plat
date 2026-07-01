import { useEffect, useRef, useState } from 'react'
import { Check, Minus, Pause, Play, Plus, RotateCcw, X } from 'lucide-react'
import type { Protocolo } from '../../scoring/protocolos'

// Administración INTERACTIVA de un test: steppers / tally / número / cronómetro → bruto(s)
// automáticos. Devuelve un mapa bateriaId→bruto al cerrar (onListo) para puntuar con normas.
export function AdminInteractiva({ protocolo, onListo, onCerrar }: { protocolo: Protocolo; onListo: (brutos: Record<string, number>) => void; onCerrar: () => void }) {
  const [v, setV] = useState<Record<string, number>>({})
  const set = (k: string, n: number) => setV((s) => ({ ...s, [k]: Math.max(0, n) }))
  const brutos = protocolo.bruto(v)

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-bg p-5 sm:rounded-3xl">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink">{protocolo.nombre}</h2>
          <button onClick={onCerrar} aria-label="Cerrar" className="rounded-lg border border-line p-1.5 text-muted hover:text-ink"><X size={18} /></button>
        </div>
        {protocolo.intro && <p className="mb-3 text-sm text-muted">{protocolo.intro}</p>}

        <div className="space-y-3">
          {protocolo.items.map((it) => (
            <div key={it.key} className="rounded-2xl border border-line bg-surface p-3">
              <p className="text-sm font-medium text-ink">{it.label}{it.ayuda ? <span className="text-xs text-muted"> · {it.ayuda}</span> : null}</p>
              {it.tipo === 'stepper' && <Stepper value={v[it.key] ?? 0} max={it.max ?? 10} onChange={(n) => set(it.key, n)} />}
              {it.tipo === 'tally' && <Tally value={v[it.key] ?? 0} onChange={(n) => set(it.key, n)} />}
              {it.tipo === 'num' && <NumInput value={v[it.key]} max={it.max} onChange={(n) => set(it.key, n)} />}
              {it.tipo === 'timer' && <Timer onTick={(s) => set(it.key, s)} />}
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-line bg-surface p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Puntaje bruto</p>
          <ul className="mt-1 text-sm text-ink">
            {Object.entries(brutos).map(([k, n]) => (
              <li key={k} className="flex justify-between"><span className="text-muted">{k}</span><strong>{n}</strong></li>
            ))}
          </ul>
        </div>

        <button onClick={() => onListo(brutos)} className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-primary px-5 py-3 font-medium text-white"><Check size={18} /> Usar estos puntajes</button>
      </div>
    </div>
  )
}

function Stepper({ value, max, onChange }: { value: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {Array.from({ length: max + 1 }, (_, i) => (
        <button key={i} onClick={() => onChange(i)} aria-pressed={value === i}
          className={'h-9 w-9 rounded-lg border text-sm font-medium ' + (value === i ? 'border-secondary bg-secondary text-white' : 'border-line bg-bg text-ink hover:border-secondary')}>
          {i}
        </button>
      ))}
      <span className="ml-1 text-xs text-muted">/ {max}</span>
    </div>
  )
}

function Tally({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="mt-2 flex items-center gap-3">
      <button onClick={() => onChange(value - 1)} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-bg text-ink"><Minus size={20} /></button>
      <span className="min-w-[3ch] text-center font-serif text-3xl text-ink">{value}</span>
      <button onClick={() => onChange(value + 1)} className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-white"><Plus size={26} /></button>
    </div>
  )
}

function NumInput({ value, max, onChange }: { value?: number; max?: number; onChange: (n: number) => void }) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <button onClick={() => onChange(Math.max(0, (value ?? 0) - 1))} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-bg text-ink"><Minus size={18} /></button>
      <input
        type="number"
        inputMode="numeric"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        className="w-20 rounded-xl border border-line bg-bg px-3 py-2 text-center text-lg text-ink outline-none focus:border-secondary"
      />
      <button onClick={() => onChange((value ?? 0) + 1)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-bg text-ink"><Plus size={18} /></button>
      {max != null && <span className="text-xs text-muted">/ {max}</span>}
    </div>
  )
}

function Timer({ onTick }: { onTick: (s: number) => void }) {
  const [s, setS] = useState(0)
  const [run, setRun] = useState(false)
  const ref = useRef<number | null>(null)
  useEffect(() => {
    if (run) ref.current = window.setInterval(() => setS((x) => x + 1), 1000)
    return () => { if (ref.current) window.clearInterval(ref.current) }
  }, [run])
  useEffect(() => { onTick(s) }, [s, onTick])
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return (
    <div className="mt-2 flex items-center gap-3">
      <span className="font-mono text-2xl text-ink">{mm}:{ss}</span>
      <button onClick={() => setRun((r) => !r)} className="inline-flex items-center gap-1 rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-white">
        {run ? <><Pause size={16} /> Pausar</> : <><Play size={16} /> Iniciar</>}
      </button>
      <button onClick={() => { setRun(false); setS(0) }} className="inline-flex items-center gap-1 rounded-xl border border-line px-3 py-2 text-sm text-muted"><RotateCcw size={15} /> Reiniciar</button>
    </div>
  )
}
