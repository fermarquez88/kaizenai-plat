import { create } from 'zustand'
import type { FactorAnswer } from '../../scoring/lancet'
import type { DrugInfo } from '../../scoring/medications'
import type { Demografia } from '../../data/preconsultaSummary'

interface PreconsultaState {
  demo: Demografia
  lancet: Record<string, FactorAnswer>
  /** respuestas por instrumento: instruments[instId][itemIndex] = valor */
  instruments: Record<string, Record<number, number>>
  meds: DrugInfo[]
  redFlags: string[]
  setDemo: (patch: Partial<Demografia>) => void
  setLancet: (id: string, a: FactorAnswer) => void
  setInstrumentItem: (instId: string, item: number, value: number) => void
  addMed: (d: DrugInfo) => void
  removeMed: (id: string) => void
  toggleRedFlag: (id: string) => void
  reset: () => void
}

const EMPTY = { demo: {}, lancet: {}, instruments: {}, meds: [], redFlags: [] }

export const usePreconsulta = create<PreconsultaState>((set) => ({
  ...EMPTY,
  setDemo: (patch) => set((s) => ({ demo: { ...s.demo, ...patch } })),
  setLancet: (id, a) => set((s) => ({ lancet: { ...s.lancet, [id]: a } })),
  setInstrumentItem: (instId, item, value) =>
    set((s) => ({
      instruments: {
        ...s.instruments,
        [instId]: { ...(s.instruments[instId] ?? {}), [item]: value },
      },
    })),
  addMed: (d) => set((s) => (s.meds.some((m) => m.id === d.id) ? s : { meds: [...s.meds, d] })),
  removeMed: (id) => set((s) => ({ meds: s.meds.filter((m) => m.id !== id) })),
  toggleRedFlag: (id) =>
    set((s) => ({
      redFlags: s.redFlags.includes(id) ? s.redFlags.filter((x) => x !== id) : [...s.redFlags, id],
    })),
  reset: () => set({ ...EMPTY }),
}))
