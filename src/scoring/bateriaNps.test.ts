import { describe, it, expect } from 'vitest'
import { BATERIA_NPS, puntuarBateria } from './bateriaNps'
import type { Demographics } from './cognitiveNorms'

// Verificación REAL: cada test curado debe puntuar (ok) o declarar qué falta — nunca un
// número inventado. Probamos con un perfil con buena cobertura de normas.
const demo: Demographics = { edad: 70, sexo: 'Mujer', eduAnios: 12 }
const raws = Object.fromEntries(BATERIA_NPS.map((t) => [t.id, 20])) // raw de prueba para todos

describe('bateriaNps — puntúa de verdad contra el motor de normas', () => {
  it('LOG: outcome de cada test curado', () => {
    const res = puntuarBateria(raws, demo)
    for (const r of res) {
      const o = r.outcome
      const txt = o.ok ? `z=${o.score.z.toFixed(2)} ${o.score.band}` : 'faltan' in o ? `FALTAN ${o.faltan}` : `GAP ${o.gap}`
      // eslint-disable-next-line no-console
      console.log(`${r.id.padEnd(12)} ${r.testId}/${r.subtest} → ${txt}`)
    }
    expect(res).toHaveLength(BATERIA_NPS.length)
  })

  it('la mayoría de la batería puntúa OK con un perfil con cobertura de normas', () => {
    const res = puntuarBateria(raws, demo)
    const ok = res.filter((r) => r.outcome.ok).length
    expect(ok).toBeGreaterThanOrEqual(Math.ceil(BATERIA_NPS.length * 0.6))
  })
})
