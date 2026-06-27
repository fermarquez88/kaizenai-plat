import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// PERFIL DE ACTIVOS (intereses / habilidades / conocimientos) — marco ABCD: se mapea lo que
// la persona SABE Y PUEDE, no su carencia. Lo levanta el agente en voz (no autoadministrado).
// Vale para la persona y para el cuidador (cada uno con su propio id). CON FECHA: longitudinal.
// PII: nombres/teléfonos quedan on-device; NUNCA a repo/deploy público.
export interface PerfilActivos {
  fecha: number
  // A — saberes y oficios
  saberes: string[]
  destacado?: string
  dispuestoEnsenar?: boolean
  quiereAprender: string[]
  // B — intereses y conversación
  temas: string[]
  epoca?: 'infancia' | 'juventud' | 'adultez'
  // C — con qué puede participar
  movilidad?: 'sola' | 'acompanado' | 'noSale'
  oyeBienTel?: boolean
  paraje?: string
  // D — vínculo y autopercepción (detecta cognición social desadaptativa)
  contactoSemanal?: 'varias' | 'pocas' | 'casiNadie'
  tieneARecurrir?: boolean
  sienteCarga?: boolean
  quiereSerUtil?: boolean
}

interface ActivosState {
  porPersona: Record<string, PerfilActivos>
  guardar: (personId: string, p: PerfilActivos) => void
  reset: () => void
}

export const useActivos = create<ActivosState>()(
  persist(
    (set) => ({
      porPersona: {},
      guardar: (personId, p) => set((s) => ({ porPersona: { ...s.porPersona, [personId]: p } })),
      reset: () => set({ porPersona: {} }),
    }),
    { name: 'kaizenai-activos' },
  ),
)

// Catálogos concretos, tonada local, baja escolaridad.
export const SABERES: { id: string; label: string }[] = [
  { id: 'cocina', label: 'Cocinar / recetas de acá' },
  { id: 'costura', label: 'Costura / tejido' },
  { id: 'campo', label: 'Campo / huerta / animales' },
  { id: 'arreglos', label: 'Arreglar cosas / carpintería' },
  { id: 'musica', label: 'Música / coplas / cantar' },
  { id: 'remedios', label: 'Remedios caseros / yuyos' },
  { id: 'relatos', label: 'Historias del pueblo' },
  { id: 'religion', label: 'Rezos / religión' },
  { id: 'oficio', label: 'Un oficio que tuve' },
]

export const TEMAS: { id: string; label: string }[] = [
  { id: 'futbol', label: 'Fútbol / deporte' },
  { id: 'plantas', label: 'Plantas / jardín' },
  { id: 'religion', label: 'Religión' },
  { id: 'musica', label: 'Música / tonadas' },
  { id: 'novelas', label: 'Novelas / radio' },
  { id: 'historia', label: 'Historia del lugar' },
  { id: 'familia', label: 'Familia / nietos' },
  { id: 'comida', label: 'Comida' },
  { id: 'animales', label: 'Animales' },
]

export const labelDe = (lista: { id: string; label: string }[], id?: string) => lista.find((x) => x.id === id)?.label ?? id ?? ''
