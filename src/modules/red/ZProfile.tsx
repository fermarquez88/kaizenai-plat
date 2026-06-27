import type { ResultadoBateria } from '../../scoring/bateriaNps'

// Gráfico de perfil de puntajes z (como el informe del Instituto): una barra por prueba en
// un eje z de −3 a +2, con la línea de corte en −1.5 (Petersen). Rojo = bajo lo esperado.
const ZMIN = -3
const ZMAX = 2
const CUT = -1.5
const pos = (z: number) => ((Math.max(ZMIN, Math.min(ZMAX, z)) - ZMIN) / (ZMAX - ZMIN)) * 100

export function ZProfile({ resultados }: { resultados: ResultadoBateria[] }) {
  const conZ = resultados.filter((r) => r.outcome.ok).map((r) => ({ label: r.label, z: r.outcome.ok ? r.outcome.score.z : 0 }))
  if (!conZ.length) return null
  const cutPct = pos(CUT)
  const zeroPct = pos(0)

  return (
    <div className="mt-3">
      <div className="relative">
        {/* líneas de referencia */}
        <div className="absolute inset-y-0" style={{ left: `${cutPct}%` }} aria-hidden>
          <div className="h-full border-l-2 border-dashed border-rojo/60" />
        </div>
        <div className="absolute inset-y-0" style={{ left: `${zeroPct}%` }} aria-hidden>
          <div className="h-full border-l border-line" />
        </div>
        <ul className="space-y-1.5">
          {conZ.map((r, i) => {
            const bajo = r.z <= CUT
            const p = pos(r.z)
            const desdeCero = Math.min(p, zeroPct)
            const ancho = Math.abs(p - zeroPct)
            return (
              <li key={i} className="grid grid-cols-[42%_1fr] items-center gap-2">
                <span className="truncate text-xs text-ink" title={r.label}>{r.label}</span>
                <span className="relative h-4 rounded bg-bg">
                  <span className={'absolute top-0 h-4 rounded ' + (bajo ? 'bg-rojo/70' : 'bg-secondary/70')} style={{ left: `${desdeCero}%`, width: `${Math.max(1.5, ancho)}%` }} />
                  <span className="absolute -top-0.5 text-[10px] text-muted" style={{ left: `calc(${p}% + 2px)` }}>{r.z.toFixed(1)}</span>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted">
        <span>z −3</span><span className="text-rojo-text">corte −1,5</span><span>0</span><span>+2</span>
      </div>
    </div>
  )
}
