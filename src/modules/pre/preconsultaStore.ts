import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FactorAnswer } from '../../scoring/lancet'
import { DRUG_CATALOG, type DrugInfo } from '../../scoring/medications'
import type { Demografia } from '../../data/preconsultaSummary'
import type { Factores } from '../../scoring/riskScores'

interface PreconsultaState {
  demo: Demografia
  lancet: Record<string, FactorAnswer>
  instruments: Record<string, Record<number, number>>
  factores: Factores
  meds: DrugInfo[]
  redFlags: string[]
  /** paso actual del chequeo (guardar-y-retomar). */
  step: number
  setDemo: (patch: Partial<Demografia>) => void
  setLancet: (id: string, a: FactorAnswer) => void
  setInstrumentItem: (instId: string, item: number, value: number) => void
  setFactor: (id: keyof Factores, value: unknown) => void
  addMed: (d: DrugInfo) => void
  removeMed: (id: string) => void
  toggleRedFlag: (id: string) => void
  setStep: (n: number) => void
  seedDemo: () => void
  reset: () => void
}

const EMPTY = { demo: {}, lancet: {}, instruments: {}, factores: {}, meds: [], redFlags: [], step: 0 }

export const usePreconsulta = create<PreconsultaState>()(
  persist(
    (set) => ({
      ...EMPTY,
      setStep: (step) => set({ step }),
      setDemo: (patch) => set((s) => ({ demo: { ...s.demo, ...patch } })),
  setLancet: (id, a) => set((s) => ({ lancet: { ...s.lancet, [id]: a } })),
  setInstrumentItem: (instId, item, value) =>
    set((s) => ({
      instruments: {
        ...s.instruments,
        [instId]: { ...(s.instruments[instId] ?? {}), [item]: value },
      },
    })),
  setFactor: (id, value) => set((s) => ({ factores: { ...s.factores, [id]: value } as Factores })),
  addMed: (d) => set((s) => (s.meds.some((m) => m.id === d.id) ? s : { meds: [...s.meds, d] })),
  removeMed: (id) => set((s) => ({ meds: s.meds.filter((m) => m.id !== id) })),
  toggleRedFlag: (id) =>
    set((s) => ({
      redFlags: s.redFlags.includes(id) ? s.redFlags.filter((x) => x !== id) : [...s.redFlags, id],
    })),
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
        diabetes: 'si',
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
      factores: {
        peso_kg: 78,
        talla_cm: 158,
        tabaquismo: 'never',
        actividad_fisica: 'low',
        actividad_cognitiva: 'low',
        red_social: 'low',
        pescado: 'lt1',
        dieta: 'some',
        alcohol_patron: 'none',
        cardiopatia: false,
        ictus: false,
        enf_renal: false,
        fibrilacion: false,
        insomnio: true,
      },
      meds,
      redFlags: [],
    })
  },
      reset: () => set({ ...EMPTY }),
    }),
    { name: 'kaizenai-preconsulta' },
  ),
)
