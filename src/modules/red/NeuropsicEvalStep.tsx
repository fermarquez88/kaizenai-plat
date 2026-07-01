import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FileText, Pencil, Plus, Printer, Save } from 'lucide-react'
import { BATERIA_NPS, DOMINIOS_NPS, puntuarBateria, type ResultadoBateria } from '../../scoring/bateriaNps'
import type { Sexo } from '../../scoring/cognitiveNorms'
import { PROTOCOLOS } from '../../scoring/protocolos'
import { personaSeed } from '../../seed/personas'
import { AdminInteractiva } from './AdminInteractiva'
import { ZProfile } from './ZProfile'
import { useNeuro, type NeuroResultado } from './neuroStore'
import { usePedidos } from './pedidosStore'

// Evaluación neuropsicológica de PUNTA A PUNTA: cargar tests (ACE-III + Mini-Mental por
// defecto + batería normada) → puntuar con cognitiveNorms (z/banda real) → guardar →
// INFORME imprimible. El motor nunca inventa: si falta una norma para el perfil, lo dice.
const aceBand = (raw: number) => (raw >= 88 ? 'normal' : raw >= 82 ? 'limítrofe' : 'sugiere deterioro')
const mmseBand = (raw: number) => (raw >= 27 ? 'normal' : raw >= 24 ? 'limítrofe' : 'sugiere deterioro')
const ALTERADA = new Set(['limite', 'leve', 'moderado', 'severo'])

function resultadoTexto(r: ResultadoBateria): { z: string; band: string; alterada: boolean } {
  const o = r.outcome
  if (o.ok) return { z: o.score.z.toFixed(2), band: o.score.band, alterada: ALTERADA.has(o.score.band) }
  if ('faltan' in o) return { z: '—', band: `faltan datos (${o.faltan.join(', ')})`, alterada: false }
  return { z: '—', band: 'sin norma para este perfil', alterada: false }
}

