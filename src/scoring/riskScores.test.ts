import { describe, expect, it } from 'vitest'
import { anuAdri, caide, libra, cogdrisk, computeRiskScores, type RiskInputs } from './riskScores'

// Casos de referencia calculados a mano contra las fuentes verificadas. Si alguien
// toca un peso por error, estos tests lo cazan (rigor: "no inventar").

describe('ANU-ADRI (autorreporte, Anstey 2014 Tabla 2)', () => {
  it('suma los 11 factores con los pesos de la fuente', () => {
    const i: RiskInputs = {
      edad: 72, // banda 2 (70–74) → mujer 14
      sexo: 'Mujer',
      edu_anios: 10, // 8–11 → +3  => 17
      diabetes: true, // +3 => 20
      depresion: true, // +2 => 22
      tec: true, // +4 => 26
      tabaquismo: 'current', // +4 => 30
      actividadFisica: 'medium', // −2 => 28
      actividadCognitiva: 'moderate', // −6 => 22
      redSocial: 'medlow', // +4 => 26
      pescado: '1to2', // −3 => 23
      alcohol: 'lowmod', // −3 => 20
    }
    const r = anuAdri(i)
    expect(r.computable).toBe(true)
    expect(r.value).toBe(20)
  })

  it('no es computable sin edad/sexo/educación', () => {
    expect(anuAdri({ edad: 70, sexo: 'Mujer' }).computable).toBe(false)
  })
})

describe('LIBRA (Schiepers 2018)', () => {
  it('rango completo da +6,8 con todos los modificables activos', () => {
    const i: RiskInputs = {
      actividadCognitiva: 'high', // −3,2
      dieta: 'high', // −1,7
      alcohol: 'lowmod', // −1,0
      depresion: true, // +2,1
      hipertension: true, // +1,6
      bmi: 31, // obeso +1,6
      tabaquismo: 'current', // +1,5
      colesterolDx: true, // +1,4
      diabetes: true, // +1,3
      renal: true, // +1,1
      actividadFisica: 'low', // inactivo +1,1
      cardiopatia: true, // +1,0
    }
    expect(libra(i).value).toBe(6.8)
  })

  it('suma sólo los factores presentes', () => {
    expect(libra({ hipertension: true, diabetes: true, bmi: 31 }).value).toBe(4.5)
  })
})

describe('CAIDE (Kivipelto 2006) — colesterol = 1 punto', () => {
  it('usa mediciones cuando están disponibles', () => {
    const i: RiskInputs = {
      edad: 52, // ≤53 → 3
      edu_anios: 8, // ≥7 → 2
      sexo: 'Hombre', // → 1
      sbp: 150, // >140 → 2
      bmi: 31, // ≥30 → 2
      cholTotalMgdl: 260, // >251 → 1
      actividadFisica: 'low', // inactivo → 1
    }
    const r = caide(i)
    expect(r.value).toBe(12)
    expect(r.detail).toContain('~16,4%')
    expect(r.detail).not.toContain('proxy')
  })

  it('cae a proxy sí/no sin medidas', () => {
    const r = caide({ edad: 52, edu_anios: 8, sexo: 'Hombre', hipertension: true })
    expect(r.detail).toContain('proxy')
  })
})

describe('CogDrisk se deriva a la herramienta oficial (no se inventa)', () => {
  it('nunca es computable internamente', () => {
    const r = cogdrisk({ edad: 70, sexo: 'Mujer' })
    expect(r.computable).toBe(false)
    expect(r.value).toBeNull()
    expect(r.url).toContain('cogdrisk')
  })
})

describe('computeRiskScores', () => {
  it('devuelve LIBRA, CAIDE, ANU-ADRI y CogDrisk en orden', () => {
    const ids = computeRiskScores({ edad: 70, sexo: 'Mujer', edu_anios: 9 }).map((s) => s.id)
    expect(ids).toEqual(['libra', 'caide', 'anu', 'cogdrisk'])
  })
})
