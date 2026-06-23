import { describe, expect, it } from 'vitest'
import { computeTriage } from './triage'

const base = {
  modifiableRiskShare: 0.1,
  mrcaBand: 'bajo' as const,
  mrcaDerivar: false,
  redFlagsCount: 0,
  medConcern: false,
}

describe('triage', () => {
  it('verde: todo bajo, sin banderas', () => {
    const r = computeTriage(base)
    expect(r.level).toBe('verde')
    expect(r.reasons).toContain('low')
  })

  it('rojo: bandera roja presente', () => {
    expect(computeTriage({ ...base, redFlagsCount: 1 }).level).toBe('rojo')
  })

  it('rojo: MRCA alto y deriva', () => {
    expect(computeTriage({ ...base, mrcaBand: 'alto', mrcaDerivar: true }).level).toBe('rojo')
  })

  it('amarillo: deriva (banda moderada), riesgo alto o medicación', () => {
    expect(computeTriage({ ...base, mrcaBand: 'moderado', mrcaDerivar: true }).level).toBe('amarillo')
    expect(computeTriage({ ...base, modifiableRiskShare: 0.6 }).level).toBe('amarillo')
    expect(computeTriage({ ...base, medConcern: true }).level).toBe('amarillo')
  })
})