export function NeuropsicEvalStep() {
  const { profileId, personId } = useParams()
  const setResultados = useNeuro((s) => s.setResultados)
  const cerrarPedido = usePedidos((s) => s.cerrarPedido)
  const persona = personaSeed(personId)
  const alias = persona?.alias ?? personId ?? '—'

  const [sexo, setSexo] = useState<Sexo | ''>('')
  const [ace, setAce] = useState('')
  const [mmse, setMmse] = useState('')
  const [raws, setRaws] = useState<Record<string, string>>({})
  const [verBateria, setVerBateria] = useState(false)
  const [admin, setAdmin] = useState<string | null>(null) // bateriaId en administración interactiva
  const [modo, setModo] = useState<'cargar' | 'informe'>('cargar')

  const demo = useMemo(() => ({ edad: persona?.age, eduAnios: persona?.edu, sexo: (sexo || undefined) as Sexo | undefined }), [persona, sexo])
  const numericRaws = useMemo(() => {
    const o: Record<string, number> = {}
    for (const [k, v] of Object.entries(raws)) if (v !== '' && !Number.isNaN(Number(v))) o[k] = Number(v)
    return o
  }, [raws])
  const resultados = useMemo(() => puntuarBateria(numericRaws, demo), [numericRaws, demo])

  const setRaw = (id: string, v: string) => setRaws((r) => ({ ...r, [id]: v }))
  const num = (s: string) => (s !== '' && !Number.isNaN(Number(s)) ? Number(s) : null)

  const guardar = () => {
    if (!personId) return
    const rs: NeuroResultado[] = []
    const a = num(ace)
    if (a != null) rs.push({ testId: 'ACE-III', label: 'ACE-III', raw: a, band: aceBand(a) })
    const m = num(mmse)
    if (m != null) rs.push({ testId: 'MMSE', label: 'Mini-Mental (MMSE)', raw: m, band: mmseBand(m) })
    for (const r of resultados) {
      const t = resultadoTexto(r)
      rs.push({ testId: r.id, label: r.label, raw: r.raw, ...(r.outcome.ok ? { z: r.outcome.score.z, band: r.outcome.score.band } : { band: t.band }) })
    }
    setResultados(personId, rs)
    for (const alc of ['test:bateria', 'test:ACE-III', 'test:MMSE']) cerrarPedido(`${personId}:pedidoCompletar:${alc}`)
    setModo('informe')
    window.scrollTo({ top: 0 })
  }

  const aN = num(ace)
  const mN = num(mmse)
  const alteradas = resultados.filter((r) => resultadoTexto(r).alterada).length

  // ── INFORME imprimible ────────────────────────────────────────────────────────────────
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
            <h1 className="font-serif text-2xl text-ink">Informe neuropsicológico</h1>
            <p className="text-sm text-ink">{alias}{persona ? ` · ${persona.age} años · ${persona.edu} años de escuela` : ''}{sexo ? ` · ${sexo}` : ''}</p>
            <p className="mt-1 text-xs text-muted">Normas por edad/sexo/educación (estimación, no diagnóstico).</p>
          </header>

          {(aN != null || mN != null) && (
            <section className="mt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">Cribado global</h2>
              {aN != null && <p className="mt-1 text-sm text-ink">ACE-III: {aN}/100 — {aceBand(aN)}</p>}
              {mN != null && <p className="text-sm text-ink">Mini-Mental (MMSE): {mN}/30 — {mmseBand(mN)}</p>}
            </section>
          )}

          {resultados.length > 0 && (
            <section className="mt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">Pruebas por dominio</h2>
              <table className="mt-2 w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    <th className="py-1">Prueba</th><th className="py-1">Bruto</th><th className="py-1">z</th><th className="py-1">Interpretación</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((r) => {
                    const t = resultadoTexto(r)
                    return (
                      <tr key={r.id} className="border-b border-line/60">
                        <td className="py-1 pr-2 text-ink">{r.label}</td>
                        <td className="py-1 pr-2 text-ink">{r.raw}</td>
                        <td className="py-1 pr-2 text-ink">{t.z}</td>
                        <td className={'py-1 ' + (t.alterada ? 'font-medium text-rojo-text' : 'text-ink')}>{t.band}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </section>
          )}

          {resultados.some((r) => r.outcome.ok) && (
            <section className="mt-4 break-inside-avoid">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">Perfil de puntajes (z)</h2>
              <ZProfile resultados={resultados} />
            </section>
          )}

          <section className="mt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">Síntesis</h2>
            <p className="mt-1 text-sm text-ink">
              {resultados.length === 0 && aN == null && mN == null
                ? 'Sin pruebas cargadas.'
                : `${alteradas} de ${resultados.length} pruebas de la batería por debajo de lo esperado para el perfil.`}
            </p>
          </section>

          <div className="mt-10 flex items-end justify-between gap-6">
            <div className="flex-1 border-t border-ink pt-1 text-center text-xs text-muted">Firma del/la neuropsicólogo/a</div>
            <div className="h-20 w-32 rounded border border-dashed border-line text-center text-[10px] text-muted">Sello</div>
          </div>
          <p className="mt-4 border-t border-line pt-2 text-[11px] text-muted">Estimación basada en normas locales; la interpretación clínica corresponde al profesional firmante.</p>
        </article>
      </div>
    )
  }

  // ── CARGA ─────────────────────────────────────────────────────────────────────────────
  const AgregarBtn = (
    <button onClick={() => setVerBateria((v) => !v)} className="inline-flex items-center gap-1 rounded-xl border border-secondary bg-secondary/10 px-3 py-2 text-sm font-medium text-secondary">
      <Plus size={16} /> {verBateria ? 'Ocultar batería' : 'Agregar tests de la batería'}
    </button>
  )

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-28">
      <Link to={`/p/${profileId}/alarmas`} className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink no-print">
        <ArrowLeft size={16} /> Volver
      </Link>
      <h1 className="font-serif text-2xl text-ink sm:text-3xl">Batería neuropsicológica</h1>
      <p className="mt-1 text-sm text-muted">{alias}{persona ? ` · ${persona.age} años · ${persona.edu} años de escuela` : ''}. Cargá los puntajes brutos; calculamos la banda normada.</p>

      <div className="mt-3 flex items-center gap-2">
        <label className="text-sm text-muted">Sexo (para normas):</label>
        <select value={sexo} onChange={(e) => setSexo(e.target.value as Sexo | '')} className="rounded-lg border border-line bg-bg px-2 py-1 text-sm text-ink">
          <option value="">—</option><option value="Mujer">Mujer</option><option value="Hombre">Hombre</option>
        </select>
      </div>

      {/* Por defecto: ACE-III + Mini-Mental */}
      <section className="mt-5 space-y-3">
        <div className="rounded-xl border border-line bg-surface p-3">
          <label className="text-sm font-medium text-ink">ACE-III (0-100)</label>
          <div className="mt-1 flex items-center gap-3">
            <input type="number" inputMode="numeric" value={ace} onChange={(e) => setAce(e.target.value)} className="w-28 rounded-lg border border-line bg-bg px-2 py-1.5 text-ink" />
            {aN != null && <span className="text-sm text-muted">{aceBand(aN)}</span>}
          </div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-3">
          <label className="text-sm font-medium text-ink">Mini-Mental — MMSE (0-30)</label>
          <div className="mt-1 flex items-center gap-3">
            <input type="number" inputMode="numeric" value={mmse} onChange={(e) => setMmse(e.target.value)} className="w-28 rounded-lg border border-line bg-bg px-2 py-1.5 text-ink" />
            {mN != null && <span className="text-sm text-muted">{mmseBand(mN)}</span>}
          </div>
        </div>
      </section>

      {/* Administración INTERACTIVA: puntás con botones/cronómetro → bruto + z automáticos */}
      <section className="mt-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Administrar un test (interactivo)</h2>
        <p className="text-xs text-muted">Puntás ítem por ítem; el bruto y la banda z (normas El Castaño) se calculan solos.</p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Object.values(PROTOCOLOS).map((p) => (
            <button key={p.id} onClick={() => setAdmin(p.id)} className="flex items-center gap-2 rounded-xl border border-secondary bg-secondary/10 p-3 text-left hover:bg-secondary/20">
              <Plus size={16} className="shrink-0 text-secondary" />
              <span><span className="block text-sm font-medium text-secondary-text">{p.nombre}</span><span className="block text-xs text-muted">{p.dominio}</span></span>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-5">{AgregarBtn}</div>

      {verBateria && (
        <section className="mt-4 space-y-5">
          <p className="text-xs text-muted">Cargá solo las pruebas que administraste. Normas locales (El Castaño) por edad/sexo/educación.</p>
          {DOMINIOS_NPS.map((dom) => {
            const tests = BATERIA_NPS.filter((t) => t.dominio === dom)
            if (!tests.length) return null
            return (
              <div key={dom}>
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-secondary">{dom}</h3>
                <div className="space-y-2">
                  {tests.map((t) => {
                    const r = resultados.find((x) => x.id === t.id)
                    const txt = r ? resultadoTexto(r) : null
                    return (
                      <div key={t.id} className="rounded-xl border border-line bg-surface p-3">
                        <label className="text-sm font-medium text-ink">{t.label}{t.ayuda ? <span className="text-xs text-muted"> · {t.ayuda}</span> : null}</label>
                        <div className="mt-1 flex flex-wrap items-center gap-3">
                          <input type="number" inputMode="numeric" value={raws[t.id] ?? ''} onChange={(e) => setRaw(t.id, e.target.value)} className="w-24 rounded-lg border border-line bg-bg px-2 py-1.5 text-ink" />
                          {txt && <span className={'text-sm ' + (txt.alterada ? 'text-rojo-text' : 'text-muted')}>z {txt.z} · {txt.band}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
          <div className="pt-1">{AgregarBtn}</div>
        </section>
      )}

      {admin && PROTOCOLOS[admin] && (
        <AdminInteractiva
          protocolo={PROTOCOLOS[admin]}
          onCerrar={() => setAdmin(null)}
          onListo={(brutos) => {
            let tocaBateria = false
            for (const [k, n] of Object.entries(brutos)) {
              if (k === 'ace') setAce(String(n))
              else if (k === 'mmse') setMmse(String(n))
              else { setRaw(k, String(n)); tocaBateria = true }
            }
            if (tocaBateria) setVerBateria(true) // muestra de una la z puntuada
            setAdmin(null)
          }}
        />
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-bg/90 backdrop-blur no-print">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <FileText size={16} className="text-secondary" />
          <span className="text-sm text-muted">Guardar genera el informe y cierra el pedido.</span>
          <button onClick={guardar} className="ml-auto inline-flex items-center gap-1 rounded-xl bg-primary px-5 py-2.5 font-medium text-white">
            <Save size={18} /> Guardar e informar
          </button>
        </div>
      </div>
    </div>
  )
}
