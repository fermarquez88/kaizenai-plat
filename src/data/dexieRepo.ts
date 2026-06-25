import { db } from './db'
import type {
  ConsentRecord,
  ContactEvent,
  DerivationStatus,
  KaizenBundle,
  Person,
  PreAssessmentSummary,
  Suggestion,
  SuggestionStatus,
} from './types'
import type { DataRepository } from './DataRepository'

const BUNDLE_VERSION = 1

// --- Validación de import (sin dependencias; el sobre puede venir editado a mano) ---
const isStr = (x: unknown): x is string => typeof x === 'string' && x.length > 0
const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)
const TRIAGE = new Set(['verde', 'amarillo', 'rojo'])
const DERIV = new Set(['emitida', 'agendada', 'atendida', 'noVino', 'cerrada'])
const MODO = new Set(['persona', 'cuidador', 'agente'])
const SUGG = new Set(['abierta', 'aceptada', 'hecha'])
const inSet = (s: Set<string>, x: unknown) => x == null || (typeof x === 'string' && s.has(x))

function validPerson(p: unknown): p is Person {
  const o = p as Record<string, unknown>
  return !!o && isStr(o.id) && isNum(o.createdAt)
}
function validAssessment(a: unknown): a is PreAssessmentSummary {
  const o = a as Record<string, unknown>
  return (
    !!o &&
    isStr(o.id) &&
    isStr(o.personId) &&
    isNum(o.createdAt) &&
    inSet(TRIAGE, o.triage) &&
    inSet(DERIV, o.derivationStatus) &&
    inSet(MODO, o.modo) &&
    inSet(MODO, o.source)
  )
}
function validSuggestion(s: unknown): s is Suggestion {
  const o = s as Record<string, unknown>
  return !!o && isStr(o.id) && isStr(o.text) && isNum(o.createdAt) && isNum(o.votes) && inSet(SUGG, o.status)
}

// Hardening del import: sin prototype pollution, con topes de cantidad y longitud.
const DANGER_KEYS = new Set(['__proto__', 'constructor', 'prototype'])
const MAX_RECORDS = 10_000
const MAX_STR = 4000
function sanitize<T extends object>(o: T): T {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(o)) {
    if (DANGER_KEYS.has(k)) continue
    out[k] = typeof v === 'string' && v.length > MAX_STR ? v.slice(0, MAX_STR) : v
  }
  return out as T
}

export interface PreparedImport {
  people: Person[]
  assessments: PreAssessmentSummary[]
  suggestions: Suggestion[]
}

/** Parse + valida + sanitiza un sobre KaizenAI (pura y testeable, sin IndexedDB).
 * Filtra registros mal formados, descarta claves peligrosas (__proto__/constructor/prototype),
 * acota longitud de strings y cantidad de registros. Lanza si el sobre es ilegible/no reconocido/futuro. */
export function prepareImport(json: string): PreparedImport {
  let raw: Partial<KaizenBundle>
  try {
    raw = JSON.parse(json)
  } catch {
    throw new Error('Archivo ilegible.')
  }
  if (raw.kind !== 'kaizenai-bundle') throw new Error('Archivo no reconocido (no es un sobre KaizenAI).')
  if (raw.version != null && raw.version > BUNDLE_VERSION) {
    throw new Error(`El sobre es de una versión más nueva (${raw.version}). Actualizá la app.`)
  }
  const people = (raw.people ?? []).slice(0, MAX_RECORDS).filter(validPerson).map(sanitize)
  const assessments = (raw.preAssessments ?? []).slice(0, MAX_RECORDS).filter(validAssessment).map(sanitize)
  const suggestions = (raw.suggestions ?? []).slice(0, MAX_RECORDS).filter(validSuggestion).map(sanitize)
  return { people, assessments, suggestions }
}

