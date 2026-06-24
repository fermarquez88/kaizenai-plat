import type {
  ContactEvent,
  DerivationStatus,
  Person,
  PreAssessmentSummary,
  Suggestion,
  SuggestionStatus,
} from './types'

// Interfaz de persistencia. La UI SOLO habla con esta interfaz, nunca con Dexie
// directo, para poder migrar a backend/FHIR sin tocar componentes.
export interface DataRepository {
  listPeople(): Promise<Person[]>
  getPerson(id: string): Promise<Person | undefined>
  upsertPerson(p: Person): Promise<void>
  deletePerson(id: string): Promise<void>

  savePreAssessment(a: PreAssessmentSummary): Promise<void>
  listPreAssessments(): Promise<PreAssessmentSummary[]>
  /** Historial longitudinal de una persona (re-evaluaciones en el tiempo). */
  listPersonAssessments(personId: string): Promise<PreAssessmentSummary[]>
  /** Lazo cerrado de derivación: emitida → agendada → atendida → cerrada. */
  updateDerivation(id: string, status: DerivationStatus): Promise<void>
  /** Seguimiento real: registra un contacto y resetea el "hace N días". */
  logContact(id: string, ev: ContactEvent): Promise<void>

  addSuggestion(s: Suggestion): Promise<void>
  listSuggestions(): Promise<Suggestion[]>
  voteSuggestion(id: string): Promise<void>
  /** Gobernanza: cierra el ciclo pedido → aceptada → hecha. */
  setSuggestionStatus(id: string, status: SuggestionStatus): Promise<void>

  /** Soberanía: "borrar mis datos". */
  clearAll(): Promise<void>
  /** Export bajo control del usuario (sobre que la persona comparte). */
  exportJSON(): Promise<string>
  /** Importa un sobre de otra persona/actor (bus de integración local-first). */
  importJSON(json: string): Promise<{ people: number; assessments: number; suggestions: number }>
}
