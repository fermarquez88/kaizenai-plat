import { create } from 'zustand'
import type { FactorAnswer } from '../../scoring/lancet'
import { DRUG_CATALOG, type DrugInfo } from '../../scoring/medications'
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
  seedDemo: () => void
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
  // Caso de ejemplo para la demo: persona rural vulnerable de Jáchal (baja escolaridad,
  // lejos del centro, con factores de riesgo, quejas y medicación a revisar).
  seedDemo: () => {
    const find = (id: string) => DRUG_CATALOG.find((d) => d.id === id)
    const meds = ['amitriptilina', 'clonazepam', 'enalapril', 'losartan', 'omeprazol']
      .map(find)
      .filter((d): d is DrugInfo => !!d)
    set({
      demo: { edad: 76, sexo: 'Mujer', edu_anios: 4, depto: 'Jáchal', vive: 'campo', cerca: '>60' },
      lancet: {
        education: 'si',
        hearing: 'si',
        ldl: 'si',
        hypertension: 'si',
        inactivity: 'si',
        isolation: 'si',
        vision: 'si',
        smoking: 'no',
        diabetes: 'no',
        obesity: 'no',
        alcohol: 'no',
        depression: 'no',
        tbi: 'no',
        airPollution: 'no',
      },
      instruments: {
        cqc: { 0: 2, 1: 3, 2: 2, 3: 2, 6: 2, 12: 3, 13: 3, 14: 2, 15: 3, 20: 2 },
        gds: { 1: 1, 2: 1, 3: 1, 7: 1, 11: 1 },
        tadlq: { 3: 1, 6: 2, 7: 1, 8: 2 },
      },
      meds,
      redFlags: [],
    })
  },
  reset: () => set({ ...EMPTY }),
}))
