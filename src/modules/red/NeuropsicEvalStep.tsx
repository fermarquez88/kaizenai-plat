import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Plus, Save } from 'lucide-react'
import { PACK, scoreSubtest, type Sexo } from '../../scoring/cognitiveNorms'
import { SEED_PERSONAS } from '../../seed/personas'
import { useNeuro, type NeuroResultado } from './neuroStore'
import { usePedidos } from './pedidosStore'

// Carga de la batería neuropsicológica OBJETIVA (M4). Por defecto se ofrecen ACE-III y
// Mini-Mental (cortes clínicos directos); al lado y al final, un panel para AGREGAR tests
// normados (motor cognitiveNorms: RAVLT, TMT, Dígitos, Fluencias, IFS…). El motor NUNCA
// inventa: si faltan datos demográficos, los pide.

// Tests normados soportados (regla gaussiana) descubiertos del pack — no hardcodeo ids.
const SUPPORTED: { tid: string; sub: string }[] = Object.entries(PACK.tests).flatMap(([tid, subs]) =>
  Object.entries(subs)
    .filter(([, st]) => st.z_rule === '(raw-M)/SD' || st.z_rule === '(M-raw)/SD')
    .map(([sub]) => ({ tid, sub })),
)

// Cortes clínicos directos (no dependen de normas demográficas del pack).
const aceBand = (raw: number) => (raw >= 88 ? 'normal' : raw >= 82 ? 'limítrofe' : 'sugiere deterioro')
const mmseBand = (raw: number) => (raw >= 27 ? 'normal' : raw >= 24 ? 'limítrofe' : 'sugiere deterioro')

