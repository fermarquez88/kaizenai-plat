// cognitiveNorms.ts — Norms engine for the M4 neuropsychological module.
// Consumes the verified `normsPack.json` (reverse-engineered + 100% cross-checked vs the
// INECO NPS workbook and 867 real patients). Computes z by per-test demographic-band lookup.
//
// SCORING = ESTIMATION + RATIONALE (CLAUDE.md rule #6). Output is an estimate; band cut-offs
// here are placeholders to validate clinically.
//
// Increment 1 implements the GAUSSIAN rule families that cover the core battery verified
// out-of-sample (RAVLT, Dígitos, TMT, IFS, Memoria de Relatos, ROCF, Fluencias by M/SD):
//   · (raw-M)/SD            — standard
//   · (M-raw)/SD            — time tests (TMT): lower time = better, sign inverted
// Other z_rules (scaled_lookup WAIS, ARM Córdoba, Hayling, Mini-SEA, Stroop-T, ACE-III
// conversion, WCST) are recognised but return a clearly-flagged `unsupported_rule` outcome
// (never a wrong number) until implemented in a later increment.

import rawPack from './normsPack.json'

export type Sexo = 'Mujer' | 'Hombre'
export type Handedness = 'Derecha' | 'Izquierda' | 'Ambas'

export interface Demographics {
  edad?: number
  sexo?: Sexo
  eduAnios?: number
  lateralidad?: Handedness
}

/** Demographic prerequisites the engine may need to pick a norm band. */
export type NormPrereq = 'edad' | 'sexo' | 'eduAnios'

export type CogBand = 'normal' | 'limite' | 'leve' | 'moderado' | 'severo' | 'sin_norma'

export interface CognitiveScore {
  testId: string
  subtest: string
  domain: string
  raw: number
  z: number
  band: CogBand
  marco: string
  /** Human-readable band that was applied, e.g. "70-74 · F" or "65-88 · educ >12". */
  normBand: string
  preliminary: boolean
  rationale: string
  source: string
  caveat?: string
}

export type ScoreOutcome =
  | { ok: true; score: CognitiveScore }
  // The engine declares what it needs and does NOT invent: missing demographics → ask for them.
  | { ok: false; faltan: NormPrereq[] }
  | { ok: false; gap: 'no_test' | 'no_band' | 'unsupported_rule' | 'no_norm'; detail: string }

// ---- pack typing -------------------------------------------------------------------------

interface NormEntry {
  edad_banda?: string
  sexo?: string // 'M' | 'F' | 'ambos'
  educ_banda?: string
  M?: number | null
  SD?: number | null
  [k: string]: unknown
}
interface NormSubtest {
  marco: string
  z_rule: string
  strata: string[]
  domain: string
  source_sheet?: string
  biblio?: string
  notas?: string
  entries?: NormEntry[]
  scaled_table?: unknown
}
interface NormPack {
  meta: Record<string, unknown>
  engine_rules: Record<string, unknown>
  tests: Record<string, Record<string, NormSubtest>>
}

export const PACK = rawPack as unknown as NormPack

// ---- band parsing ------------------------------------------------------------------------

interface Range {
  min: number
  max: number
  minInc: boolean
  maxInc: boolean
}

/**
 * Parse a band label into a numeric range. Handles the heterogeneous labels found across
 * sheets: "70-74", "65-88", "0-3", "8-11", ">12", ">=13", "<8", "<=7" (años text stripped).
 */
export function parseBand(label: string): Range | null {
  const s = String(label).replace(/años|year(s)?/gi, '').trim()
  let m = s.match(/^(\d+)\s*[-–]\s*(\d+)$/)
  if (m) return { min: +m[1], max: +m[2], minInc: true, maxInc: true }
  m = s.match(/^>=\s*(\d+)$/)
  if (m) return { min: +m[1], max: Infinity, minInc: true, maxInc: true }
  m = s.match(/^>\s*(\d+)$/)
  if (m) return { min: +m[1], max: Infinity, minInc: false, maxInc: true }
  m = s.match(/^<=\s*(\d+)$/)
  if (m) return { min: -Infinity, max: +m[1], minInc: true, maxInc: true }
  m = s.match(/^<\s*(\d+)$/)
  if (m) return { min: -Infinity, max: +m[1], minInc: true, maxInc: false }
  return null
}

function inBand(value: number, label?: string): boolean {
  if (!label) return true // entry not stratified on this dimension
  const r = parseBand(label)
  if (!r) return false
  const lo = r.minInc ? value >= r.min : value > r.min
  const hi = r.maxInc ? value <= r.max : value < r.max
  return lo && hi
}

const sexoCode = (s?: Sexo): 'M' | 'F' | undefined =>
  s === 'Mujer' ? 'F' : s === 'Hombre' ? 'M' : undefined

// ---- rule classification -----------------------------------------------------------------

