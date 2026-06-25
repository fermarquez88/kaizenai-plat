import { describe, it, expect } from 'vitest'
import { avancePerfil, nivelDeAvance } from './avancePerfil'
import type { DomainInputs } from './domainCompleteness'

const empty: DomainInputs = { demo: {}, lancet: {}, instruments: {} }

describe('avancePerfil — niveles cálidos + próxima-mejor-acción', () => {
  it('nivelDeAvance mapea pct a Empezamos/Vamos bien/Perfil completo', () => {
    expect(nivelDeAvance(0)).toBe('empezamos')
    expect(nivelDeAvance(0.2)).toBe('empezamos')
    expect(nivelDeAvance(0.5)).toBe('vamosBien')
    expect(nivelDeAvance(1)).toBe('completo')
  })

  it('perfil vacío → nivel empezamos y la próxima acción es la demografía', () => {
    const a = avancePerfil(empty)
    expect(a.nivel).toBe('empezamos')
    expect(a.proxima).toBe('demografia')
    expect(a.necesario.answered).toBe(0)
  })

  it('con demografía cargada, la próxima acción pasa a Lancet', () => {
    const a = avancePerfil({ ...empty, demo: { edad: 72, sexo: 'Mujer', edu_anios: 4 } })
    expect(a.proxima).toBe('lancet')
    expect(a.necesario.answered).toBe(3)
  })

  it('lo necesario completo → nivel completo y sin próxima acción', () => {
    const lancet: Record<string, string> = {}
    // 14 factores Lancet respondidos
    for (const k of ['education', 'hearing', 'ldl', 'depression', 'tbi', 'inactivity', 'diabetes', 'smoking', 'hypertension', 'obesity', 'alcohol', 'isolation', 'airPollution', 'vision'])
      lancet[k] = 'no'
    const inp: DomainInputs = {
      demo: { edad: 72, sexo: 'Mujer', edu_anios: 4 },
      lancet,
      instruments: { cqc: { 0: 1 }, gds: { 0: 0 }, tadlq: { 0: 0 } },
    }
    const a = avancePerfil(inp)
    expect(a.nivel).toBe('completo')
    expect(a.proxima).toBeNull()
    expect(a.necesario.pct).toBe(1)
  })

  it('estado intermedio → vamosBien con la primera brecha como próxima acción', () => {
    const a = avancePerfil({
      demo: { edad: 72, sexo: 'Mujer', edu_anios: 4 },
      lancet: { education: 'no', hearing: 'si', ldl: 'no', depression: 'no', tbi: 'no', inactivity: 'no', diabetes: 'no', smoking: 'no', hypertension: 'no', obesity: 'no', alcohol: 'no', isolation: 'no', airPollution: 'no', vision: 'no' },
      instruments: {},
    })
    expect(a.nivel).toBe('vamosBien')
    expect(a.proxima).toBe('cqc') // demografía y lancet listos → sigue el primer instrumento núcleo
  })
})
