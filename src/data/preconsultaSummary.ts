// Resumen de preconsulta: ensambla los resultados (modelo MRCA real con instrumentos
// validados + equidad) y emite export JSON + bundle FHIR R4 (seam hacia la HCE).

import { computeModifiableRisk, type FactorAnswer } from '../scoring/lancet'
import { INSTRUMENTS, scoreInstrument } from '../scoring/instruments'
import { predictMrca, type MrcaModelBand, type MrcaRawInputs } from '../scoring/mrcaModel'
import { computeMedFlags, type DrugInfo, type MedFlags } from '../scoring/medications'
import { computeTriage, type TriageLevel } from '../scoring/triage'
import { computeEquity, type Cerca, type Vive } from '../scoring/equity'

export type Modo = 'persona' | 'cuidador' | 'agente'

export interface Demografia {
  modo?: Modo
  edad?: number
  sexo?: 'Mujer' | 'Hombre'
  edu_anios?: number
  depto?: string
  vive?: Vive
  cerca?: Cerca
}

export interface PreconsultaInputs {
  demo: Demografia
  lancet: Record<string, FactorAnswer>
  instruments: Record<string, Record<number, number>>
  meds: DrugInfo[]
  redFlags: string[]
}

// Mapea lo que captura la app → inputs del modelo Kaizen-MRCA. CQC/GDS/T-ADLQ
// validados alimentan cqc_total/gds_total/adlq con datos REALES.
export function buildMrcaInputs(inp: PreconsultaInputs): MrcaRawInputs {
  const L = inp.lancet
  const yes = (k: string) => L[k] === 'si'
  const cqc = scoreInstrument(INSTRUMENTS.cqc, inp.instruments.cqc ?? {})
  const gds = scoreInstrument(INSTRUMENTS.gds, inp.instruments.gds ?? {})
  const tadlq = scoreInstrument(INSTRUMENTS.tadlq, inp.instruments.tadlq ?? {})
  // Instrumentos de informante (cuidador): IQCODE → queja cognitiva, FAQ → función.
  const iqcode = scoreInstrument(INSTRUMENTS.iqcode, inp.instruments.iqcode ?? {})
  const faq = scoreInstrument(INSTRUMENTS.faq, inp.instruments.faq ?? {})
  const cqcTotal = cqc.answered
    ? cqc.score
    : iqcode.answered
      ? Math.max(0, ((iqcode.score / 16 - 3) / 2) * 96) // IQCODE medio 3→0, 5→96
      : undefined
  const adlqPct = tadlq.answered
    ? (tadlq.score / INSTRUMENTS.tadlq.max) * 100
    : faq.answered
      ? (faq.score / INSTRUMENTS.faq.max) * 100
      : undefined
  return {
    edad: inp.demo.edad ?? 65,
    sexo: inp.demo.sexo ?? 'Mujer',
    edu_anios: inp.demo.edu_anios ?? 7,
    cqc_total: cqcTotal,
    gds_total: gds.answered ? gds.score : undefined,
    adlq_pct: adlqPct,
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
  modo?: Modo
  depto?: string
  modifiableRiskPct: number
  modifiableRiskShare: number
  presentFactors: string[]
  topFactors: { id: string; paf: number }[]
  mrcaBand: MrcaModelBand
  mrcaProb: number
  mrcaDecision: 'derivar' | 'descartar'
  mrcaPreliminary: boolean
  mrcaAceEst: number
  instrumentScores: { id: string; name: string; text: string }[]
  meds: string[]
  medFlags: MedFlags
  redFlags: string[]
  equityScore: number
  equityFactors: string[]
  triageLevel: TriageLevel
  triageReasons: string[]
}

export function buildSummary(inp: PreconsultaInputs, createdAtISO: string): PreconsultaSummary {
  const risk = computeModifiableRisk(inp.lancet)
  const mrca = predictMrca(buildMrcaInputs(inp))
  const medFlags = computeMedFlags(inp.meds)
  const equity = computeEquity({
    edad: inp.demo.edad,
    edu_anios: inp.demo.edu_anios,
    vive: inp.demo.vive,
    cerca: inp.demo.cerca,
    isolation: inp.lancet.isolation === 'si',
  })
  const triage = computeTriage({
    modifiableRiskShare: risk.share,
    mrcaBand: mrca.band,
    mrcaDerivar: mrca.decision === 'derivar',
    redFlagsCount: inp.redFlags.length,
    medConcern: medFlags.anyConcern,
    equityScore: equity.score,
  })
  const instrumentScores = ['cqc', 'gds', 'tadlq', 'ad8', 'iqcode', 'faq', 'gad', 'ucla']
    .map((id) => {
      const inst = INSTRUMENTS[id]
      if (!inst) return null
      const s = scoreInstrument(inst, inp.instruments[id] ?? {})
      return s.answered ? { id, name: inst.name, text: s.text } : null
    })
    .filter((x): x is { id: string; name: string; text: string } => x !== null)

  return {
    createdAt: createdAtISO,
    modo: inp.demo.modo,
    depto: inp.demo.depto,
    modifiableRiskPct: Math.round(risk.modifiableRiskPct),
    modifiableRiskShare: risk.share,
    presentFactors: risk.presentFactors.map((f) => f.id),
    topFactors: risk.topFactors,
    mrcaBand: mrca.band,
    mrcaProb: mrca.prob,
    mrcaDecision: mrca.decision,
    mrcaPreliminary: mrca.preliminary,
    mrcaAceEst: mrca.aceEst,
    instrumentScores,
    meds: inp.meds.map((m) => m.name),
    medFlags,
    redFlags: inp.redFlags,
    equityScore: equity.score,
    equityFactors: equity.factors,
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
              text: `MRCA banda ${s.mrcaBand} (prob ${s.mrcaProb}, ${s.mrcaDecision}${s.mrcaPreliminary ? ', preliminar' : ''}); riesgo modificable ~${s.modifiableRiskPct}%; equidad ${s.equityScore}; ${s.instrumentScores.map((i) => `${i.name}: ${i.text}`).join('; ')}`,
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
