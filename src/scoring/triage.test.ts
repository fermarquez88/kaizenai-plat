import { describe, expect, it } from 'vitest'
import { computeTriage } from './triage'

const base = {
  modifiableRiskShare: 0.1,
  mrcaBand: 'bajo' as const,
  mrcaDerivar: false,
  redFlagsCount: 0,
  medConcern: false,
  equityScore: 0,
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

  it('amarillo: deriva, riesgo alto o medicación', () => {
    expect(computeTriage({ ...base, mrcaBand: 'moderado', mrcaDerivar: true }).level).toBe('amarillo')
    expect(computeTriage({ ...base, modifiableRiskShare: 0.6 }).level).toBe('amarillo')
    expect(computeTriage({ ...base, medConcern: true }).level).toBe('amarillo')
  })

  it('equidad: vulnerabilidad alta + señal mínima sube verde→amarillo', () => {
    // riesgo modificable 0.4 (señal) + equidad alta → amarillo por equidad
    const r = computeTriage({ ...base, modifiableRiskShare: 0.4, equityScore: 4 })
    expect(r.level).toBe('amarillo')
    expect(r.reasons).toContain('equidad')
    // equidad alta SIN ninguna señal → sigue verde (no sobre-derivar)
    expect(computeTriage({ ...base, equityScore: 5 }).level).toBe('verde')
  })
})
