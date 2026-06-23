// Resumen de preconsulta: ensambla los resultados de todos los módulos y emite
// un export estructurado (JSON) y un bundle FHIR R4 (seam hacia la HCE oficial).

import { computeModifiableRisk, type FactorAnswer } from '../scoring/lancet'
import { computeMrca, type MrcaBand } from '../scoring/mrca'
import { computeMedFlags, type DrugInfo, type MedFlags } from '../scoring/medications'
import { computeTriage, type TriageLevel } from '../scoring/triage'

export interface PreconsultaInputs {
  lancet: Record<string, FactorAnswer>
  mrca: Record<string, 0 | 1>
  meds: DrugInfo[]
  redFlags: string[]
}

export interface PreconsultaSummary {
  createdAt: string
  modifiableRiskPct: number
  modifiableRiskShare: number
  presentFactors: string[]
  topFactors: { id: string; paf: number }[]
  mrcaScore: number
  mrcaBand: MrcaBand
  meds: string[]
  medFlags: MedFlags
  redFlags: string[]
  triageLevel: TriageLevel
  triageReasons: string[]
}

export function buildSummary(inp: PreconsultaInputs, createdAtISO: string): PreconsultaSummary {
  const risk = computeModifiableRisk(inp.lancet)
  const mrca = computeMrca(inp.mrca)
  const medFlags = computeMedFlags(inp.meds)
  const triage = computeTriage({
    modifiableRiskShare: risk.share,
    mrcaBand: mrca.band,
    redFlagsCount: inp.redFlags.length,
    medConcern: medFlags.anyConcern,
  })
  return {
    createdAt: createdAtISO,
    modifiableRiskPct: Math.round(risk.modifiableRiskPct),
    modifiableRiskShare: risk.share,
    presentFactors: risk.presentFactors.map((f) => f.id),
    topFactors: risk.topFactors,
    mrcaScore: mrca.score,
    mrcaBand: mrca.band,
    meds: inp.meds.map((m) => m.name),
    medFlags,
    redFlags: inp.redFlags,
    triageLevel: triage.level,
    triageReasons: triage.reasons,
  }
}

// FHIR R4 (mínimo). Se conecta a la HCE oficial en el piloto.
export function toFhirBundle(s: PreconsultaSummary): Record<string, unknown> {
  return {
    resourceType: 'Bundle',
    type: 'collection',
    timestamp: s.createdAt,
    entry: [
      {
        resource: {
          resourceType: 'RiskAssessment',
          status: 'final',
          code: { text: 'Cribado de riesgo cognitivo (KaizenAI)' },
          occurrenceDateTime: s.createdAt,
          prediction: [
            {
              outcome: { text: 'Prioridad de derivación' },
              qualitativeRisk: { text: s.triageLevel },
            },
          ],
          note: [
            {
              text: `MRCA ${s.mrcaScore}/7 (${s.mrcaBand}); riesgo modificable ~${s.modifiableRiskPct}%; banderas rojas: ${s.redFlags.length}`,
            },
          ],
        },
      },
      {
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: { text: 'MRCA score (0-7)' },
          valueInteger: s.mrcaScore,
        },
      },
      {
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: { text: 'Carga anticolinérgica ACB' },
          valueInteger: s.medFlags.acbTotal,
        },
      },
    ],
    meta: {
      tag: [{ display: 'KaizenAI · estimación, no diagnóstico · placeholders a validar' }],
    },
  }
}
