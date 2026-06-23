import { describe, expect, it } from 'vitest'
import model from './mrca_model.json'
import { predictMrca, type MrcaRawInputs } from './mrcaModel'

interface Fixture {
  inputs: MrcaRawInputs
  ace_estimado: number
  prob: number
  banda: string
  decision: string
}

const fixtures = (model as unknown as { parity_fixtures: Fixture[] }).parity_fixtures

describe('MRCA modelo real — paridad con el Python congelado', () => {
  fixtures.forEach((fx, i) => {
    it(`fixture ${i}: reproduce ACE, prob, banda y decisión`, () => {
      const p = predictMrca(fx.inputs)
      expect(p.aceEst).toBeCloseTo(fx.ace_estimado, 1)
      expect(p.prob).toBeCloseTo(fx.prob, 2)
      expect(p.band).toBe(fx.banda)
      expect(p.decision).toBe(fx.decision)
    })
  })
})
