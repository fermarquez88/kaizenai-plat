import type { Person } from './types'

// Interfaz de persistencia. La UI SOLO habla con esta interfaz, nunca con Dexie
// directo, para poder migrar a backend/FHIR sin tocar componentes.
export interface DataRepository {
  listPeople(): Promise<Person[]>
  getPerson(id: string): Promise<Person | undefined>
  upsertPerson(p: Person): Promise<void>
  deletePerson(id: string): Promise<void>
  /** Soberanía: "borrar mis datos". */
  clearAll(): Promise<void>
  /** Export bajo control del usuario. */
  exportJSON(): Promise<string>
}
