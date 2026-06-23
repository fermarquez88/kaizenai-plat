import { describe, expect, it } from 'vitest'
import { DRUG_CATALOG, computeMedFlags, type DrugInfo } from './medications'

const byId = (id: string): DrugInfo => {
  const d = DRUG_CATALOG.find((x) => x.id === id)
  if (!d) throw new Error(`droga inexistente: ${id}`)
  return d
}

describe('flags de medicación', () => {
  it('sin medicación: sin flags', () => {
    const f = computeMedFlags([])
    expect(f.count).toBe(0)
    expect(f.anyConcern).toBe(false)
  })

  it('polifarmacia a partir de 5 fármacos', () => {
    const meds = ['enalapril', 'metformina', 'atorvastatina', 'omeprazol', 'aspirina'].map(byId)
    const f = computeMedFlags(meds)
    expect(f.count).toBe(5)
    expect(f.polypharmacy).toBe(true)
  })

  it('carga anticolinérgica alta (ACB ≥ 3)', () => {
    const f = computeMedFlags([byId('amitriptilina')]) // ACB 3
    expect(f.acbTotal).toBe(3)
    expect(f.acbHigh).toBe(true)
    expect(f.anyConcern).toBe(true)
  })

  it('detecta benzodiacepinas y Beers', () => {
    const f = computeMedFlags([byId('clonazepam'), byId('zolpidem')])
    expect(f.bzdCount).toBe(2)
    expect(f.beersCount).toBeGreaterThanOrEqual(2)
  })

  it('el catálogo no tiene ids duplicados', () => {
    const ids = DRUG_CATALOG.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
