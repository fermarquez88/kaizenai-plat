// Core entities for the local-first store. Sin PII en el MVP: alias/iniciales.
// La PERSONA es el bus de integración: su registro la acompaña entre actores
// (se comparte/importa con consentimiento), porque no hay backend central.

export type TriageLevel = 'verde' | 'amarillo' | 'rojo'
export type Lang = 'es' | 'en'
export type Modo = 'persona' | 'cuidador' | 'agente'
export type MrcaBand = 'bajo' | 'moderado' | 'alto'

// Lazo CERRADO de derivación: una derivación que se emite y vuelve con desenlace.
export type DerivationStatus = 'emitida' | 'agendada' | 'atendida' | 'noVino' | 'cerrada'
export const DERIVATION_FLOW: DerivationStatus[] = ['emitida', 'agendada', 'atendida', 'cerrada']

export interface ContactEvent {
  at: number
  channel: 'whatsapp' | 'presencial' | 'telefono' | 'otro'
  note?: string
}

export interface Person {
  id: string
  alias: string
  ageYears?: number
  educationYears?: number
  depto?: string
  phone?: string
  lang: Lang
  createdAt: number
  cuidadorAlias?: string // díada persona↔cuidador
}

// Consentimiento PORTABLE (se serializa a FHIR Consent en el bundle).
export interface ConsentRecord {
  accepted: boolean
  at: number
  version: string
  scope: string
}

export interface PreAssessmentSummary {
  id: string
  personId: string
  createdAt: number
  // resultado
  modifiableRiskIndex?: number // 0..1 (Lancet PAF, poblacional)
  riskPct?: number // factores modificables presentes, %
  mrcaBand?: MrcaBand
  mrcaProb?: number
  triage?: TriageLevel
  medsCount?: number
  redFlagsCount?: number
  // identidad / display (denormalizado para que la red no necesite joins)
  alias?: string
  ageYears?: number
  educationYears?: number
  depto?: string
  phone?: string
  modo?: Modo // quién respondió
  source?: Modo // quién lo capturó
  note?: string
  // díada
  cuidadorAlias?: string
  discrepancia?: boolean // persona↔informante
  // lazo cerrado de derivación
  derivationStatus?: DerivationStatus
  derivationUpdatedAt?: number
  // seguimiento REAL (no mock)
  lastContactAt?: number
  contacts?: ContactEvent[]
}

// Gobernanza: sugerencias de mejora de la comunidad (co-diseño in-app) con
// ciclo pedido → aceptada → hecha (cierra el loop de gobernanza).
export type SuggestionStatus = 'abierta' | 'aceptada' | 'hecha'

export interface Suggestion {
  id: string
  text: string
  createdAt: number
  votes: number
  status?: SuggestionStatus
}

// Sobre serializado que la persona comparte/importa (bus de integración).
export interface KaizenBundle {
  kind: 'kaizenai-bundle'
  version: number
  exportedAt: string
  consent?: ConsentRecord
  people: Person[]
  preAssessments: PreAssessmentSummary[]
  suggestions: Suggestion[]
}
