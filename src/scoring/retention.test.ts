import { describe, expect, it } from 'vitest'
import { estadoSeguimiento } from './retention'

describe('estado de seguimiento', () => {
  it('al día ≤30, por vencer 31-60, no volvió >60', () => {
    expect(estadoSeguimiento(5)).toBe('aldia')
    expect(estadoSeguimiento(30)).toBe('aldia')
    expect(estadoSeguimiento(45)).toBe('porvencer')
    expect(estadoSeguimiento(61)).toBe('novolvio')
    expect(estadoSeguimiento(90)).toBe('novolvio')
  })
})
