import { describe, expect, it } from 'vitest'
import { computeEquity } from './equity'

describe('término de equidad', () => {
  it('sin vulnerabilidad → 0', () => {
    const r = computeEquity({ edad: 60, edu_anios: 16, vive: 'ciudad', cerca: '<15' })
    expect(r.score).toBe(0)
    expect(r.factors).toHaveLength(0)
  })

  it('rural + lejos + baja escolaridad + aislamiento + ≥80 acumulan', () => {
    const r = computeEquity({
      edad: 82,
      edu_anios: 3,
      vive: 'campo',
      cerca: '>60',
      isolation: true,
    })
    // 2 (rural) + 2 (lejos) + 1.5 (bajaEdu) + 1 (aislamiento) + 1 (edad80) = 7.5
    expect(r.score).toBeCloseTo(7.5)
    expect(r.factors).toEqual(['rural', 'lejos', 'bajaEdu', 'aislamiento', 'edad80'])
  })
})
