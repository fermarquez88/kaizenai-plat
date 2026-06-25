import { describe, expect, it } from 'vitest'
import { buildSummary } from './preconsultaSummary'
import type { Factores } from '../scoring/riskScores'

const base = { instruments: {}, factores: {} as Factores, meds: [], redFlags: [] }
const AT = '2026-04-07T00:00:00.000Z'

// Bloquea el WIRING del MRCA reducido (7 preguntas) en buildSummary: el mapeo de inputs
// (sexo Mujer=1 · audición/tabaco/aislamiento desde Lancet) debe reproducir el artefacto.
describe('buildSummary — MRCA 7q (reducido) wiring', () => {
  it('72a · Mujer · 4 educ · audición+tabaco+vive_solo → derivar / alto (prob ~0,816)', () => {
    const s = buildSummary(
      {
        ...base,
        demo: { edad: 72, sexo: 'Mujer', edu_anios: 4 },
        lancet: { hearing: 'si', smoking: 'si', isolation: 'si' },
      },
      AT,
    )
    expect(s.mrcaDecision).toBe('derivar')
    expect(s.mrcaBand).toBe('alto')
    expect(s.mrcaProb).toBeCloseTo(0.816, 2)
  })

  it('faltan datos demográficos → mrcaPreliminary', () => {
    const s = buildSummary({ ...base, demo: {}, lancet: {} }, AT)
    expect(s.mrcaPreliminary).toBe(true)
  })
})
