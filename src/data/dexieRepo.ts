import { db } from './db'
import type { Person, PreAssessmentSummary } from './types'
import type { DataRepository } from './DataRepository'

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

  clearAll: async () => {
    await Promise.all([db.people.clear(), db.preAssessments.clear()])
  },
  exportJSON: async () =>
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        people: await db.people.toArray(),
        preAssessments: await db.preAssessments.toArray(),
      },
      null,
      2,
    ),
}
