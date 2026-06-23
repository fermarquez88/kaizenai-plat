// Comisión Lancet 2024 — 14 factores de riesgo modificables para demencia.
// PAF = fracción atribuible poblacional (en puntos %). Suman ~45% (riesgo
// potencialmente prevenible a nivel poblacional).
// ⚠️ PLACEHOLDERS configurables: para uso real, recalibrar con normas locales
// (San Juan ~61% centro / ~69% periferia) tras validación clínica.

export type FactorAnswer = 'si' | 'no' | 'nose'
export type LifeStage = 'early' | 'mid' | 'late'

export interface LancetFactor {
  /** coincide con la clave i18n factors.<id>.* */
  id: string
  /** PAF en puntos porcentuales (Lancet 2024) */
  paf: number
  lifeStage: LifeStage
}

export const LANCET_FACTORS: LancetFactor[] = [
  { id: 'education', paf: 5, lifeStage: 'early' },
  { id: 'hearing', paf: 7, lifeStage: 'mid' },
  { id: 'ldl', paf: 7, lifeStage: 'mid' }, // nuevo en 2024
  { id: 'depression', paf: 3, lifeStage: 'mid' },
  { id: 'tbi', paf: 3, lifeStage: 'mid' },
  { id: 'inactivity', paf: 2, lifeStage: 'mid' },
  { id: 'diabetes', paf: 2, lifeStage: 'mid' },
  { id: 'smoking', paf: 2, lifeStage: 'mid' },
  { id: 'hypertension', paf: 2, lifeStage: 'mid' },
  { id: 'obesity', paf: 1, lifeStage: 'mid' },
  { id: 'alcohol', paf: 1, lifeStage: 'mid' },
  { id: 'isolation', paf: 5, lifeStage: 'late' },
  { id: 'airPollution', paf: 3, lifeStage: 'late' },
  { id: 'vision', paf: 2, lifeStage: 'late' }, // nuevo en 2024
]

export const TOTAL_PAF = LANCET_FACTORS.reduce((sum, f) => sum + f.paf, 0)

export interface PresentFactor {
  id: string
  paf: number
}

export interface ModifiableRiskResult {
  presentFactors: PresentFactor[]
  /** suma de PAF de los factores presentes (puntos %) */
  modifiableRiskPct: number
  /** proporción del riesgo modificable conocido que está presente (0..1) */
  share: number
  /** hasta 3 factores presentes con mayor PAF */
  topFactors: PresentFactor[]
}

/** Solo "sí" cuenta como factor presente; "no sé" no suma (se marca para seguimiento). */
export function computeModifiableRisk(
  answers: Record<string, FactorAnswer>,
): ModifiableRiskResult {
  const present: PresentFactor[] = LANCET_FACTORS.filter(
    (f) => answers[f.id] === 'si',
  ).map((f) => ({ id: f.id, paf: f.paf }))

  const modifiableRiskPct = present.reduce((sum, f) => sum + f.paf, 0)
  const share = TOTAL_PAF > 0 ? modifiableRiskPct / TOTAL_PAF : 0
  const topFactors = [...present].sort((a, b) => b.paf - a.paf).slice(0, 3)

  return { presentFactors: present, modifiableRiskPct, share, topFactors }
}
