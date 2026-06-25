import { describe, it, expect } from 'vitest'
import { alarmasDeSeed, CAPACIDAD_DEMO, inputFromSeed } from './alarmasFromSeed'
import { SEED_PERSONAS } from '../seed/personas'

// "Ahora" fijo posterior a las fechas del seed (2026) para reproducibilidad.
const NOW = Date.UTC(2026, 5, 25)

const p = (id: string) => SEED_PERSONAS.find((x) => x.id === id)!

describe('alarmasFromSeed — el caso estrella p7 (L. F.) y la cohorte', () => {
  it('p7 deriva las clases esperadas: no-volvió + pedido + brecha + discordancia(anosognosia)', () => {
    const a = alarmasDeSeed([p('p7')], NOW)
    const tipos = a.map((x) => x.tipo)
    expect(tipos).toContain('noVolvio')
    expect(tipos).toContain('pedidoMedicion')
    expect(tipos).toContain('discordancia')

    // HbA1c gris + territorio puede medir → pedido al enfermero
    const hba1c = a.find((x) => x.id === 'p7:pedidoMedicion:hba1c')
    expect(hba1c).toMatchObject({ duenoRol: 'enfermero', accion: 'medir', brechaDeServicio: false })

    // Audición gris + sin audiometría local → BRECHA de servicio (gestor), no carga a la persona
    const audicion = a.find((x) => x.id === 'p7:pedidoMedicion:audicion')
    expect(audicion).toMatchObject({ duenoRol: 'gestor', accion: 'brechaServicio', brechaDeServicio: true })

    // Presión medida vieja (amarillo) → NO genera pedido
    expect(a.some((x) => x.id === 'p7:pedidoMedicion:presionArterial')).toBe(false)

    // Discordancia con informante que convive y reporta peor → señal de anosognosia
    const disc = a.find((x) => x.tipo === 'discordancia')
    expect(disc).toMatchObject({ duenoRol: 'neuropsico', accion: 'mirarJuntos', detalle: 'anosognosia' })
  })

  it('p2 (deterioro rápido) deriva una alarma AGUDA con prioridad de bypass', () => {
    const a = alarmasDeSeed([p('p2')], NOW)
    const aguda = a.find((x) => x.tipo === 'aguda')
    expect(aguda).toMatchObject({ severidad: 'aguda', duenoRol: 'medico' })
    // por bypass, encabeza la cola de p2
    expect(a[0].tipo).toBe('aguda')
  })

  it('la vulnerabilidad territorial de p7 (campo + lejos + baja edu + 78) eleva su equityScore', () => {
    const inp = inputFromSeed(p('p7'), NOW)
    expect(inp.vulnerabilidad).toBeGreaterThanOrEqual(3) // umbral EQUITY_HIGH
  })

  it('la cohorte completa produce una cola no vacía y ordenada por prioridad desc', () => {
    const a = alarmasDeSeed(SEED_PERSONAS, NOW)
    expect(a.length).toBeGreaterThan(0)
    for (let i = 1; i < a.length; i++) expect(a[i - 1].prioridad).toBeGreaterThanOrEqual(a[i].prioridad)
    // las agudas, si las hay, van primero
    expect(a[0].severidad).toBe('aguda')
  })

  it('CAPACIDAD_DEMO marca audición como no medible localmente (genera brechas)', () => {
    expect(CAPACIDAD_DEMO.puedeMedir?.audicion).toBe(false)
    expect(CAPACIDAD_DEMO.puedeMedir?.presionArterial).toBe(true)
  })
})
