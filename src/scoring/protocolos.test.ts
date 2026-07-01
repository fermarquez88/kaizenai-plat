import { describe, expect, it } from 'vitest'
import { PROTOCOLOS } from './protocolos'
import { BATERIA_BY_ID } from './bateriaNps'

const TARGETS_ESPECIALES = new Set(['ace', 'mmse'])

describe('protocolos interactivos', () => {
  it('toda salida mapea a un test de la batería o a ace/mmse', () => {
    for (const p of Object.values(PROTOCOLOS)) {
      for (const s of p.salidas) {
        expect(BATERIA_BY_ID[s] || TARGETS_ESPECIALES.has(s), `salida inválida: ${p.id} → ${s}`).toBeTruthy()
      }
    }
  })

  it('bruto() devuelve exactamente las salidas declaradas', () => {
    for (const p of Object.values(PROTOCOLOS)) {
      const v = Object.fromEntries(p.items.map((it) => [it.key, 2]))
      const out = p.bruto(v)
      expect(Object.keys(out).sort()).toEqual([...p.salidas].sort())
      for (const n of Object.values(out)) expect(Number.isFinite(n)).toBe(true)
    }
  })

  it('IFS suma /30 y RAVLT calcula total y reconocimiento corregido', () => {
    const ifs = PROTOCOLOS.ifs.bruto({ series: 3, instr: 3, gonogo: 3, diginv: 6, wmverbal: 2, wmvisual: 4, refranes: 3, inhverbal: 6 })
    expect(ifs.ifs).toBe(30)
    const rav = PROTOCOLOS.ravlt.bruto({ t1: 5, t2: 7, t3: 9, t4: 10, t5: 11, dif: 8, recHits: 14, recFp: 3 })
    expect(rav.ravlt_inm).toBe(42)
    expect(rav.ravlt_dif).toBe(8)
    expect(rav.ravlt_rec).toBe(11)
  })
})
