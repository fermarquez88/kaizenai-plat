import { create } from 'zustand'
import type { FactorAnswer } from '../../scoring/lancet'
import type { DrugInfo } from '../../scoring/medications'

interface PreconsultaState {
  lancet: Record<string, FactorAnswer>
  mrca: Record<string, 0 | 1>
  meds: DrugInfo[]
  redFlags: string[]
  setLancet: (id: string, a: FactorAnswer) => void
  setMrca: (id: string, v: 0 | 1) => void
  addMed: (d: DrugInfo) => void
  removeMed: (id: string) => void
  toggleRedFlag: (id: string) => void
  reset: () => void
}

const EMPTY = { lancet: {}, mrca: {}, meds: [], redFlags: [] }

export const usePreconsulta = create<PreconsultaState>((set) => ({
  ...EMPTY,
  setLancet: (id, a) => set((s) => ({ lancet: { ...s.lancet, [id]: a } })),
  setMrca: (id, v) => set((s) => ({ mrca: { ...s.mrca, [id]: v } })),
  addMed: (d) => set((s) => (s.meds.some((m) => m.id === d.id) ? s : { meds: [...s.meds, d] })),
  removeMed: (id) => set((s) => ({ meds: s.meds.filter((m) => m.id !== id) })),
  toggleRedFlag: (id) =>
    set((s) => ({
      redFlags: s.redFlags.includes(id) ? s.redFlags.filter((x) => x !== id) : [...s.redFlags, id],
    })),
  reset: () => set({ ...EMPTY }),
}))
