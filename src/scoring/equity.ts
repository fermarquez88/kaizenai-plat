// Término de equidad (portado de "Acompañar v0.5"): visibiliza la vulnerabilidad
// territorial/social que el modelo clínico no ve, para no dejar atrás a quien más
// barreras de acceso tiene. ⚠️ Pesos orientativos, a validar localmente.

export type Vive = 'campo' | 'pueblo' | 'ciudad'
export type Cerca = '<15' | '15-30' | '30-60' | '>60' | 'nose'

export interface EquityInputs {
  edad?: number
  edu_anios?: number
  vive?: Vive
  cerca?: Cerca
  isolation?: boolean
}

export interface EquityResult {
  score: number
  /** códigos de factor → i18n equity.factors.<code> */
  factors: string[]
}

export const EQUITY_HIGH = 3

export function computeEquity(i: EquityInputs): EquityResult {
  let score = 0
  const factors: string[] = []
  if (i.vive === 'campo') {
    score += 2
    factors.push('rural')
  }
  if (i.cerca === '>60') {
    score += 2
    factors.push('lejos')
  } else if (i.cerca === '30-60') {
    score += 1
    factors.push('lejos')
  }
  if (i.edu_anios != null) {
    if (i.edu_anios < 7) {
      score += 1.5
      factors.push('bajaEdu')
    } else if (i.edu_anios < 12) {
      score += 0.5
      factors.push('edu')
    }
  }
  if (i.isolation) {
    score += 1
    factors.push('aislamiento')
  }
  if (i.edad != null && i.edad >= 80) {
    score += 1
    factors.push('edad80')
  }
  return { score: Math.round(score * 10) / 10, factors }
}
