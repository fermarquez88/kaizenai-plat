import { describe, expect, it } from 'vitest'
import { scoreIpaq } from './ipaq'

describe('scoreIpaq (IPAQ corto)', () => {
  it('vacío → baja, no answered', () => {
    const r = scoreIpaq({})
    expect(r.categoria).toBe('baja')
    expect(r.answered).toBe(false)
    expect(r.metMin).toBe(0)
  })

  it('vigorosa 3 días × 30 min → moderada (≥3d, ≥20 min)', () => {
    const r = scoreIpaq({ vigDays: 3, vigMin: 30 })
    expect(r.vigMet).toBe(Math.round(8 * 30 * 3)) // 720
    expect(r.categoria).toBe('moderada')
  })

  it('vigorosa 5 días × 60 min → alta (≥3d y ≥1500 MET)', () => {
    const r = scoreIpaq({ vigDays: 5, vigMin: 60 }) // 8*60*5 = 2400
    expect(r.metMin).toBe(2400)
    expect(r.categoria).toBe('alta')
  })

  it('caminar 2 días × 20 min → baja', () => {
    const r = scoreIpaq({ walkDays: 2, walkMin: 20 })
    expect(r.categoria).toBe('baja')
  })

  it('trunca bouts a 180 min y días a 7', () => {
    const r = scoreIpaq({ vigDays: 10, vigMin: 300 }) // → días 7, min 180
    expect(r.vigMet).toBe(Math.round(8 * 180 * 7))
  })

  it('moderada+caminar 5 días ≥30 min → moderada', () => {
    const r = scoreIpaq({ modDays: 3, modMin: 30, walkDays: 2, walkMin: 40 })
    expect(r.categoria).toBe('moderada')
  })
})
