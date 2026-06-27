import { describe, expect, it } from 'vitest'
import { alertasVitales, imc } from './vitalesStore'

describe('signos vitales', () => {
  it('IMC: acepta talla en cm o en metros', () => {
    expect(imc({ fecha: 0, peso: 80, talla: 170 })).toBe(27.7)
    expect(imc({ fecha: 0, peso: 80, talla: 1.7 })).toBe(27.7)
    expect(imc({ fecha: 0, peso: 80 })).toBeUndefined()
  })

  it('alertas: HTA, obesidad, glucemia elevada, SpO2 baja, fiebre', () => {
    const a = alertasVitales({ fecha: 0, taSist: 150, taDiast: 95, peso: 95, talla: 165, glucemia: 140, spo2: 90, temp: 38.5 })
    const campos = a.map((x) => x.campo)
    expect(campos).toContain('ta')
    expect(campos).toContain('imc')
    expect(campos).toContain('glucemia')
    expect(campos).toContain('spo2')
    expect(campos).toContain('temp')
  })

  it('valores normales no generan alertas', () => {
    expect(alertasVitales({ fecha: 0, taSist: 120, taDiast: 80, fc: 72, peso: 65, talla: 165, glucemia: 90, spo2: 98, temp: 36.5 })).toHaveLength(0)
  })

  it('glucemia muy alta vs elevada', () => {
    expect(alertasVitales({ fecha: 0, glucemia: 210 })[0].texto).toContain('muy alta')
    expect(alertasVitales({ fecha: 0, glucemia: 140 })[0].texto).toContain('elevada')
  })
})