export function NeuropsicEvalStep() {
  const { profileId, personId } = useParams()
  const navigate = useNavigate()
  const setResultados = useNeuro((s) => s.setResultados)
  const cerrarPedido = usePedidos((s) => s.cerrarPedido)
  const persona = SEED_PERSONAS.find((p) => p.id === personId)
  const alias = persona?.alias ?? personId ?? '—'
  const [sexo, setSexo] = useState<Sexo | ''>('')
  const demo = useMemo(() => ({ edad: persona?.age, eduAnios: persona?.edu, sexo: (sexo || undefined) as Sexo | undefined }), [persona, sexo])

  const [ace, setAce] = useState('')
  const [mmse, setMmse] = useState('')
  const [agregados, setAgregados] = useState<{ tid: string; sub: string; raw: string }[]>([])
  const [sel, setSel] = useState('')

  const agregar = () => {
    if (!sel) return
    const [tid, sub] = sel.split('|')
    if (agregados.some((a) => a.tid === tid && a.sub === sub)) return
    setAgregados((a) => [...a, { tid, sub, raw: '' }])
    setSel('')
  }
  const setRaw = (i: number, raw: string) => setAgregados((a) => a.map((x, j) => (j === i ? { ...x, raw } : x)))

  // Evalúa un test agregado con el motor de normas (z/banda) o reporta qué falta.
  const evalAgregado = (tid: string, sub: string, raw: string): string => {
    const n = Number(raw)
    if (raw === '' || Number.isNaN(n)) return ''
    const r = scoreSubtest(tid, sub, n, demo)
    if (r.ok) return `z = ${r.score.z.toFixed(2)} · ${r.score.band}${r.score.preliminary ? ' (preliminar)' : ''}`
    if ('faltan' in r) return `falta cargar: ${r.faltan.join(', ')}`
    return 'sin norma disponible'
  }

  const guardar = () => {
    if (!personId) return
    const rs: NeuroResultado[] = []
    if (ace !== '' && !Number.isNaN(Number(ace))) rs.push({ testId: 'ACE-III', label: 'ACE-III', raw: Number(ace), band: aceBand(Number(ace)) })
    if (mmse !== '' && !Number.isNaN(Number(mmse))) rs.push({ testId: 'MMSE', label: 'Mini-Mental (MMSE)', raw: Number(mmse), band: mmseBand(Number(mmse)) })
    for (const a of agregados) {
      const n = Number(a.raw)
      if (a.raw === '' || Number.isNaN(n)) continue
      const r = scoreSubtest(a.tid, a.sub, n, demo)
      rs.push({ testId: `${a.tid}/${a.sub}`, label: `${a.tid} · ${a.sub}`, raw: n, ...(r.ok ? { z: r.score.z, band: r.score.band } : {}) })
    }
    setResultados(personId, rs)
    // Cierra los pedidos de evaluación neuropsicológica de esta persona.
    for (const alc of ['test:bateria', 'test:ACE-III', 'test:MMSE']) cerrarPedido(`${personId}:pedidoCompletar:${alc}`)
    navigate(`/p/${profileId}/alarmas`)
  }

  const AgregarPanel = (
    <div className="rounded-xl border border-line bg-bg p-3">
      <p className="text-sm font-medium text-ink">Agregar un test normado</p>
      <div className="mt-2 flex gap-2">
        <select value={sel} onChange={(e) => setSel(e.target.value)} className="flex-1 rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-ink">
          <option value="">Elegí un test…</option>
          {SUPPORTED.map(({ tid, sub }) => (
            <option key={`${tid}|${sub}`} value={`${tid}|${sub}`}>
              {tid} · {sub}
            </option>
          ))}
        </select>
        <button onClick={agregar} disabled={!sel} className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40">
          <Plus size={16} /> Agregar
        </button>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-28">
      <Link to={`/p/${profileId}/alarmas`} className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink no-print">
        <ArrowLeft size={16} /> Volver
      </Link>
      <h1 className="font-serif text-2xl text-ink sm:text-3xl">Batería neuropsicológica</h1>
      <p className="mt-1 text-sm text-muted">{alias}{persona ? ` · ${persona.age} años · ${persona.edu} años de escuela` : ''}. Cargá los puntajes brutos; el sistema calcula la banda normada.</p>

      <div className="mt-3 flex items-center gap-2">
        <label className="text-sm text-muted">Sexo (para normas):</label>
        <select value={sexo} onChange={(e) => setSexo(e.target.value as Sexo | '')} className="rounded-lg border border-line bg-bg px-2 py-1 text-sm text-ink">
          <option value="">—</option>
          <option value="Mujer">Mujer</option>
          <option value="Hombre">Hombre</option>
        </select>
      </div>

      {/* Por defecto: ACE-III + Mini-Mental */}
      <section className="mt-5 space-y-3">
        <div className="rounded-xl border border-line bg-surface p-3">
          <label className="text-sm font-medium text-ink">ACE-III (0-100)</label>
          <div className="mt-1 flex items-center gap-3">
            <input type="number" inputMode="numeric" value={ace} onChange={(e) => setAce(e.target.value)} className="w-28 rounded-lg border border-line bg-bg px-2 py-1.5 text-ink" />
            {ace !== '' && !Number.isNaN(Number(ace)) && <span className="text-sm text-muted">{aceBand(Number(ace))}</span>}
          </div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-3">
          <label className="text-sm font-medium text-ink">Mini-Mental — MMSE (0-30)</label>
          <div className="mt-1 flex items-center gap-3">
            <input type="number" inputMode="numeric" value={mmse} onChange={(e) => setMmse(e.target.value)} className="w-28 rounded-lg border border-line bg-bg px-2 py-1.5 text-ink" />
            {mmse !== '' && !Number.isNaN(Number(mmse)) && <span className="text-sm text-muted">{mmseBand(Number(mmse))}</span>}
          </div>
        </div>
      </section>

      {/* Agregar tests (al lado de los default) */}
      <div className="mt-4">{AgregarPanel}</div>

      {agregados.length > 0 && (
        <section className="mt-4 space-y-3">
          {agregados.map((a, i) => (
            <div key={`${a.tid}/${a.sub}`} className="rounded-xl border border-line bg-surface p-3">
              <label className="text-sm font-medium text-ink">{a.tid} · {a.sub}</label>
              <div className="mt-1 flex items-center gap-3">
                <input type="number" inputMode="numeric" value={a.raw} onChange={(e) => setRaw(i, e.target.value)} className="w-28 rounded-lg border border-line bg-bg px-2 py-1.5 text-ink" />
                <span className="text-sm text-muted">{evalAgregado(a.tid, a.sub, a.raw)}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Y también al final: agregar más tests */}
      <div className="mt-4">{AgregarPanel}</div>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-bg/90 backdrop-blur no-print">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Check size={16} className="text-verde-text" />
          <span className="text-sm text-muted">Cierra el pedido de evaluación al guardar.</span>
          <button onClick={guardar} className="ml-auto inline-flex items-center gap-1 rounded-xl bg-primary px-5 py-2.5 font-medium text-white">
            <Save size={18} /> Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
