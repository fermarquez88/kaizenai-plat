import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Alarma } from '../../scoring/alarmas'

// Pedidos de completar perfil EMITIDOS por los actores (médico, enfermera, cualquiera).
// A diferencia de las alarmas derivadas de datos, estos son explícitos → se persisten y se
// mezclan en la cola junto a las derivadas. Dedup por id estable (personId:pedidoCompletar:alcance).
interface PedidosState {
  pedidos: Alarma[]
  addPedidos: (list: Alarma[]) => void
  cerrarPedido: (id: string) => void
  reset: () => void
}

export const usePedidos = create<PedidosState>()(
  persist(
    (set) => ({
      pedidos: [],
      addPedidos: (list) =>
        set((s) => {
          const byId = new Map(s.pedidos.map((p) => [p.id, p]))
          for (const p of list) byId.set(p.id, p)
          return { pedidos: Array.from(byId.values()) }
        }),
      cerrarPedido: (id) =>
        set((s) => ({ pedidos: s.pedidos.map((p) => (p.id === id ? { ...p, estado: 'cerrada' } : p)) })),
      reset: () => set({ pedidos: [] }),
    }),
    { name: 'kaizenai-pedidos' },
  ),
)
