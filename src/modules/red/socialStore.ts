import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Evaluación social por persona (capa de trabajo social). Persistida; alimenta el informe
// social y las alertas de riesgo social.
interface SocialState {
  porPersona: Record<string, Record<string, string>>
  setCampo: (personId: string, campo: string, valor: string) => void
  reset: () => void
}

export const useSocial = create<SocialState>()(
  persist(
    (set) => ({
      porPersona: {},
      setCampo: (personId, campo, valor) =>
        set((s) => ({ porPersona: { ...s.porPersona, [personId]: { ...(s.porPersona[personId] ?? {}), [campo]: valor } } })),
      reset: () => set({ porPersona: {} }),
    }),
    { name: 'kaizenai-social' },
  ),
)
