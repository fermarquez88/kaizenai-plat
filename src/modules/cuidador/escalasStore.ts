import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Resultados de escalas CON FECHA, por persona y por escala = serie longitudinal (testeable
// en el tiempo). Vale para el cuidador (Zarit/PHQ-9/GAD-7/autoeficacia/Duke/PAC) y para la
// persona. No es "para investigación": es parte del cuidado.
export interface ResultadoEscala {
  fecha: number
  score: number
  answered: number
  text: string
}

interface EscalasState {
  porPersona: Record<string, Record<string, ResultadoEscala[]>>
  agregar: (personId: string, scaleId: string, r: ResultadoEscala) => void
  reset: () => void
}

export const useEscalas = create<EscalasState>()(
  persist(
    (set) => ({
      porPersona: {},
      agregar: (personId, scaleId, r) =>
        set((s) => {
          const persona = s.porPersona[personId] ?? {}
          const serie = persona[scaleId] ?? []
          return { porPersona: { ...s.porPersona, [personId]: { ...persona, [scaleId]: [...serie, r] } } }
        }),
      reset: () => set({ porPersona: {} }),
    }),
    { name: 'kaizenai-escalas' },
  ),
)

/** Último resultado de una escala (para mostrar "última vez" y la serie). */
export function ultimoResultado(porPersona: EscalasState['porPersona'], personId: string, scaleId: string): ResultadoEscala | undefined {
  const serie = porPersona[personId]?.[scaleId]
  return serie && serie.length ? serie[serie.length - 1] : undefined
}
