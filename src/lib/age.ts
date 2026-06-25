// age.ts — Edad DERIVADA de la fecha de nacimiento.
// Decisión de registro (2026-06-24): guardar la fecha de nacimiento, no la edad; la edad
// se calcula a cualquier fecha de referencia. Para las normas neuropsico se usa la edad
// AL MOMENTO DEL TEST (no "hoy"), clave en re-evaluaciones longitudinales.
// Equidad: se admite solo el AÑO de nacimiento, o la edad como fallback, con flag de origen.

/** Edad en años cumplidos entre birthISO y atISO (ambos ISO 'YYYY-MM-DD'). */
export function ageYearsAt(birthISO: string, atISO: string): number | null {
  const b = new Date(birthISO)
  const a = new Date(atISO)
  if (Number.isNaN(b.getTime()) || Number.isNaN(a.getTime())) return null
  let age = a.getFullYear() - b.getFullYear()
  const m = a.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && a.getDate() < b.getDate())) age -= 1
  return age < 0 || age > 130 ? null : age
}

/** Edad aproximada a partir del AÑO de nacimiento (cuando no se conoce la fecha exacta). */
export function ageFromBirthYear(birthYear: number, atYear: number): number | null {
  const age = atYear - birthYear
  return age < 0 || age > 130 ? null : age
}

export interface BirthInput {
  /** Fecha de nacimiento ISO 'YYYY-MM-DD' (preferida). */
  birthDate?: string
  /** Solo año de nacimiento (fallback de baja certeza). */
  birthYear?: number
  /** Edad declarada (último fallback, p.ej. mayor que no recuerda DOB). */
  edad?: number
}

export type AgeSource = 'dob' | 'year' | 'edad' | 'none'

/** Resuelve la edad al momento del test con prioridad DOB > año > edad declarada. */
export function resolveAgeAtTest(input: BirthInput, atISO: string): { age: number | null; source: AgeSource } {
  if (input.birthDate) {
    const age = ageYearsAt(input.birthDate, atISO)
    if (age != null) return { age, source: 'dob' }
  }
  if (input.birthYear != null) {
    const atYear = new Date(atISO).getFullYear()
    const age = Number.isNaN(atYear) ? null : ageFromBirthYear(input.birthYear, atYear)
    if (age != null) return { age, source: 'year' }
  }
  if (input.edad != null) return { age: input.edad, source: 'edad' }
  return { age: null, source: 'none' }
}

export function isPlausibleBirthDate(birthISO: string, todayISO: string): boolean {
  const age = ageYearsAt(birthISO, todayISO)
  return age != null && age >= 0 && age <= 120
}
