import { describe, expect, it } from 'vitest'
import {
  LANCET_FACTORS,
  TOTAL_PAF,
  computeModifiableRisk,
  type FactorAnswer,
} from './lancet'

const allAs = (a: FactorAnswer): Record<string, FactorAnswer> =>
  Object.fromEntries(LANCET_FACTORS.map((f) => [f.id, a]))

describe('riesgo modificable (Lancet 2024)', () => {
  it('hay 14 factores y el PAF total es ~45', () => {
    expect(LANCET_FACTORS).toHaveLength(14)
    expect(TOTAL_PAF).toBeGreaterThanOrEqual(40)
    expect(TOTAL_PAF).toBeLessThanOrEqual(50)
  })

  it('sin factores presentes → 0', () => {
    const r = computeModifiableRisk(allAs('no'))
    expect(r.modifiableRiskPct).toBe(0)
    expect(r.share).toBe(0)
    expect(r.topFactors).toHaveLength(0)
  })

  it('todos presentes → PAF total y share 1', () => {
    const r = computeModifiableRisk(allAs('si'))
    expect(r.modifiableRiskPct).toBe(TOTAL_PAF)
    expect(r.share).toBeCloseTo(1)
    expect(r.topFactors).toHaveLength(3)
  })

  it('"no sé" no suma al índice', () => {
    expect(computeModifiableRisk(allAs('nose')).modifiableRiskPct).toBe(0)
  })

  it('los top factors quedan ordenados por PAF descendente', () => {
    const pafs = computeModifiableRisk(allAs('si')).topFactors.map((f) => f.paf)
    expect(pafs).toEqual([...pafs].sort((a, b) => b - a))
  })
})
