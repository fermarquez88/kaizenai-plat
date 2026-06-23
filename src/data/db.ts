import Dexie, { type Table } from 'dexie'
import type { Person, PreAssessmentSummary, Suggestion } from './types'

// Local-first store. Los datos viven en el dispositivo de la persona (IndexedDB).
export class KaizenDB extends Dexie {
  people!: Table<Person, string>
  preAssessments!: Table<PreAssessmentSummary, string>
  suggestions!: Table<Suggestion, string>

  constructor() {
    super('kaizenai')
    this.version(1).stores({
      people: 'id, createdAt',
      preAssessments: 'id, personId, createdAt',
    })
    this.version(2).stores({
      suggestions: 'id, createdAt',
    })
  }
}

export const db = new KaizenDB()
