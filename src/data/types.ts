// Core entities for the local-first store. Sin PII en el MVP: alias/iniciales.
// Se amplían en F1–F5 (PreAssessment, RiskFactors, MedicationList, ScaleResult, etc.).

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
  modifiableRiskIndex?: number // 0..1 (Lancet PAF) — F1
  mrcaBand?: 'bajo' | 'intermedio' | 'alto' // F3
  triage?: TriageLevel // F4
}
