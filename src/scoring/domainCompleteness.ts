// domainCompleteness.ts — Completitud del perfil ORGANIZADA POR DOMINIOS de salud cerebral.
// Mapea las escalas/factores que la app ya captura a los dominios funcionales OMS y calcula:
//   · % por dominio  · % total  · obligatorios Lancet (14 factores)  · obligatorios MRCA (7 ítems).
// Puro y testeable; consume el estado de preconsulta (demo + lancet + instruments).
import { INSTRUMENTS } from './instruments'
import { LANCET_FACTORS } from './lancet'

export type Dominio = 'identidad' | 'cognitivo' | 'animo' | 'funcional' | 'sueno' | 'habitos' | 'fisica'

export interface DomainInputs {
  demo: { edad?: number; sexo?: unknown; edu_anios?: number }
  lancet: Record<string, string | undefined>
  instruments: Record<string, Record<number, number>>
}

type DemoField = 'edad' | 'sexo' | 'edu_anios'

interface DomainDef {
  id: Dominio
  demoFields?: DemoField[]
  /** instrumentos NÚCLEO: cuentan siempre al total (se esperan en el perfil). */
  core?: string[]
  /** instrumentos OPCIONALES: cuentan solo si se empezaron a responder. */
  optional?: string[]
  /** dominio de factores Lancet (14). */
  lancet?: boolean
}

// Escalas → dominios de salud cerebral. Extensible: agregar instrumentos/dominios acá.
const DOMAINS: DomainDef[] = [
  { id: 'identidad', demoFields: ['edad', 'sexo', 'edu_anios'] },
  { id: 'cognitivo', core: ['cqc'], optional: ['ad8', 'iqcode'] },
  { id: 'animo', core: ['gds'], optional: ['gad', 'ucla'] },
  { id: 'funcional', core: ['tadlq'], optional: ['faq'] },
  { id: 'sueno', optional: ['isi'] },
  { id: 'habitos', optional: ['mind'] },
  { id: 'fisica', lancet: true },
]

// Obligatorios del modelo MRCA reducido (7 preguntas): edad·sexo·educación + audición·tabaco·vive_solo.
const MRCA_DEMO: DemoField[] = ['edad', 'sexo', 'edu_anios']
const MRCA_LANCET = ['hearing', 'smoking', 'isolation']

export interface DomainResult {
  id: Dominio
  answered: number
  total: number
  pct: number // 0..1
  started: boolean
}
export interface CompletenessResult {
  domains: DomainResult[]
  total: { answered: number; total: number; pct: number }
  lancet: { answered: number; total: number } // 14 factores
  mrca: { answered: number; total: number } // 7 ítems del modelo reducido
}

const demoHas = (inp: DomainInputs, f: DemoField): boolean => inp.demo[f] != null
const instAnswered = (inp: DomainInputs, id: string): number =>
  Object.values(inp.instruments[id] ?? {}).filter((v) => v != null).length
const instItems = (id: string): number => INSTRUMENTS[id]?.items.length ?? 0
const lancetAnswered = (inp: DomainInputs, k: string): boolean => inp.lancet[k] != null

function domainCounts(inp: DomainInputs, d: DomainDef): { answered: number; total: number } {
  let answered = 0
  let total = 0
  for (const f of d.demoFields ?? []) {
    total += 1
    if (demoHas(inp, f)) answered += 1
  }
  for (const id of d.core ?? []) {
    total += instItems(id)
    answered += instAnswered(inp, id)
  }
  for (const id of d.optional ?? []) {
    const started = instAnswered(inp, id) > 0
    if (started) {
      total += instItems(id)
      answered += instAnswered(inp, id)
    }
  }
  if (d.lancet) {
    total += LANCET_FACTORS.length
    answered += LANCET_FACTORS.filter((f) => lancetAnswered(inp, f.id)).length
  }
  return { answered, total }
}

export function computeDomainCompleteness(inp: DomainInputs): CompletenessResult {
  const domains: DomainResult[] = DOMAINS.map((d) => {
    const { answered, total } = domainCounts(inp, d)
    return { id: d.id, answered, total, pct: total ? answered / total : 0, started: answered > 0 }
  })
  const totA = domains.reduce((s, d) => s + d.answered, 0)
  const totT = domains.reduce((s, d) => s + d.total, 0)
  const lancetAns = LANCET_FACTORS.filter((f) => lancetAnswered(inp, f.id)).length
  const mrcaAns =
    MRCA_DEMO.filter((f) => demoHas(inp, f)).length + MRCA_LANCET.filter((k) => lancetAnswered(inp, k)).length
  return {
    domains,
    total: { answered: totA, total: totT, pct: totT ? totA / totT : 0 },
    lancet: { answered: lancetAns, total: LANCET_FACTORS.length },
    mrca: { answered: mrcaAns, total: MRCA_DEMO.length + MRCA_LANCET.length },
  }
}
