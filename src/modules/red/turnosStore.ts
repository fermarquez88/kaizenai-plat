import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Turnos agendados por el equipo/agente (cierra el loop de seguimiento: de "no volvió" a
// "tiene turno"). Persistido; alimenta la Agenda.
export interface Turno {
  id: string
  personId: string
  alias: string
  fecha: string // ISO date (yyyy-mm-dd)
  hora?: string
  lugar?: string
  nota?: string
  creadoEn: number
}

interface TurnosState {
  turnos: Turno[]
  agendar: (t: Omit<Turno, 'id' | 'creadoEn'>) => void
  cancelar: (id: string) => void
  reset: () => void
}

export const useTurnos = create<TurnosState>()(
  persist(
    (set) => ({
      turnos: [],
      agendar: (t) =>
        set((s) => ({ turnos: [...s.turnos, { ...t, id: `${t.personId}-${t.fecha}-${s.turnos.length}`, creadoEn: Date.now() }] })),
      cancelar: (id) => set((s) => ({ turnos: s.turnos.filter((x) => x.id !== id) })),
      reset: () => set({ turnos: [] }),
    }),
    { name: 'kaizenai-turnos' },
  ),
)

/** Turnos de hoy en adelante, ordenados por fecha. */
export function turnosProximos(turnos: Turno[], hoyISO: string): Turno[] {
  return turnos.filter((t) => t.fecha >= hoyISO).sort((a, b) => a.fecha.localeCompare(b.fecha) || (a.hora ?? '').localeCompare(b.hora ?? ''))
}
