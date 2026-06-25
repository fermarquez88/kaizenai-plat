import { describe, expect, it } from 'vitest'
import { computeDomainCompleteness, type DomainInputs } from './domainCompleteness'

const empty: DomainInputs = { demo: {}, lancet: {}, instruments: {} }
const full = (n: number) => Object.fromEntries(Array.from({ length: n }, (_, i) => [i, 1]))
const allLancet = () =>
  Object.fromEntries(
    ['education', 'hearing', 'ldl', 'depression', 'tbi', 'inactivity', 'diabetes', 'smoking',
     'hypertension', 'obesity', 'alcohol', 'isolation', 'airPollution', 'vision'].map((k) => [k, 'no']),
  )

const get = (r: ReturnType<typeof computeDomainCompleteness>, id: string) => r.domains.find((d) => d.id === id)!

describe('domainCompleteness', () => {
  it('perfil vacío → 0% total, lancet 0/14, mrca 0/7', () => {
    const r = computeDomainCompleteness(empty)
    expect(r.total.pct).toBe(0)
    expect(r.lancet).toEqual({ answered: 0, total: 14 })
    expect(r.mrca.total).toBe(6)
    expect(r.mrca.answered).toBe(0)
    expect(get(r, 'sueno').started).toBe(false)
  })

  it('identidad: 3 campos demográficos', () => {
    const r = computeDomainCompleteness({ ...empty, demo: { edad: 70, sexo: 'Mujer', edu_anios: 12 } })
    expect(get(r, 'identidad')).toMatchObject({ answered: 3, total: 3, pct: 1 })
  })

  it('CQC completo → dominio cognitivo 100%', () => {
    const r = computeDomainCompleteness({ ...empty, instruments: { cqc: full(24) } })
    const cog = get(r, 'cognitivo')
    expect(cog.pct).toBe(1)
    expect(cog.total).toBe(24)
  })

  it('Lancet completo → física llena y lancet 14/14', () => {
    const r = computeDomainCompleteness({ ...empty, lancet: allLancet() })
    expect(r.lancet).toEqual({ answered: 14, total: 14 })
    expect(get(r, 'fisica').pct).toBe(1)
  })

  it('obligatorios MRCA (7q) = edad/sexo/educación + audición/tabaco/vive_solo', () => {
    const r = computeDomainCompleteness({
      demo: { edad: 70, sexo: 'Mujer', edu_anios: 7 },
      lancet: { hearing: 'si', smoking: 'no', isolation: 'no' },
      instruments: {},
    })
    expect(r.mrca).toEqual({ answered: 6, total: 6 })
  })

  it('instrumento OPCIONAL no iniciado no infla el total (sueño)', () => {
    const sinISI = computeDomainCompleteness(empty)
    const conISI = computeDomainCompleteness({ ...empty, instruments: { isi: full(7) } })
    expect(get(sinISI, 'sueno').total).toBe(0)
    expect(get(conISI, 'sueno')).toMatchObject({ total: 7, answered: 7, pct: 1 })
  })
})