// Consentimiento PORTABLE: vive en el store persistido (localStorage); lo leemos
// para que viaje en el sobre (sin que dexieRepo dependa de la UI).
function readConsent(): ConsentRecord | undefined {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('kaizenai-settings') : null
    const state = raw ? JSON.parse(raw)?.state : null
    if (state?.consentAccepted) {
      return {
        accepted: true,
        at: state.consentAt ?? Date.now(),
        version: '1.0',
        scope: 'Cribado y acompañamiento de salud cerebral',
      }
    }
  } catch {
    /* ignore */
  }
  return undefined
}

export const dexieRepo: DataRepository = {
  listPeople: () => db.people.orderBy('createdAt').toArray(),
  getPerson: (id) => db.people.get(id),
  upsertPerson: async (p: Person) => {
    await db.people.put(p)
  },
  deletePerson: async (id: string) => {
    await db.people.delete(id)
  },

  savePreAssessment: async (a: PreAssessmentSummary) => {
    await db.preAssessments.put(a)
  },
  listPreAssessments: () => db.preAssessments.orderBy('createdAt').toArray(),
  listPersonAssessments: (personId: string) =>
    db.preAssessments.where('personId').equals(personId).sortBy('createdAt'),

  updateDerivation: async (id: string, status: DerivationStatus) => {
    const a = await db.preAssessments.get(id)
    if (a) await db.preAssessments.put({ ...a, derivationStatus: status, derivationUpdatedAt: Date.now() })
  },
  logContact: async (id: string, ev: ContactEvent) => {
    const a = await db.preAssessments.get(id)
    if (a) {
      await db.preAssessments.put({ ...a, lastContactAt: ev.at, contacts: [...(a.contacts ?? []), ev] })
    }
  },

  addSuggestion: async (s: Suggestion) => {
    await db.suggestions.put(s)
  },
  listSuggestions: () => db.suggestions.orderBy('createdAt').reverse().toArray(),
  voteSuggestion: async (id: string) => {
    const s = await db.suggestions.get(id)
    if (s) await db.suggestions.put({ ...s, votes: s.votes + 1 })
  },
  setSuggestionStatus: async (id: string, status: SuggestionStatus) => {
    const s = await db.suggestions.get(id)
    if (s) await db.suggestions.put({ ...s, status })
  },

  clearAll: async () => {
    await Promise.all([db.people.clear(), db.preAssessments.clear(), db.suggestions.clear()])
  },
  exportJSON: async () => {
    const bundle: KaizenBundle = {
      kind: 'kaizenai-bundle',
      version: BUNDLE_VERSION,
      exportedAt: new Date().toISOString(),
      consent: readConsent(),
      people: await db.people.toArray(),
      preAssessments: await db.preAssessments.toArray(),
      suggestions: await db.suggestions.toArray(),
    }
    return JSON.stringify(bundle, null, 2)
  },
  importJSON: async (json: string) => {
    // Parse + validación + sanitización endurecida (función pura, testeada).
    const { people, assessments, suggestions } = prepareImport(json)
    // Insert-only: nunca pisar registros locales (preserva contactos/derivación propios).
    const [pp, aa, ss] = await Promise.all([
      db.people.toArray(),
      db.preAssessments.toArray(),
      db.suggestions.toArray(),
    ])
    const pSet = new Set(pp.map((p) => p.id))
    const aSet = new Set(aa.map((a) => a.id))
    const sSet = new Set(ss.map((s) => s.id))
    const newPeople = people.filter((p) => !pSet.has(p.id))
    const newAssessments = assessments.filter((a) => !aSet.has(a.id))
    const newSuggestions = suggestions.filter((s) => !sSet.has(s.id))
    await Promise.all([
      newPeople.length ? db.people.bulkPut(newPeople) : Promise.resolve(),
      newAssessments.length ? db.preAssessments.bulkPut(newAssessments) : Promise.resolve(),
      newSuggestions.length ? db.suggestions.bulkPut(newSuggestions) : Promise.resolve(),
    ])
    return {
      people: newPeople.length,
      assessments: newAssessments.length,
      suggestions: newSuggestions.length,
    }
  },
}
