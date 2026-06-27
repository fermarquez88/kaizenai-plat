import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Resultados de la batería neuropsicológica objetiva, por persona. Capa clínica (M4):
// los carga la neuropsicóloga; persistidos para enriquecer el perfil y el informe.
export interface NeuroResultado {
  testId: string
  label: string
  raw: number
  z?: number
  band?: string
}

interface NeuroState {
  porPersona: Record<string, NeuroResultado[]>
  setResultados: (personId: string, rs: NeuroResultado[]) => void
  reset: () => void
}

export const useNeuro = create<NeuroState>()(
  persist(
    (set) => ({
      porPersona: {},
      setResultados: (personId, rs) =>
        set((s) => ({ porPersona: { ...s.porPersona, [personId]: rs } })),
      reset: () => set({ porPersona: {} }),
    }),
    { name: 'kaizenai-neuro' },
  ),
)
