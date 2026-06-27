import { usePreconsulta } from '../preconsultaStore'

// ESTUDIOS COMPLEMENTARIOS del perfil: evaluación neuropsicológica, imagen (RMN/TC) y
// laboratorio cognitivo. El perfil lipídico se pide siempre; la HbA1c SOLO si la persona es
// diabética (lancet.diabetes==='si'). Alimenta el informe; lo que falte queda como pedido.
interface Selec {
  id: string
  label: string
  opts: [string, string][]
  when?: (estudios: Record<string, string>) => boolean
}
interface Lab {
  id: string
  label: string
  unidad: string
  when?: (diabetico: boolean) => boolean
}

const SELECCIONES: Selec[] = [
  { id: 'neuro', label: '¿Tiene evaluación neuropsicológica?', opts: [['si', 'Sí'], ['no', 'No'], ['pendiente', 'Pedida / pendiente'], ['nose', 'No sé']] },
  { id: 'imagen', label: '¿Se hizo resonancia o tomografía de cerebro?', opts: [['rmn', 'Resonancia (RMN)'], ['tc', 'Tomografía (TC)'], ['no', 'No'], ['pendiente', 'Pedida / pendiente'], ['nose', 'No sé']] },
  { id: 'imagen_hallazgo', label: 'Resultado de la imagen', opts: [['normal', 'Normal'], ['atrofia', 'Atrofia'], ['vascular', 'Lesiones vasculares'], ['otro', 'Otro hallazgo'], ['pendiente', 'Sin informe aún']], when: (e) => e.imagen === 'rmn' || e.imagen === 'tc' },
]

const LABS: Lab[] = [
  { id: 'colesterol', label: 'Colesterol total', unidad: 'mg/dl' },
  { id: 'ldl', label: 'LDL', unidad: 'mg/dl' },
  { id: 'hdl', label: 'HDL', unidad: 'mg/dl' },
  { id: 'trigliceridos', label: 'Triglicéridos', unidad: 'mg/dl' },
  { id: 'hba1c', label: 'HbA1c', unidad: '%', when: (diab) => diab },
  { id: 'tsh', label: 'TSH', unidad: 'µUI/ml' },
  { id: 'b12', label: 'Vitamina B12', unidad: 'pg/ml' },
]

export function EstudiosStep() {
  const estudios = usePreconsulta((s) => s.estudios)
  const setEstudio = usePreconsulta((s) => s.setEstudio)
  const diabetico = usePreconsulta((s) => s.lancet.diabetes) === 'si'

  return (
    <div>
      <h2 className="font-serif text-xl text-ink sm:text-2xl">Estudios y laboratorio</h2>
      <p className="mt-1 text-sm text-muted">
        Si ya te hiciste estudios, cargalos acá. Lo que falte, lo pedimos con el equipo. {diabetico ? 'Como sos diabético/a, sumamos la HbA1c.' : ''}
      </p>

      <div className="mt-5 space-y-5">
        {SELECCIONES.filter((q) => !q.when || q.when(estudios)).map((q) => (
          <fieldset key={q.id}>
            <legend className="text-ink">{q.label}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {q.opts.map(([value, label]) => {
                const on = estudios[q.id] === value
                return (
                  <button key={value} type="button" onClick={() => setEstudio(q.id, value)} aria-pressed={on}
                    className={'rounded-xl border px-4 py-2.5 text-sm ' + (on ? 'border-secondary bg-secondary/10 text-secondary-text' : 'border-line bg-surface text-ink hover:bg-bg')}>
                    {label}
                  </button>
                )
              })}
            </div>
          </fieldset>
        ))}

        <div>
          <p className="text-ink">Laboratorio cognitivo {diabetico ? '(incluye HbA1c)' : '(perfil lipídico)'}</p>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {LABS.filter((l) => !l.when || l.when(diabetico)).map((l) => (
              <label key={l.id} className="block">
                <span className="text-sm text-ink">{l.label}</span>
                <span className="mt-1 flex items-center gap-1 rounded-xl border border-line bg-bg px-3 py-2 focus-within:border-secondary">
                  <input type="number" inputMode="decimal" step="0.1" value={estudios[l.id] ?? ''} onChange={(e) => setEstudio(l.id, e.target.value)} placeholder="—" className="w-full bg-transparent text-base text-ink outline-none" />
                  <span className="shrink-0 text-xs text-muted">{l.unidad}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
