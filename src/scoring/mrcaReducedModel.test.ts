import { describe, expect, it } from 'vitest'
import { predictMrcaReduced } from './mrcaReducedModel'
import fixtures from './mrca_reducedA6_fixtures.json'

// Paridad TS ↔ artefacto congelado Python (kaizen_mrca_reducedA6_v1.joblib).
// Las fixtures se generaron desde el .joblib (pipeline + isotónica) en el repo de investigación.
describe('mrcaReducedModel — paridad vs artefacto congelado (Python)', () => {
  for (const fx of fixtures as Array<{ in: Record<string, number>; ace: number; prob: number; decision: string }>) {
    it(`reproduce in=${JSON.stringify(fx.in)} → prob ${fx.prob} / ${fx.decision}`, () => {
      const p = predictMrcaReduced({
        edad: fx.in.edad,
        sexo: fx.in.sexo,
        edu_anios: fx.in.edu_anios,
        hipoacusia: fx.in.hipoacusia,
        fumador: fx.in.fumador,
        vive_solo: fx.in.vive_solo,
      })
      expect(p.aceEst).toBeCloseTo(fx.ace, 1)
      expect(p.prob).toBeCloseTo(fx.prob, 3)
      expect(p.decision).toBe(fx.decision)
    })
  }

  it('usa el corte de Bruno por educación (≥12 vs <12)', () => {
    const bajaEd = predictMrcaReduced({ edad: 80, sexo: 1, edu_anios: 7, hipoacusia: 1, fumador: 0, vive_solo: 1 })
    expect(bajaEd.cut).toBe(68)
    const altaEd = predictMrcaReduced({ edad: 60, sexo: 0, edu_anios: 16, hipoacusia: 0, fumador: 0, vive_solo: 0 })
    expect(altaEd.cut).toBe(85)
  })
})
