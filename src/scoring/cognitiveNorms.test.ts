import { describe, expect, it } from 'vitest'
import { parseBand, classifyZ, requiredPrereqs, scoreSubtest } from './cognitiveNorms'

// Helper: assert an ok outcome and return the score, or fail loudly.
function score(testId: string, subtest: string, raw: number, demo: Parameters<typeof scoreSubtest>[3]) {
  const out = scoreSubtest(testId, subtest, raw, demo)
  if (!out.ok) throw new Error(`expected ok, got ${JSON.stringify(out)}`)
  return out.score
}

describe('parseBand', () => {
  it('parses numeric and open ranges', () => {
    expect(parseBand('70-74')).toMatchObject({ min: 70, max: 74 })
    expect(parseBand('65-88')).toMatchObject({ min: 65, max: 88 })
    expect(parseBand('>12')).toMatchObject({ min: 12, max: Infinity, minInc: false })
    expect(parseBand('>=13')).toMatchObject({ min: 13, minInc: true })
    expect(parseBand('0-3')).toMatchObject({ min: 0, max: 3 })
  })
})

describe('classifyZ (placeholder cut-offs)', () => {
  it('classifies bands', () => {
    expect(classifyZ(0)).toBe('normal')
    expect(classifyZ(-1.2)).toBe('limite')
    expect(classifyZ(-1.7)).toBe('leve')
    expect(classifyZ(-2.48)).toBe('moderado')
    expect(classifyZ(-3)).toBe('severo')
  })
})

// PARITY — the engine must reproduce the values already verified against the Excel + 867 patients.
describe('cognitiveNorms · paridad vs pack verificado', () => {
  it('ROCF Copia (edad 70): z = -1.95 (M 29.57 / DE 3.37, banda 70-74)', () => {
    const s = score('ROCF', 'Copia', 23, { edad: 70, sexo: 'Mujer' })
    expect(s.z).toBeCloseTo(-1.9496, 3)
    expect(s.marco).toBe('estandar')
    expect(s.band).toBe('leve')
  })

  it('RAVLT Inmediato (edad 70, F): z = +0.21 (M 41.6 / DE 6.6, banda 70-74 F)', () => {
    const s = score('RAVLT', 'Inmediato', 43, { edad: 70, sexo: 'Mujer' })
    expect(s.z).toBeCloseTo(0.2121, 3)
    expect(s.normBand).toContain('70-74')
    expect(s.normBand).toContain('F')
    expect(s.band).toBe('normal')
  })

  it('IFS estándar (edad 70, educ 19): z = -2.48 (M 23.7 / DE 3.1, banda 65-88 · educ >12)', () => {
    const s = score('IFS', '_ [estandar]', 16, { edad: 70, eduAnios: 19 })
    expect(s.z).toBeCloseTo(-2.4839, 3)
    expect(s.band).toBe('moderado')
  })

  it('TMT A es invertido (M-raw)/SD: raw 51 @ edad 35 → z = -2.0 (M 30.2 / DE 10.4)', () => {
    const s = score('TMT', 'A', 51, { edad: 35 })
    expect(s.z).toBeCloseTo(-2.0, 6)
  })
})

// CONTRATO DE PREREQUISITOS — el motor pide lo que necesita y nunca asume.
describe('cognitiveNorms · prerequisitos', () => {
  it('RAVLT Inmediato sin sexo en banda sexo-específica → faltan: [sexo]', () => {
    const out = scoreSubtest('RAVLT', 'Inmediato', 43, { edad: 70 })
    expect(out.ok).toBe(false)
    if (!out.ok && 'faltan' in out) expect(out.faltan).toEqual(['sexo'])
    else throw new Error('esperaba faltan:[sexo]')
  })

  it('ROCF Copia sin edad → faltan: [edad]', () => {
    const out = scoreSubtest('ROCF', 'Copia', 23, {})
    expect(out.ok).toBe(false)
    if (!out.ok && 'faltan' in out) expect(out.faltan).toEqual(['edad'])
    else throw new Error('esperaba faltan:[edad]')
  })

  it('IFS estándar sin educación → faltan: [eduAnios]', () => {
    const out = scoreSubtest('IFS', '_ [estandar]', 16, { edad: 70 })
    expect(out.ok).toBe(false)
    if (!out.ok && 'faltan' in out) expect(out.faltan).toContain('eduAnios')
    else throw new Error('esperaba faltan:[eduAnios]')
  })

  it('TMT A NO requiere sexo (bandas colapsadas a "ambos")', () => {
    expect(requiredPrereqs('TMT', 'A', { edad: 35 })).toEqual([])
  })
})

// GAPS — reglas aún no implementadas devuelven un outcome marcado, nunca un número erróneo.
describe('cognitiveNorms · gaps honestos', () => {
  it('Mini-SEA (regla custom) → unsupported_rule', () => {
    const out = scoreSubtest('Mini-SEA', 'Faux Pas', 0, { edad: 70, sexo: 'Mujer' })
    expect(out.ok).toBe(false)
    if (!out.ok && 'gap' in out) expect(out.gap).toBe('unsupported_rule')
    else throw new Error('esperaba gap unsupported_rule')
  })

  it('test inexistente → no_test', () => {
    const out = scoreSubtest('NoExiste', 'x', 1, { edad: 70 })
    expect(out.ok).toBe(false)
    if (!out.ok && 'gap' in out) expect(out.gap).toBe('no_test')
    else throw new Error('esperaba gap no_test')
  })

  it('edad fuera de toda banda → no_band', () => {
    const out = scoreSubtest('ROCF', 'Copia', 23, { edad: 2 })
    expect(out.ok).toBe(false)
    if (!out.ok && 'gap' in out) expect(out.gap).toBe('no_band')
    else throw new Error('esperaba gap no_band')
  })
})
