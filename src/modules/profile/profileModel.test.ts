import { describe, expect, it } from 'vitest'
import { MODULES, obligatorioWeightTotal, getModule } from './moduleRegistry'
import { computeModuleCompleteness, computePreconsultaPercent, computeProfileRichness, type ProfileItems } from './completeness'
import { canEdit, canView } from './accessMatrix'

const DONE = [{ value: 1 }, { value: 2 }] // a complete module
const PARTIAL = [{ value: 1 }, {}] // one item answered, one pending

// IDs of obligatorio modules that actually carry weight (the núcleo).
const NUCLEO = MODULES.filter((m) => m.tier === 'obligatorio' && m.weight > 0).map((m) => m.id)

function profileWith(ids: string[]): ProfileItems {
  return Object.fromEntries(ids.map((id) => [id, DONE]))
}

describe('moduleRegistry — fiel al mapa', () => {
  it('el núcleo obligatorio pesa exactamente 90', () => {
    expect(obligatorioWeightTotal()).toBe(90)
  })

  it('M4 (NPS) y M15 (dx) son posterior con peso 0; M14 es aparte', () => {
    expect(getModule('M4')?.tier).toBe('posterior')
    expect(getModule('M15')?.tier).toBe('posterior')
    expect(getModule('M4')?.weight).toBe(0)
    expect(getModule('M14')?.tier).toBe('aparte')
  })

  it('los deseables suman 15 (M3-inf, M5-extra, M6-inf)', () => {
    const des = MODULES.filter((m) => m.tier === 'deseable').reduce((a, m) => a + m.weight, 0)
    expect(des).toBe(15)
  })
})

describe('completeness — "Tu chequeo" (preconsulta %)', () => {
  it('núcleo obligatorio completo → 90%', () => {
    expect(computePreconsultaPercent(profileWith(NUCLEO))).toBe(90)
  })

  it('núcleo + 2 deseables → 100% (90 + 5 + 5)', () => {
    expect(computePreconsultaPercent(profileWith([...NUCLEO, 'M3-inf', 'M5-extra']))).toBe(100)
  })

  it('todos los deseables NO pasan de 100 (cap)', () => {
    expect(computePreconsultaPercent(profileWith([...NUCLEO, 'M3-inf', 'M5-extra', 'M6-inf']))).toBe(100)
  })

  it('M4/M15 completos NO suben el % de preconsulta (capa clínica)', () => {
    expect(computePreconsultaPercent(profileWith(['M4', 'M15']))).toBe(0)
  })

  it('perfil vacío → 0%', () => {
    expect(computePreconsultaPercent({})).toBe(0)
  })
})

describe('completeness — por módulo + missing-codes RedLat', () => {
  it('módulo completo si todos los aplicables tienen valor', () => {
    expect(computeModuleCompleteness(DONE).complete).toBe(true)
  })

  it('módulo parcial no está completo', () => {
    const c = computeModuleCompleteness(PARTIAL)
    expect(c.complete).toBe(false)
    expect(c.pct).toBe(0.5)
  })

  it('missing-code 88 (no aplica) se excluye del denominador', () => {
    // 2 items: uno con valor, otro 88 → aplicable=1, answered=1 → completo
    const c = computeModuleCompleteness([{ value: 1 }, { missingCode: 88 }])
    expect(c.applicable).toBe(1)
    expect(c.complete).toBe(true)
  })

  it('missing-code explícito (96=problema cognitivo) cuenta como respondido', () => {
    const c = computeModuleCompleteness([{ value: 1 }, { missingCode: 96 }])
    expect(c.applicable).toBe(2)
    expect(c.answered).toBe(2)
    expect(c.complete).toBe(true)
  })
})

describe('completeness — "Riqueza del perfil" (semáforo)', () => {
  it('verde completo · amarillo parcial · gris vacío', () => {
    const richness = computeProfileRichness({ M1: DONE, M2: PARTIAL })
    const byId = Object.fromEntries(richness.map((r) => [r.moduleId, r.semaforo]))
    expect(byId.M1).toBe('verde')
    expect(byId.M2).toBe('amarillo')
    expect(byId.M9).toBe('gris') // no tocado
  })
})

describe('accessMatrix — rol = vista (reglas duras)', () => {
  it('cuidador NO edita el autorreporte cognitivo de la persona (M3)', () => {
    expect(canEdit('cuidador', 'M3')).toBe(false)
    expect(canView('cuidador', 'M3')).toBe(true)
    expect(canEdit('cuidador', 'M3-inf')).toBe(true) // sí en su canal informante
  })

  it('solo el médico firma dx/etiología (M15); el neuropsico aporta pero no firma', () => {
    expect(canEdit('medico', 'M15')).toBe(true)
    expect(canEdit('neuropsico', 'M15')).toBe(false)
    expect(canView('neuropsico', 'M15')).toBe(true)
  })

  it('el neuropsico edita M4; el cuidador ni lo ve', () => {
    expect(canEdit('neuropsico', 'M4')).toBe(true)
    expect(canView('cuidador', 'M4')).toBe(false)
    expect(canView('persona', 'M4')).toBe(true) // devolución llana
  })

  it('el agente-enfermería edita M9 (pasa vitales a "medido")', () => {
    expect(canEdit('agente', 'M9')).toBe(true)
  })

  it('la persona no participa del módulo cuidador (M14)', () => {
    expect(canView('persona', 'M14')).toBe(false)
    expect(canEdit('cuidador', 'M14')).toBe(true)
  })
})
