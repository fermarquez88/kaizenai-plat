import Dexie, { type Table } from 'dexie'
import type { Person, PreAssessmentSummary } from './types'

// Local-first store. Los datos viven en el dispositivo de la persona (IndexedDB).
export class KaizenDB extends Dexie {
  people!: Table<Person, string>
  preAssessments!: Table<PreAssessmentSummary, string>

  constructor() {
    super('kaizenai')
    this.version(1).stores({
      people: 'id, createdAt',
      preAssessments: 'id, personId, createdAt',
    })
  }
}

export const db = new KaizenDB()
