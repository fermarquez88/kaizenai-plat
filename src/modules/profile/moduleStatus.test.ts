import { describe, it, expect } from 'vitest'
import { computeModuleStatus, resumenObligatorios } from './moduleStatus'
import type { DomainInputs } from '../../scoring/domainCompleteness'

const empty: DomainInputs = { demo: {}, lancet: {}, instruments: {} }

describe('moduleStatus — estado vivo de la estructura modular', () => {
  it('perfil vacío → módulos medibles pendientes; capa clínica = otraCapa', () => {
    const s = computeModuleStatus(empty)
    expect(s.M1.estado).toBe('pendiente')
    expect(s.M3.estado).toBe('pendiente')
    expect(s.M4.estado).toBe('otraCapa') // batería NPS = posterior
    expect(s.M15.estado).toBe('otraCapa') // síntesis = posterior
  })

  it('M1 (identidad) hecho cuando edad/sexo/educación están cargados', () => {
    const s = computeModuleStatus({ ...empty, demo: { edad: 72, sexo: 'Mujer', edu_anios: 4 } })
    expect(s.M1).toMatchObject({ estado: 'hecho', answered: 3, total: 3 })
  })

  it('M3 (CQC) empezado cuando hay respuestas parciales', () => {
    const s = computeModuleStatus({ ...empty, instruments: { cqc: { 0: 2, 1: 3 } } })
    expect(s.M3.estado).toBe('empezado')
    expect(s.M3.answered).toBe(2)
    expect(s.M3.total).toBeGreaterThan(2)
  })

  it('M9 (Lancet) hecho cuando los 14 factores están respondidos', () => {
    const lancet: Record<string, string> = {}
    for (const f of LANCET_IDS) lancet[f] = 'no'
    expect(computeModuleStatus({ ...empty, lancet }).M9.estado).toBe('hecho')
  })

  it('M12 (determinantes/SDOH+CUD) refleja lo cargado en sdoh y cud', () => {
    expect(computeModuleStatus(empty).M12.estado).toBe('pendiente')
    const s = computeModuleStatus({ ...empty, sdoh: { agua: 'si', bano: 'si', piso: 'si' }, cud: { persona: 'no' } })
    expect(s.M12.estado).toBe('empezado')
    expect(s.M12.answered).toBe(4)
  })

  it('resumenObligatorios cuenta los obligatorios hechos', () => {
    const r0 = resumenObligatorios(computeModuleStatus(empty))
    expect(r0.hechos).toBe(0)
    expect(r0.total).toBeGreaterThan(0)
    const r1 = resumenObligatorios(computeModuleStatus({ ...empty, demo: { edad: 72, sexo: 'Mujer', edu_anios: 4 } }))
    expect(r1.hechos).toBeGreaterThanOrEqual(1) // al menos M1
  })
})

const LANCET_IDS = ['education', 'hearing', 'ldl', 'depression', 'tbi', 'inactivity', 'diabetes', 'smoking', 'hypertension', 'obesity', 'alcohol', 'isolation', 'airPollution', 'vision']
