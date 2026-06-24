import { db } from './db'
import type {
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
      await db.preAssessments.put({
        ...a,
        lastContactAt: ev.at,
        contacts: [...(a.contacts ?? []), ev],
      })
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
      people: await db.people.toArray(),
      preAssessments: await db.preAssessments.toArray(),
      suggestions: await db.suggestions.toArray(),
    }
    return JSON.stringify(bundle, null, 2)
  },
  importJSON: async (json: string) => {
    const raw = JSON.parse(json) as Partial<KaizenBundle>
    if (raw.kind !== 'kaizenai-bundle') {
      throw new Error('Archivo no reconocido (no es un sobre KaizenAI).')
    }
    const people = raw.people ?? []
    const assessments = raw.preAssessments ?? []
    const suggestions = raw.suggestions ?? []
    await Promise.all([
      people.length ? db.people.bulkPut(people) : Promise.resolve(),
      assessments.length ? db.preAssessments.bulkPut(assessments) : Promise.resolve(),
      suggestions.length ? db.suggestions.bulkPut(suggestions) : Promise.resolve(),
    ])
    return { people: people.length, assessments: assessments.length, suggestions: suggestions.length }
  },
}
