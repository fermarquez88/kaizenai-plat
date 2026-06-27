import { usePreconsulta } from '../preconsultaStore'
import type { Cerca, Vive } from '../../../scoring/equity'

// M12 — Determinantes sociales (SDOH, subset NBI mínimo) + Certificado de Discapacidad (CUD)
// de la persona y del cuidador. Sale del stub: módulo visible de 1ª clase. Alimenta la
// vulnerabilidad (vive/cerca → equity) y deja los huecos como pedido al trabajador social.
// ⚠️ Taxonomía provisional (NBI), mapeable a SDOH-ReDLat (msoc_*) en el piloto.
type Target = 'demo:vive' | 'demo:cerca' | 'sdoh' | 'cud'
interface Pregunta {
  id: string
  label: string
  target: Target
  opts: [string, string][] // [value, label]
}

const PREGUNTAS: Pregunta[] = [
  { id: 'vive', label: '¿Dónde vivís?', target: 'demo:vive', opts: [['campo', 'En el campo'], ['pueblo', 'En un pueblo'], ['ciudad', 'En la ciudad']] },
  { id: 'cerca', label: '¿A cuánto tenés el centro de salud más cercano?', target: 'demo:cerca', opts: [['<15', 'Menos de 15 min'], ['15-30', '15 a 30 min'], ['30-60', '30 a 60 min'], ['>60', 'Más de 1 hora'], ['nose', 'No sé']] },
  { id: 'agua', label: '¿Tenés agua segura en tu casa?', target: 'sdoh', opts: [['si', 'Sí'], ['no', 'No'], ['nose', 'No sé']] },
  { id: 'bano', label: '¿Tu casa tiene baño con descarga o cloaca?', target: 'sdoh', opts: [['si', 'Sí'], ['no', 'No']] },
  { id: 'piso', label: '¿El piso de tu casa es de material (no de tierra)?', target: 'sdoh', opts: [['si', 'Sí'], ['no', 'No']] },
  { id: 'viveSolo', label: '¿Vivís solo/a?', target: 'sdoh', opts: [['si', 'Sí'], ['no', 'No']] },
  { id: 'ingreso', label: '¿Te alcanza la plata para lo básico del mes?', target: 'sdoh', opts: [['si', 'Sí'], ['aveces', 'A veces'], ['no', 'No']] },
  { id: 'comida', label: '¿Alguna vez se quedaron sin comida por falta de plata?', target: 'sdoh', opts: [['no', 'No'], ['aveces', 'A veces'], ['si', 'Sí, seguido']] },
  { id: 'persona', label: '¿Tenés Certificado de Discapacidad (CUD)?', target: 'cud', opts: [['vigente', 'Sí, vigente'], ['tramite', 'En trámite'], ['vencido', 'Vencido'], ['no', 'No tengo'], ['nose', 'No sé']] },
  { id: 'cuidador', label: 'La persona que te cuida, ¿tiene CUD?', target: 'cud', opts: [['vigente', 'Sí, vigente'], ['tramite', 'En trámite'], ['no', 'No tiene'], ['nose', 'No sé'], ['na', 'No tengo cuidador']] },
]

export function DeterminantesStep() {
  const demo = usePreconsulta((s) => s.demo)
  const sdoh = usePreconsulta((s) => s.sdoh)
  const cud = usePreconsulta((s) => s.cud)
  const setDemo = usePreconsulta((s) => s.setDemo)
  const setSdoh = usePreconsulta((s) => s.setSdoh)
  const setCud = usePreconsulta((s) => s.setCud)

  const valor = (q: Pregunta): string | undefined => {
    if (q.target === 'demo:vive') return demo.vive
    if (q.target === 'demo:cerca') return demo.cerca
    if (q.target === 'cud') return cud[q.id]
    return sdoh[q.id]
  }
  const elegir = (q: Pregunta, value: string) => {
    if (q.target === 'demo:vive') setDemo({ vive: value as Vive })
    else if (q.target === 'demo:cerca') setDemo({ cerca: value as Cerca })
    else if (q.target === 'cud') setCud(q.id, value)
    else setSdoh(q.id, value)
  }

  return (
    <div>
      <h2 className="font-serif text-xl text-ink sm:text-2xl">Tu casa y tu entorno</h2>
      <p className="mt-1 text-sm text-muted">
        Esto nos ayuda a cuidarte mejor y a conseguir los apoyos que te corresponden. Lo que falte, lo vemos con el equipo.
      </p>

      <div className="mt-5 space-y-5">
        {PREGUNTAS.map((q) => (
          <fieldset key={q.id}>
            <legend className="text-ink">{q.label}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {q.opts.map(([value, label]) => {
                const on = valor(q) === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => elegir(q, value)}
                    aria-pressed={on}
                    className={
                      'rounded-xl border px-4 py-2.5 text-sm ' +
                      (on ? 'border-secondary bg-secondary/10 text-secondary-text' : 'border-line bg-surface text-ink hover:bg-bg')
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
    </div>
  )
}
