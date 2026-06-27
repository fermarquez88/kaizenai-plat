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

  it('AUDIT-C: 3 ítems, máx 12, corte de riesgo ≥4', () => {
    expect(INSTRUMENTS.auditc.items).toHaveLength(3)
    expect(INSTRUMENTS.auditc.itemOptions).toHaveLength(3)
    expect(scoreInstrument(INSTRUMENTS.auditc, { 0: 2, 1: 1, 2: 1 }).text).toContain('riesgo')
    expect(scoreInstrument(INSTRUMENTS.auditc, { 0: 1, 1: 0, 2: 0 }).text).toContain('bajo riesgo')
  })

  it('FRAIL: 5 ítems sí/no, ≥3 fragilidad', () => {
    expect(INSTRUMENTS.frail.items).toHaveLength(5)
    expect(scoreInstrument(INSTRUMENTS.frail, { 0: 1, 1: 1, 2: 1 }).text).toContain('fragilidad')
    expect(scoreInstrument(INSTRUMENTS.frail, { 0: 0, 1: 0 }).text).toContain('robusto')
  })

  it('MNA-SF: 6 ítems, máx 14, ≤7 malnutrición', () => {
    expect(INSTRUMENTS.mnasf.items).toHaveLength(6)
    expect(INSTRUMENTS.mnasf.itemOptions).toHaveLength(6)
    const todoMin = Object.fromEntries(INSTRUMENTS.mnasf.items.map((_, i) => [i, 0]))
    expect(scoreInstrument(INSTRUMENTS.mnasf, todoMin).text).toContain('malnutrición')
  })

  it('escalas del cuidador (kaizen-cuidadores): PHQ-9, autoeficacia, Duke, PAC', () => {
    expect(INSTRUMENTS.phq9.items).toHaveLength(9)
    expect(scoreInstrument(INSTRUMENTS.phq9, { 0: 3, 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3 }).text).toContain('grave')
    expect(INSTRUMENTS.autoeficacia.items).toHaveLength(10)
    expect(scoreInstrument(INSTRUMENTS.autoeficacia, Object.fromEntries(INSTRUMENTS.autoeficacia.items.map((_, i) => [i, 100]))).text).toContain('alta')
    expect(INSTRUMENTS.apoyoSocial.items).toHaveLength(11)
    expect(scoreInstrument(INSTRUMENTS.apoyoSocial, { 0: 1, 1: 1, 2: 1 }).text).toContain('bajo')
    expect(INSTRUMENTS.pac.items).toHaveLength(9)
  })
})
