// Resumen de preconsulta: ensambla los resultados de todos los módulos (incl. el
// modelo MRCA real) y emite export JSON + bundle FHIR R4 (seam hacia la HCE oficial).

import { computeModifiableRisk, type FactorAnswer } from '../scoring/lancet'
import { MRCA_ITEMS } from '../scoring/mrca'
import { predictMrca, type MrcaModelBand, type MrcaRawInputs } from '../scoring/mrcaModel'
import { computeMedFlags, type DrugInfo, type MedFlags } from '../scoring/medications'
import { computeTriage, type TriageLevel } from '../scoring/triage'

export interface Demografia {
  edad?: number
  sexo?: 'Mujer' | 'Hombre'
  edu_anios?: number
}

export interface PreconsultaInputs {
  demo: Demografia
  lancet: Record<string, FactorAnswer>
  mrca: Record<string, 0 | 1>
  meds: DrugInfo[]
  redFlags: string[]
}

// Mapea lo que captura la app → inputs del modelo Kaizen-MRCA. Lo no medido
// (ADLQ, GDS, CHSC, saneamiento) queda en modo preliminar (lo imputa el modelo).
export function buildMrcaInputs(inp: PreconsultaInputs): MrcaRawInputs {
  const L = inp.lancet
  const yes = (k: string) => L[k] === 'si'
  const complaint = MRCA_ITEMS.filter((id) => inp.mrca[id] === 1).length
  return {
    edad: inp.demo.edad ?? 65,
    sexo: inp.demo.sexo ?? 'Mujer',
    edu_anios: inp.demo.edu_anios ?? 7,
    cqc_total: (complaint / MRCA_ITEMS.length) * 96, // proxy de queja cognitiva (0-96)
    obesidad: yes('obesity'),
    hipoacusia: yes('hearing'),
    fumador: yes('smoking'),
    vive_solo: yes('isolation'),
    deficit_visual: yes('vision'),
    diabetes: yes('diabetes'),
    colesterol: yes('ldl'),
  }
}

export interface PreconsultaSummary {
  createdAt: string
  modifiableRiskPct: number
  modifiableRiskShare: number
  presentFactors: string[]
  topFactors: { id: string; paf: number }[]
  mrcaBand: MrcaModelBand
  mrcaProb: number
  mrcaDecision: 'derivar' | 'descartar'
  mrcaPreliminary: boolean
  mrcaAceEst: number
  meds: string[]
  medFlags: MedFlags
  redFlags: string[]
  triageLevel: TriageLevel
  triageReasons: string[]
}

export function buildSummary(inp: PreconsultaInputs, createdAtISO: string): PreconsultaSummary {
  const risk = computeModifiableRisk(inp.lancet)
  const mrca = predictMrca(buildMrcaInputs(inp))
  const medFlags = computeMedFlags(inp.meds)
  const triage = computeTriage({
    modifiableRiskShare: risk.share,
    mrcaBand: mrca.band,
    mrcaDerivar: mrca.decision === 'derivar',
    redFlagsCount: inp.redFlags.length,
    medConcern: medFlags.anyConcern,
  })
  return {
    createdAt: createdAtISO,
    modifiableRiskPct: Math.round(risk.modifiableRiskPct),
    modifiableRiskShare: risk.share,
    presentFactors: risk.presentFactors.map((f) => f.id),
    topFactors: risk.topFactors,
    mrcaBand: mrca.band,
    mrcaProb: mrca.prob,
    mrcaDecision: mrca.decision,
    mrcaPreliminary: mrca.preliminary,
    mrcaAceEst: mrca.aceEst,
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
          code: { text: 'Cribado de riesgo cognitivo (KaizenAI · Kaizen-MRCA v1)' },
          occurrenceDateTime: s.createdAt,
          prediction: [
            {
              outcome: { text: 'Prioridad de derivación' },
              qualitativeRisk: { text: s.triageLevel },
              probabilityDecimal: s.mrcaProb,
            },
          ],
          note: [
            {
              text: `MRCA banda ${s.mrcaBand} (prob ${s.mrcaProb}, ${s.mrcaDecision}${s.mrcaPreliminary ? ', preliminar' : ''}); riesgo modificable ~${s.modifiableRiskPct}%; banderas rojas: ${s.redFlags.length}`,
            },
          ],
        },
      },
      {
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: { text: 'ACE-III estimado (Kaizen-MRCA)' },
          valueQuantity: { value: s.mrcaAceEst },
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