type RuleKind = 'gaussian' | 'gaussian_inverted' | 'unsupported'
function ruleKind(zRule: string): RuleKind {
  if (zRule === '(raw-M)/SD') return 'gaussian'
  if (zRule === '(M-raw)/SD') return 'gaussian_inverted'
  return 'unsupported'
}

/**
 * Classify a z-score into a qualitative band. z is already oriented so that more negative =
 * worse for ALL tests (time tests are sign-inverted upstream). PLACEHOLDER cut-offs.
 */
export function classifyZ(z: number): CogBand {
  if (z >= -1.0) return 'normal'
  if (z >= -1.5) return 'limite'
  if (z >= -2.0) return 'leve'
  if (z >= -2.5) return 'moderado'
  return 'severo'
}

// ---- core ---------------------------------------------------------------------------------

/** Given partial demographics, what is still required to score this (test, subtest)? */
export function requiredPrereqs(testId: string, subtest: string, demo: Demographics): NormPrereq[] {
  const st = PACK.tests[testId]?.[subtest]
  if (!st) return []
  const faltan: NormPrereq[] = []
  if (st.strata.includes('edad_banda') && demo.edad == null) faltan.push('edad')
  if (st.strata.includes('educ_banda') && demo.eduAnios == null) faltan.push('eduAnios')
  // sexo is only needed if, among the age/educ-matching entries, some are sex-specific.
  if (st.strata.includes('sexo') && demo.sexo == null && faltan.length === 0) {
    const cand = (st.entries ?? []).filter(
      (e) => inBand(demo.edad as number, e.edad_banda) &&
             (e.educ_banda == null || (demo.eduAnios != null && inBand(demo.eduAnios, e.educ_banda))),
    )
    const needsSex = cand.length > 0 && cand.every((e) => e.sexo && e.sexo !== 'ambos')
    if (needsSex) faltan.push('sexo')
  }
  return faltan
}

function pickEntry(st: NormSubtest, demo: Demographics): NormEntry | null {
  const cand = (st.entries ?? []).filter(
    (e) =>
      (e.edad_banda == null || (demo.edad != null && inBand(demo.edad, e.edad_banda))) &&
      (e.educ_banda == null || (demo.eduAnios != null && inBand(demo.eduAnios, e.educ_banda))),
  )
  if (cand.length === 0) return null
  const ambos = cand.find((e) => !e.sexo || e.sexo === 'ambos')
  if (ambos) return ambos
  const code = sexoCode(demo.sexo)
  return cand.find((e) => e.sexo === code) ?? null
}

/**
 * Score one (test, subtest) for a raw value + demographics.
 * Returns {ok:false, faltan} when demographics are missing (engine never assumes them),
 * or {ok:false, gap} when there is no usable norm / the rule is not yet implemented.
 */
export function scoreSubtest(
  testId: string,
  subtest: string,
  raw: number,
  demo: Demographics,
): ScoreOutcome {
  const test = PACK.tests[testId]
  if (!test) return { ok: false, gap: 'no_test', detail: testId }
  const st = test[subtest]
  if (!st) return { ok: false, gap: 'no_test', detail: `${testId}/${subtest}` }

  const faltan = requiredPrereqs(testId, subtest, demo)
  if (faltan.length) return { ok: false, faltan }

  const kind = ruleKind(st.z_rule)
  if (kind === 'unsupported') return { ok: false, gap: 'unsupported_rule', detail: st.z_rule }

  const e = pickEntry(st, demo)
  if (!e || e.M == null || e.SD == null || e.SD === 0)
    return { ok: false, gap: 'no_band', detail: `${testId}/${subtest} @ edad=${demo.edad} educ=${demo.eduAnios} sexo=${demo.sexo}` }

  const z = kind === 'gaussian' ? (raw - e.M) / e.SD : (e.M - raw) / e.SD
  const band = classifyZ(z)
  const normBand = [e.edad_banda, e.educ_banda ? `educ ${e.educ_banda}` : null, e.sexo && e.sexo !== 'ambos' ? e.sexo : null]
    .filter(Boolean)
    .join(' · ')
  const preliminary = st.strata.includes('sexo') && e.sexo === 'ambos' && demo.sexo == null

  return {
    ok: true,
    score: {
      testId,
      subtest,
      domain: st.domain,
      raw,
      z: Math.round(z * 1e6) / 1e6,
      band,
      marco: st.marco,
      normBand,
      preliminary,
      rationale: `${testId} ${subtest}: bruto ${raw} vs norma ${normBand} (M=${e.M}, DE=${e.SD}) → z=${z.toFixed(2)} (${band}). Estimación; ${st.z_rule}.`,
      source: st.source_sheet ? `Libro NPS · ${st.source_sheet}` : 'Libro NPS INECO',
      caveat: st.biblio,
    },
  }
}
