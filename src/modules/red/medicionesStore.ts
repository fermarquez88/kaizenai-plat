import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Mediciones YA registradas (persistente), keyed por `${personId}:${tipo}`. Cierra el lazo:
// cuando enfermería carga signos vitales, la alarma 'pedidoMedicion' correspondiente
// desaparece de la cola del equipo (antes quedaba abierta pese a estar hecha).
interface MedicionesState {
  registradas: Record<string, true>
  registrar: (personId: string, tipo: string) => void
  reset: () => void
}

export const useMediciones = create<MedicionesState>()(
  persist(
    (set) => ({
      registradas: {},
      registrar: (personId, tipo) => set((s) => ({ registradas: { ...s.registradas, [`${personId}:${tipo}`]: true } })),
      reset: () => set({ registradas: {} }),
    }),
    { name: 'kaizenai-mediciones' },
  ),
)

export const estaRegistrada = (registradas: Record<string, true>, personId: string, tipo?: string) =>
  !!tipo && !!registradas[`${personId}:${tipo}`]
