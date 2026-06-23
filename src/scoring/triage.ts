// Motor de triage: combina índice de riesgo modificable (Lancet) + banda MRCA +
// banderas rojas + preocupación farmacológica → nivel Verde / Amarillo / Rojo.
// ⚠️ Reglas PLACEHOLDER, configurables y a validar clínicamente. No diagnostica.

import type { MrcaBand } from './mrca'

export type TriageLevel = 'verde' | 'amarillo' | 'rojo'

export interface TriageInput {
  modifiableRiskShare: number // 0..1 (índice Lancet normalizado)
  mrcaBand: MrcaBand
  redFlagsCount: number
  medConcern: boolean
}

export interface TriageResult {
  level: TriageLevel
  /** códigos de motivo, mapeados a i18n triage.reasons.<code> */
  reasons: string[]
}

export const RISK_SHARE_HIGH = 0.5

export function computeTriage(i: TriageInput): TriageResult {
  const reasons: string[] = []

  let level: TriageLevel = 'verde'
  if (i.mrcaBand === 'alto' || i.redFlagsCount > 0) {
    level = 'rojo'
  } else if (i.mrcaBand === 'intermedio' || i.modifiableRiskShare >= RISK_SHARE_HIGH || i.medConcern) {
    level = 'amarillo'
  }

  if (i.redFlagsCount > 0) reasons.push('redflags')
  if (i.mrcaBand === 'alto') reasons.push('mrcaAlto')
  if (i.mrcaBand === 'intermedio') reasons.push('mrcaInter')
  if (i.modifiableRiskShare >= RISK_SHARE_HIGH) reasons.push('riskHigh')
  if (i.medConcern) reasons.push('meds')
  if (reasons.length === 0) reasons.push('low')

  return { level, reasons }
}
