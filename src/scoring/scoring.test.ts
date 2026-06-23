import { describe, expect, it } from 'vitest'
import { SCORING_CONFIG } from './scoring.config'

describe('scoring config', () => {
  it('está marcado como placeholder (requiere validación clínica)', () => {
    expect(SCORING_CONFIG.isPlaceholder).toBe(true)
  })

  it('los umbrales de triage están ordenados (amarillo < rojo)', () => {
    expect(SCORING_CONFIG.triage.amarillo).toBeLessThan(SCORING_CONFIG.triage.rojo)
  })
})
