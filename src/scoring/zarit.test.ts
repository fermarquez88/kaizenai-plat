import { describe, expect, it } from 'vitest'
import { ZARIT_ITEMS, ZARIT_MAX, computeZarit } from './zarit'

const all = (v: number): Record<string, number> =>
  Object.fromEntries(ZARIT_ITEMS.map((id) => [id, v]))

describe('Zarit-12', () => {
  it('12 ítems, máximo 48', () => {
    expect(ZARIT_ITEMS).toHaveLength(12)
    expect(ZARIT_MAX).toBe(48)
  })
  it('todo en 0 → sobrecarga poca', () => {
    expect(computeZarit(all(0)).band).toBe('poca')
  })
  it('todo en 4 → sobrecarga alta', () => {
    const r = computeZarit(all(4))
    expect(r.score).toBe(48)
    expect(r.band).toBe('alta')
  })
  it('bandas por puntaje', () => {
    expect(computeZarit({ time: 4, stress: 4, health: 3 }).band).toBe('moderada') // 11
    expect(computeZarit({ time: 4, stress: 4, health: 4, control: 4, distress: 4, social: 1 }).band).toBe('alta') // 21
  })
})
