import { describe, expect, it } from 'vitest'
import { fromAssessment, fromSeed } from './redRecords'
import type { PreAssessmentSummary } from '../../data/types'
import { SEED_PERSONAS } from '../../seed/personas'

const DAY = 86_400_000
const NOW = 1_000 * DAY // base temporal fija para los tests

describe('redRecords adapter', () => {
  it('un cribado real sin contacto reciente cuenta los días desde createdAt', () => {
    const a: PreAssessmentSummary = {
      id: 'a',
      personId: 'p',
      createdAt: NOW - 70 * DAY,
      triage: 'rojo',
      mrcaBand: 'alto',
      riskPct: 30,
      alias: 'M. R.',
    }
    const r = fromAssessment(a, NOW)
    expect(r.demo).toBe(false)
    expect(r.daysSinceContact).toBe(70)
    expect(r.estado).toBe('novolvio') // > 60 días
    expect(r.riskPct).toBe(30)
  })

  it('un contacto registrado resetea el "hace N días"', () => {
    const a: PreAssessmentSummary = {
      id: 'a',
      personId: 'p',
      createdAt: NOW - 70 * DAY,
      lastContactAt: NOW - 2 * DAY,
      triage: 'amarillo',
    }
    const r = fromAssessment(a, NOW)
    expect(r.daysSinceContact).toBe(2)
    expect(r.estado).toBe('aldia')
  })

  it('deriva riskPct del índice modificable si no viene explícito', () => {
    const a: PreAssessmentSummary = { id: 'a', personId: 'p', createdAt: NOW, modifiableRiskIndex: 0.18 }
    expect(fromAssessment(a, NOW).riskPct).toBe(18)
  })

  it('las personas seed quedan marcadas como demo', () => {
    const r = fromSeed(SEED_PERSONAS[0])
    expect(r.demo).toBe(true)
    expect(r.alias).toBe(SEED_PERSONAS[0].alias)
  })
})
