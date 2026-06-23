// Core entities for the local-first store. Sin PII en el MVP: alias/iniciales.

export type TriageLevel = 'verde' | 'amarillo' | 'rojo'
export type Lang = 'es' | 'en'

export interface Person {
  id: string
  alias: string
  ageYears?: number
  educationYears?: number
  lang: Lang
  createdAt: number
}

export interface PreAssessmentSummary {
  id: string
  personId: string
  createdAt: number
  modifiableRiskIndex?: number // 0..1 (Lancet PAF)
  mrcaBand?: 'bajo' | 'intermedio' | 'alto'
  triage?: TriageLevel
}

// Gobernanza: sugerencias de mejora de la comunidad (co-diseño in-app).
export interface Suggestion {
  id: string
  text: string
  createdAt: number
  votes: number
}
