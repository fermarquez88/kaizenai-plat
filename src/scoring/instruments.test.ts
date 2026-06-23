import { describe, expect, it } from 'vitest'
import { INSTRUMENTS, scoreInstrument } from './instruments'

describe('instrumentos validados', () => {
  it('CQC-24: 24 ítems, máximo 96', () => {
    expect(INSTRUMENTS.cqc.items).toHaveLength(24)
    expect(INSTRUMENTS.cqc.max).toBe(96)
    const all = Object.fromEntries(INSTRUMENTS.cqc.items.map((_, i) => [i, 4]))
    expect(scoreInstrument(INSTRUMENTS.cqc, all).score).toBe(96)
  })

  it('GDS-15: reverse-scoring corregido en los ítems positivos [0,4,6,10,12]', () => {
    expect(INSTRUMENTS.gds.invert).toEqual([0, 4, 6, 10, 12])
    // Persona sana: "Sí" en positivos (satisfecho, buen ánimo, feliz, maravilloso,
    // energía) y "No" en el resto → 0 puntos de depresión.
    const sano: Record<number, number> = {}
    INSTRUMENTS.gds.items.forEach((_, i) => {
      sano[i] = [0, 4, 6, 10, 12].includes(i) ? 1 : 0
    })
    expect(scoreInstrument(INSTRUMENTS.gds, sano).score).toBe(0)
    // "Sí" a todo: los 5 positivos invierten a 0, los 10 negativos suman 1 → 10.
    const allYes = Object.fromEntries(INSTRUMENTS.gds.items.map((_, i) => [i, 1]))
    expect(scoreInstrument(INSTRUMENTS.gds, allYes).score).toBe(10)
  })

  it('T-ADLQ-12: 12 ítems, máximo 36', () => {
    expect(INSTRUMENTS.tadlq.items).toHaveLength(12)
    expect(INSTRUMENTS.tadlq.max).toBe(36)
  })

  it('AD8 informante: 8 ítems, corte ≥2', () => {
    expect(INSTRUMENTS.ad8.items).toHaveLength(8)
    expect(scoreInstrument(INSTRUMENTS.ad8, { 0: 1, 1: 1 }).text).toContain('≥2')
  })
})
