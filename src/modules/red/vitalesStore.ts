import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Signos vitales por persona, CON FECHA y como SERIE (cada toma se agrega) → longitudinal.
// Núcleo del trabajo de enfermería (sala de espera / terreno). Alimenta alertas y el informe.
export interface Vitales {
  fecha: number
  taSist?: number
  taDiast?: number
  fc?: number
  peso?: number
  talla?: number // cm o m (se normaliza)
  perimetro?: number
  glucemia?: number
  spo2?: number
  temp?: number
}

interface VitalesState {
  porPersona: Record<string, Vitales[]>
  registrar: (personId: string, v: Vitales) => void
  reset: () => void
}

export const useVitales = create<VitalesState>()(
  persist(
    (set) => ({
      porPersona: {},
      registrar: (personId, v) =>
        set((s) => ({ porPersona: { ...s.porPersona, [personId]: [...(s.porPersona[personId] ?? []), v] } })),
      reset: () => set({ porPersona: {} }),
    }),
    { name: 'kaizenai-vitales' },
  ),
)

export const ultimoVital = (porPersona: VitalesState['porPersona'], personId: string): Vitales | undefined => {
  const serie = porPersona[personId]
  return serie && serie.length ? serie[serie.length - 1] : undefined
}

/** IMC; acepta talla en cm (>3) o en metros. */
export function imc(v: Vitales): number | undefined {
  if (!v.peso || !v.talla) return undefined
  const m = v.talla > 3 ? v.talla / 100 : v.talla
  if (m <= 0) return undefined
  return Math.round((v.peso / (m * m)) * 10) / 10
}

export interface AlertaVital {
  campo: string
  texto: string
}

// Umbrales clínicos estándar (adulto). Conservador: solo marca lo claramente fuera de rango.
export function alertasVitales(v: Vitales): AlertaVital[] {
  const out: AlertaVital[] = []
  if ((v.taSist && v.taSist >= 140) || (v.taDiast && v.taDiast >= 90)) out.push({ campo: 'ta', texto: `Presión elevada (${v.taSist ?? '?'}/${v.taDiast ?? '?'}) — descartar HTA` })
  else if (v.taSist && v.taSist < 90) out.push({ campo: 'ta', texto: `Presión baja (${v.taSist}/${v.taDiast ?? '?'})` })
  if (v.fc && v.fc > 100) out.push({ campo: 'fc', texto: `Taquicardia (FC ${v.fc})` })
  else if (v.fc && v.fc < 50) out.push({ campo: 'fc', texto: `Bradicardia (FC ${v.fc})` })
  const b = imc(v)
  if (b && b >= 30) out.push({ campo: 'imc', texto: `Obesidad (IMC ${b})` })
  else if (b && b < 18.5) out.push({ campo: 'imc', texto: `Bajo peso (IMC ${b})` })
  if (v.glucemia && v.glucemia >= 200) out.push({ campo: 'glucemia', texto: `Glucemia muy alta (${v.glucemia} mg/dl)` })
  else if (v.glucemia && v.glucemia >= 126) out.push({ campo: 'glucemia', texto: `Glucemia elevada (${v.glucemia} mg/dl) — descartar diabetes` })
  if (v.spo2 && v.spo2 < 92) out.push({ campo: 'spo2', texto: `Saturación baja (SpO₂ ${v.spo2}%)` })
  if (v.temp && v.temp >= 38) out.push({ campo: 'temp', texto: `Fiebre (${v.temp}°)` })
  return out
}
