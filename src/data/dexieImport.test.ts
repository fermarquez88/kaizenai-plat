import { describe, expect, it } from 'vitest'
import { prepareImport } from './dexieRepo'

const wrap = (obj: object) => JSON.stringify({ kind: 'kaizenai-bundle', version: 1, ...obj })

describe('prepareImport — parse + validación', () => {
  it('acepta un sobre válido y filtra registros mal formados', () => {
    const r = prepareImport(
      wrap({
        people: [
          { id: 'p1', createdAt: 1 },
          { id: '', createdAt: 2 }, // id vacío → descartado
          { createdAt: 3 }, // sin id → descartado
        ],
        preAssessments: [{ id: 'a1', personId: 'p1', createdAt: 1, triage: 'rojo' }],
        suggestions: [{ id: 's1', text: 'hola', createdAt: 1, votes: 0 }],
      }),
    )
    expect(r.people).toHaveLength(1)
    expect(r.assessments).toHaveLength(1)
    expect(r.suggestions).toHaveLength(1)
  })

  it('rechaza JSON ilegible', () => {
    expect(() => prepareImport('{no json')).toThrow()
  })

  it('rechaza sobre no reconocido', () => {
    expect(() => prepareImport(JSON.stringify({ kind: 'otro', people: [] }))).toThrow()
  })

  it('rechaza versión futura', () => {
    expect(() => prepareImport(JSON.stringify({ kind: 'kaizenai-bundle', version: 999 }))).toThrow()
  })

  it('rechaza triage/modo inválidos', () => {
    const r = prepareImport(wrap({ preAssessments: [{ id: 'a', personId: 'p', createdAt: 1, triage: 'azul' }] }))
    expect(r.assessments).toHaveLength(0)
  })
})

describe('prepareImport — hardening', () => {
  it('descarta claves peligrosas (__proto__/constructor) sin contaminar el prototipo', () => {
    const r = prepareImport(
      '{"kind":"kaizenai-bundle","people":[{"id":"p1","createdAt":1,"__proto__":{"polluted":true},"constructor":{"x":1}}]}',
    )
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
    expect(Object.prototype.hasOwnProperty.call(r.people[0], 'polluted')).toBe(false)
  })

  it('trunca strings muy largos (tope 4000)', () => {
    const r = prepareImport(wrap({ people: [{ id: 'p1', createdAt: 1, alias: 'a'.repeat(5000) }] }))
    expect((r.people[0].alias ?? '').length).toBe(4000)
  })

  it('acota la cantidad de registros (tope 10000)', () => {
    const many = Array.from({ length: 10_050 }, (_, i) => ({ id: `p${i}`, createdAt: 1 }))
    const r = prepareImport(wrap({ people: many }))
    expect(r.people.length).toBeLessThanOrEqual(10_000)
  })
})
