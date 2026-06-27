import { describe, expect, it } from 'vitest'
import { sugerirConexiones } from './match'
import { PerfilActivos } from './activosStore'

const base: PerfilActivos = { fecha: 0, saberes: [], quiereAprender: [], temas: [] }

describe('casamentero (sugerirConexiones)', () => {
  it('un saber + dispuesto a enseñar → Radio primero y Aprendices presente', () => {
    const r = sugerirConexiones({ ...base, saberes: ['cocina'], destacado: 'cocina', dispuestoEnsenar: true })
    expect(r.sugerencias[0].idea).toBe('radio')
    expect(r.sugerencias.some((s) => s.idea === 'aprendices')).toBe(true)
    expect(r.sugerencias[0].motivo.toLowerCase()).toContain('cocinar')
  })

  it('movilidad nula + oye bien → ofrece Línea Cálida y Mesa como anfitrión', () => {
    const r = sugerirConexiones({ ...base, saberes: ['musica'], temas: ['musica'], movilidad: 'noSale', oyeBienTel: true })
    expect(r.sugerencias.some((s) => s.idea === 'linea')).toBe(true)
    const mesa = r.sugerencias.find((s) => s.idea === 'mesa')
    expect(mesa?.titulo).toContain('en tu casa')
  })

  it('no oye por teléfono → NO ofrece Línea Cálida', () => {
    const r = sugerirConexiones({ ...base, saberes: ['campo'], movilidad: 'noSale', oyeBienTel: false })
    expect(r.sugerencias.some((s) => s.idea === 'linea')).toBe(false)
  })

  it('siente que es una carga → flag de reencuadre y sube prioridad de Radio', () => {
    const conCarga = sugerirConexiones({ ...base, saberes: ['relatos'], dispuestoEnsenar: true, sienteCarga: true })
    const sinCarga = sugerirConexiones({ ...base, saberes: ['relatos'], dispuestoEnsenar: true, sienteCarga: false })
    expect(conCarga.reencuadre).toBe(true)
    expect(sinCarga.reencuadre).toBe(false)
    const pCon = conCarga.sugerencias.find((s) => s.idea === 'radio')!.prioridad
    const pSin = sinCarga.sugerencias.find((s) => s.idea === 'radio')!.prioridad
    expect(pCon).toBeGreaterThan(pSin)
  })

  it('quiere aprender algo → aparece match de aprendiz con ese tema', () => {
    const r = sugerirConexiones({ ...base, quiereAprender: ['guitarra'] })
    expect(r.sugerencias.some((s) => s.idea === 'aprendices' && s.motivo.includes('guitarra'))).toBe(true)
  })
})
