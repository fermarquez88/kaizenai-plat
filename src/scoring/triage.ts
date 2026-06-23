// Motor de triage: combina el modelo MRCA real (banda + decisión) con el índice de
// riesgo modificable (Lancet), banderas rojas, preocupación farmacológica y un
// término de EQUIDAD que evita dejar atrás a quien tiene más barreras de acceso.
// ⚠️ Reglas configurables, a validar. No diagnostica.
import type { MrcaModelBand } from './mrcaModel'
import { EQUITY_HIGH } from './equity'

export type TriageLevel = 'verde' | 'amarillo' | 'rojo'

export interface TriageInput {
  modifiableRiskShare: number // 0..1 (índice Lancet normalizado)
  mrcaBand: MrcaModelBand
  mrcaDerivar: boolean // decisión del modelo (prob ≥ umbral)
  redFlagsCount: number
  medConcern: boolean
  equityScore: number
}

export interface TriageResult {
  level: TriageLevel
  reasons: string[] // códigos → i18n triage.reasons.<code>
}

export const RISK_SHARE_HIGH = 0.5

export function computeTriage(i: TriageInput): TriageResult {
  const reasons: string[] = []

  let level: TriageLevel = 'verde'
  if (i.redFlagsCount > 0 || (i.mrcaDerivar && i.mrcaBand === 'alto')) {
    level = 'rojo'
  } else if (
    i.mrcaDerivar ||
    i.mrcaBand === 'moderado' ||
    i.modifiableRiskShare >= RISK_SHARE_HIGH ||
    i.medConcern
  ) {
    level = 'amarillo'
  }

  // Equidad: con vulnerabilidad alta y ALGUNA señal, no dejar en verde — priorizar
  // una evaluación programada para que no se pierda en el sistema.
  const someSignal =
    i.mrcaBand !== 'bajo' || i.mrcaDerivar || i.modifiableRiskShare >= 0.33 || i.medConcern
  if (level === 'verde' && i.equityScore >= EQUITY_HIGH && someSignal) {
    level = 'amarillo'
    reasons.push('equidad')
  }

  if (i.redFlagsCount > 0) reasons.push('redflags')
  if (i.mrcaBand === 'alto') reasons.push('mrcaAlto')
  else if (i.mrcaBand === 'moderado') reasons.push('mrcaModerado')
  else if (i.mrcaDerivar) reasons.push('mrcaDerivar')
  if (i.modifiableRiskShare >= RISK_SHARE_HIGH) reasons.push('riskHigh')
  if (i.medConcern) reasons.push('meds')
  if (reasons.length === 0) reasons.push('low')

  return { level, reasons }
}
