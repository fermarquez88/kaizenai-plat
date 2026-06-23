import { describe, expect, it } from 'vitest'
import { computeTriage } from './triage'
import { computeMrca } from './mrca'

describe('triage', () => {
  it('verde: todo bajo, sin banderas', () => {
    const r = computeTriage({ modifiableRiskShare: 0.1, mrcaBand: 'bajo', redFlagsCount: 0, medConcern: false })
    expect(r.level).toBe('verde')
    expect(r.reasons).toContain('low')
  })

  it('rojo: bandera roja presente', () => {
    const r = computeTriage({ modifiableRiskShare: 0.1, mrcaBand: 'bajo', redFlagsCount: 1, medConcern: false })
    expect(r.level).toBe('rojo')
    expect(r.reasons).toContain('redflags')
  })

  it('rojo: MRCA alto', () => {
    const r = computeTriage({ modifiableRiskShare: 0.1, mrcaBand: 'alto', redFlagsCount: 0, medConcern: false })
    expect(r.level).toBe('rojo')
  })

  it('amarillo: MRCA intermedio o riesgo alto o medicación', () => {
    expect(computeTriage({ modifiableRiskShare: 0.1, mrcaBand: 'intermedio', redFlagsCount: 0, medConcern: false }).level).toBe('amarillo')
    expect(computeTriage({ modifiableRiskShare: 0.6, mrcaBand: 'bajo', redFlagsCount: 0, medConcern: false }).level).toBe('amarillo')
    expect(computeTriage({ modifiableRiskShare: 0.1, mrcaBand: 'bajo', redFlagsCount: 0, medConcern: true }).level).toBe('amarillo')
  })

  it('MRCA: bandas por puntaje', () => {
    expect(computeMrca({}).band).toBe('bajo')
    expect(computeMrca({ recent: 1, repeat: 1, words: 1 }).band).toBe('intermedio')
    expect(computeMrca({ recent: 1, repeat: 1, words: 1, orientation: 1, help: 1, slow: 1 }).band).toBe('alto')
  })
})
