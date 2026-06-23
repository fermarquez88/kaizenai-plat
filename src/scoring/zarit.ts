// Zarit-12 (forma breve de sobrecarga del cuidador). Cada ítem 0–4. Total 0–48.
// ⚠️ Umbrales orientativos (placeholder a validar).

export const ZARIT_ITEMS = [
  'time',
  'stress',
  'health',
  'control',
  'distress',
  'social',
  'uncomfortable',
  'dependent',
  'tense',
  'more',
  'privacy',
  'overall',
] as const

export type ZaritItemId = (typeof ZARIT_ITEMS)[number]
export type ZaritBand = 'poca' | 'moderada' | 'alta'

export const ZARIT_MAX = ZARIT_ITEMS.length * 4

export interface ZaritResult {
  score: number
  band: ZaritBand
}

export function computeZarit(answers: Record<string, number>): ZaritResult {
  const score = ZARIT_ITEMS.reduce((sum, id) => sum + (answers[id] ?? 0), 0)
  const band: ZaritBand = score >= 21 ? 'alta' : score >= 11 ? 'moderada' : 'poca'
  return { score, band }
}
