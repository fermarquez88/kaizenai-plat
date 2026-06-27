import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Diagnóstico / impresión clínica del MÉDICO, por persona y CON FECHA (serie → se ve la
// evolución del cuadro). Lo etiqueta y firma el profesional. No es autorreporte.
export interface Diagnostico {
  fecha: number
  dx: string // id de DIAGNOSTICOS
  cdr?: string // estadio CDR
  detalle?: string
}

interface DiagnosticoState {
  porPersona: Record<string, Diagnostico[]>
  registrar: (personId: string, d: Diagnostico) => void
  reset: () => void
}

export const useDiagnostico = create<DiagnosticoState>()(
  persist(
    (set) => ({
      porPersona: {},
      registrar: (personId, d) =>
        set((s) => ({ porPersona: { ...s.porPersona, [personId]: [...(s.porPersona[personId] ?? []), d] } })),
      reset: () => set({ porPersona: {} }),
    }),
    { name: 'kaizenai-diagnostico' },
  ),
)

export const ultimoDiagnostico = (porPersona: DiagnosticoState['porPersona'], personId: string): Diagnostico | undefined => {
  const serie = porPersona[personId]
  return serie && serie.length ? serie[serie.length - 1] : undefined
}

export const DIAGNOSTICOS: { id: string; label: string }[] = [
  { id: 'normal', label: 'Cognición normal / sin deterioro' },
  { id: 'dcs', label: 'Deterioro cognitivo subjetivo' },
  { id: 'dcl_amn', label: 'Deterioro cognitivo leve amnésico' },
  { id: 'dcl_noamn', label: 'Deterioro cognitivo leve no amnésico' },
  { id: 'alzheimer', label: 'Demencia tipo Alzheimer' },
  { id: 'vascular', label: 'Demencia vascular' },
  { id: 'mixta', label: 'Demencia mixta' },
  { id: 'lewy', label: 'Demencia por cuerpos de Lewy' },
  { id: 'ftd', label: 'Demencia frontotemporal' },
  { id: 'otra', label: 'Demencia por otra causa' },
  { id: 'estudio', label: 'En estudio' },
]

export const CDR: { id: string; label: string }[] = [
  { id: '0', label: 'CDR 0 · normal' },
  { id: '0.5', label: 'CDR 0,5 · dudoso' },
  { id: '1', label: 'CDR 1 · leve' },
  { id: '2', label: 'CDR 2 · moderado' },
  { id: '3', label: 'CDR 3 · grave' },
]

export const dxLabel = (id?: string) => DIAGNOSTICOS.find((d) => d.id === id)?.label ?? id ?? '—'
export const cdrLabel = (id?: string) => CDR.find((c) => c.id === id)?.label ?? (id ? `CDR ${id}` : '')
