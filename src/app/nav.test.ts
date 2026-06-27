import { describe, it, expect } from 'vitest'
import { breadcrumbs, backTo } from './nav'
import { LENTES, lenteDe, rutaDe } from './lentes'

describe('lentes — matriz declarativa', () => {
  it('mapea profileId a su lente y rol; default seguro', () => {
    expect(lenteDe('enfermeria').rol).toBe('enfermero')
    expect(lenteDe('social').rol).toBe('trabajadorSocial')
    expect(lenteDe('paciente').rol).toBe('diada')
    expect(lenteDe('desconocido').id).toBe('agente') // default seguro
  })

  it('hay 9 lentes; el HILO (díada) no tiene barra, el CUADERNO (equipo) tiene 1-4', () => {
    expect(Object.keys(LENTES)).toHaveLength(9)
    for (const l of Object.values(LENTES)) {
      expect(l.nav.length).toBeLessThanOrEqual(4)
      if (l.modo === 'hilo') expect(l.nav.length).toBe(0)
      else expect(l.nav.length).toBeGreaterThan(0)
    }
  })

  it('rutaDe construye rutas relativas y absolutas', () => {
    expect(rutaDe('agente', '')).toBe('/p/agente')
    expect(rutaDe('agente', 'alarmas')).toBe('/p/agente/alarmas')
    expect(rutaDe('comunidad', '/gobernanza')).toBe('/gobernanza')
  })
})

describe('nav — migas de pan + back anclado (regla de oro)', () => {
  it('home de lente: Inicio › Lente', () => {
    const c = breadcrumbs('/p/agente')
    expect(c.map((x) => x.to)).toEqual(['/inicio', '/p/agente'])
  })

  it('módulo con padre lógico: Inicio › Lente › padre › actual', () => {
    const c = breadcrumbs('/p/unidad/pedir/p7')
    expect(c.map((x) => x.label)).toEqual(['nav.crumb.inicio', 'nav.lente.unidad', 'nav.crumb.alarmas', 'nav.crumb.pedir'])
  })

  it('ficha cuelga de la lista (mi gente), no es callejón', () => {
    const c = breadcrumbs('/p/agente/ficha/p3')
    expect(c.some((x) => x.label === 'nav.crumb.gente')).toBe(true)
  })

  it('backTo sube un nivel, nunca al limbo', () => {
    expect(backTo('/p/unidad/pedir/p7')).toBe('/p/unidad/alarmas') // sube al padre (cola), no a -1
    expect(backTo('/p/agente')).toBe('/inicio')
    expect(backTo('/perfil')).toBe('/inicio')
  })

  it('rutas globales conocidas aparecen como miga', () => {
    expect(breadcrumbs('/perfil').map((x) => x.label)).toEqual(['nav.crumb.inicio', 'nav.crumb.perfil'])
  })
})
