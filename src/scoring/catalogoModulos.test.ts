import { describe, it, expect } from 'vitest'
import {
  CATALOGO_MODULOS,
  esObligatorio,
  modulosOrdenados,
  modulosPorResponsable,
  prioridadDominio,
} from './catalogoModulos'

describe('catalogoModulos — clasificación base por deseabilidad', () => {
  it('ordena de más a menos deseable (prioridad desc)', () => {
    const ord = modulosOrdenados()
    for (let i = 1; i < ord.length; i++) expect(ord[i - 1].prioridad).toBeGreaterThanOrEqual(ord[i].prioridad)
    // lo primero es obligatorio (banderas/identidad), lo último es a-pedido (batería NPS)
    expect(ord[0].tier).toBe('obligatorio')
    expect(ord[ord.length - 1].id).toBe('bateriaNps')
  })

  it('los obligatorios incluyen el núcleo de la consulta + SDOH', () => {
    const oblig = CATALOGO_MODULOS.filter((m) => m.tier === 'obligatorio').map((m) => m.id)
    for (const id of ['identidad', 'lancet', 'cqc', 'gds', 'tadlq', 'banderas', 'sdoh']) expect(oblig).toContain(id)
    expect(esObligatorio('sdoh')).toBe(true)
    expect(esObligatorio('eva')).toBe(false)
  })

  it('el trabajador social es responsable de SDOH y del certificado de discapacidad', () => {
    const suyos = modulosPorResponsable('trabajadorSocial').map((m) => m.id)
    expect(suyos).toContain('sdoh')
    expect(suyos).toContain('cud')
  })

  it('la enfermera es responsable de los vitales (medido)', () => {
    const vit = CATALOGO_MODULOS.find((m) => m.id === 'vitales')!
    expect(vit.responsables).toContain('enfermero')
    expect(vit.via).toBe('medido')
  })

  it('la batería neuropsicológica es vía test y la carga neuropsicología', () => {
    const b = CATALOGO_MODULOS.find((m) => m.id === 'bateriaNps')!
    expect(b.via).toBe('test')
    expect(b.responsables).toEqual(['neuropsico'])
  })

  it('prioridadDominio devuelve la mayor prioridad del dominio (para ordenar la puerta)', () => {
    // social tiene sdoh(92) y soporteSocial(68) → 92
    expect(prioridadDominio('social')).toBe(92)
    expect(prioridadDominio('inexistente')).toBe(0)
  })
})
