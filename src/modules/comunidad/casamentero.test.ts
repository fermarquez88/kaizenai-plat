import { describe, expect, it } from 'vitest'
import { PersonaActivos, tejerRed } from './casamentero'
import { PerfilActivos } from './activosStore'

const p = (o: Partial<PerfilActivos>): PerfilActivos => ({ fecha: 0, saberes: [], quiereAprender: [], temas: [], ...o })

const gente: PersonaActivos[] = [
  { id: 'rosa', alias: 'Rosa', perfil: p({ saberes: ['cocina', 'costura'], destacado: 'costura', dispuestoEnsenar: true, temas: ['musica'], movilidad: 'sola' }) },
  { id: 'maria', alias: 'María', perfil: p({ saberes: ['costura'], temas: ['musica'], movilidad: 'noSale', oyeBienTel: true }) },
  { id: 'juan', alias: 'Juan', perfil: p({ quiereAprender: ['costura'], temas: ['futbol'], movilidad: 'noSale', oyeBienTel: true }) },
  { id: 'pedro', alias: 'Pedro', perfil: p({ temas: ['musica'], movilidad: 'noSale', oyeBienTel: true }) },
]

describe('casamentero de red (tejerRed)', () => {
  const red = tejerRed(gente)

  it('Mesa de Saberes por saber compartido (costura: Rosa + María)', () => {
    const mesa = red.find((c) => c.tipo === 'mesa' && c.titulo.includes('Costura'))
    expect(mesa).toBeTruthy()
    expect(mesa!.aliases.sort()).toEqual(['María', 'Rosa'])
  })

  it('Aprendices: Rosa enseña costura → Juan quiere aprender', () => {
    const ap = red.find((c) => c.tipo === 'aprendices')
    expect(ap).toBeTruthy()
    expect(ap!.aliases).toEqual(['Rosa', 'Juan'])
  })

  it('Línea Cálida: María y Pedro no salen y comparten música (Rosa NO, sale)', () => {
    const linea = red.find((c) => c.tipo === 'linea' && c.titulo.includes('Música'))
    expect(linea).toBeTruthy()
    expect(linea!.aliases.sort()).toEqual(['María', 'Pedro'])
    expect(linea!.aliases).not.toContain('Rosa')
  })

  it('Radio Sabiduría lista a los dispuestos a enseñar (Rosa)', () => {
    const radio = red.find((c) => c.tipo === 'radio')
    expect(radio).toBeTruthy()
    expect(radio!.aliases).toContain('Rosa')
  })

  it('sin gente suficiente no inventa conexiones de grupo', () => {
    const solo = tejerRed([gente[2]])
    expect(solo.filter((c) => c.tipo === 'mesa' || c.tipo === 'linea')).toHaveLength(0)
  })
})
