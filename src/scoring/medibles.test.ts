import { describe, it, expect } from 'vitest'
import {
  agregarPunto,
  confiabilidad,
  CATALOGO_MEDIBLES,
  DIA_MS,
  mapaConfiabilidad,
  perfilVacio,
  ultimoPunto,
  type Medible,
} from './medibles'

const NOW = 1_700_000_000_000
const med = (tipo: Medible['tipo'], puntos: Medible['puntos']): Medible => ({
  tipo,
  unidad: 'x',
  puntos,
})

describe('medibles — serie append-only con procedencia', () => {
  it('perfilVacio devuelve el catálogo completo, todo gris (nunca medido)', () => {
    const p = perfilVacio()
    expect(p).toHaveLength(CATALOGO_MEDIBLES.length)
    expect(p.every((m) => confiabilidad(m, NOW) === 'gris')).toBe(true)
  })

  it('ultimoPunto devuelve el más reciente sin asumir orden de inserción', () => {
    const m = med('ldl', [
      { valor: 100, fecha: NOW - 30 * DIA_MS, autorRol: 'enfermero', procedencia: 'medido' },
      { valor: 120, fecha: NOW - 5 * DIA_MS, autorRol: 'enfermero', procedencia: 'medido' },
      { valor: 110, fecha: NOW - 20 * DIA_MS, autorRol: 'enfermero', procedencia: 'medido' },
    ])
    expect(ultimoPunto(m)?.valor).toBe(120)
  })

  it('agregarPunto NO pisa la serie (append-only, inmutable)', () => {
    const m = med('imc', [{ valor: 25, fecha: NOW - 10 * DIA_MS, autorRol: 'enfermero', procedencia: 'medido' }])
    const m2 = agregarPunto(m, { valor: 26, fecha: NOW, autorRol: 'enfermero', procedencia: 'medido' })
    expect(m.puntos).toHaveLength(1) // original intacto
    expect(m2.puntos).toHaveLength(2)
    expect(ultimoPunto(m2)?.valor).toBe(26)
  })

  it('confiabilidad: medido reciente=verde, reportado=amarillo, medido viejo=amarillo, vacío=gris', () => {
    expect(confiabilidad(med('hba1c', []), NOW)).toBe('gris')
    expect(
      confiabilidad(med('hba1c', [{ valor: 7, fecha: NOW - 10 * DIA_MS, autorRol: 'enfermero', procedencia: 'medido' }]), NOW),
    ).toBe('verde')
    expect(
      confiabilidad(med('hba1c', [{ valor: 7, fecha: NOW - 10 * DIA_MS, autorRol: 'diada', procedencia: 'reportado' }]), NOW),
    ).toBe('amarillo')
    expect(
      confiabilidad(med('hba1c', [{ valor: 7, fecha: NOW - 400 * DIA_MS, autorRol: 'enfermero', procedencia: 'medido' }]), NOW),
    ).toBe('amarillo')
  })

  it('mapaConfiabilidad cuenta estados y expone brechaGris como señal de inequidad', () => {
    const medibles: Medible[] = [
      med('presionArterial', [{ valor: 120, fecha: NOW - 5 * DIA_MS, autorRol: 'enfermero', procedencia: 'medido' }]),
      med('ldl', [{ valor: 100, fecha: NOW, autorRol: 'diada', procedencia: 'reportado' }]),
      med('hba1c', []),
      med('audicion', []),
    ]
    const mapa = mapaConfiabilidad(medibles, NOW)
    expect(mapa).toMatchObject({ verde: 1, amarillo: 1, gris: 2, total: 4 })
    expect(mapa.brechaGris).toBe(0.5)
  })
})
