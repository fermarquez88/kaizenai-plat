// Resumen de preconsulta: ensambla los resultados (modelo MRCA real con instrumentos
// validados + equidad) y emite export JSON + bundle FHIR R4 (seam hacia la HCE).

import { computeModifiableRisk, type FactorAnswer } from '../scoring/lancet'
import { INSTRUMENTS, scoreInstrument } from '../scoring/instruments'
import { type MrcaModelBand, type MrcaRawInputs } from '../scoring/mrcaModel'
import { predictMrcaReduced } from '../scoring/mrcaReducedModel'
import { computeMedFlags, type DrugInfo, type MedFlags } from '../scoring/medications'
import { computeTriage, type TriageLevel } from '../scoring/triage'
import { computeEquity, type Cerca, type Vive } from '../scoring/equity'
import {
  bmiFrom,
  computeRiskScores,
  MRCA_FEATURE_LABELS,
  type Factores,
  type RiskInputs,
  type RiskScore,
} from '../scoring/riskScores'

export type Modo = 'persona' | 'cuidador' | 'agente'

export interface Demografia {
  modo?: Modo
  alias?: string
  phone?: string
  cuidadorAlias?: string
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
  factores: Factores
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
  alias?: string
  ageYears?: number
  sexo?: 'Mujer' | 'Hombre'
  depto?: string
  phone?: string
  modifiableRiskPct: number
  modifiableRiskShare: number
  presentFactors: string[]
  topFactors: { id: string; paf: number }[]
  mrcaBand: MrcaModelBand
  mrcaProb: number
  mrcaDecision: 'derivar' | 'descartar'
  mrcaPreliminary: boolean
  mrcaAceEst: number
  mrcaCut: number
  mrcaThreshold: number
  mrcaContribs: { feature: string; label: string; value: number }[]
  riskScores: RiskScore[]
  instrumentScores: { id: string; name: string; text: string }[]
  meds: string[]
  medFlags: MedFlags
  redFlags: string[]
  equityScore: number
  equityFactors: string[]
  triageLevel: TriageLevel
  triageReasons: string[]
}

function buildRiskInputs(inp: PreconsultaInputs): RiskInputs {
  const L = inp.lancet
  const f = inp.factores
  const yes = (k: string) => L[k] === 'si'
  return {
    edad: inp.demo.edad,
    sexo: inp.demo.sexo,
    edu_anios: inp.demo.edu_anios,
    bmi: bmiFrom(f),
    sbp: f.pas_mmhg,
    cholTotalMgdl: f.colesterol_total,
    hipertension: yes('hypertension'),
    diabetes: yes('diabetes'),
    colesterolDx: yes('ldl'),
    obesidadDx: yes('obesity'),
    depresion: yes('depression'),
    tec: yes('tbi'),
    // Cascada (??): el gradiente armonizado tiene prioridad; el sí/no de Prevención es respaldo.
    // El binario isolation='si' (vive aislado) sólo se proyecta a la categoría más baja de red social.
    // Alcohol "excess" NO puntúa en estos índices (ANU-ADRI: pesado=0; LIBRA: sólo protege bajo-moderado),
    // por lo que el proxy desde el binario es inocuo y conservador.
    tabaquismo: f.tabaquismo ?? (yes('smoking') ? 'current' : undefined),
    actividadFisica: f.actividad_fisica,
    inactividad: yes('inactivity'),
    actividadCognitiva: f.actividad_cognitiva,
    redSocial: f.red_social ?? (yes('isolation') ? 'low' : undefined),
    pescado: f.pescado,
    dieta: f.dieta,
    alcohol: f.alcohol_patron ?? (yes('alcohol') ? 'excess' : undefined),
    cardiopatia: f.cardiopatia,
    renal: f.enf_renal,
    ictus: f.ictus,
    fibrilacion: f.fibrilacion,
    insomnio: f.insomnio,
  }
}

export function buildSummary(inp: PreconsultaInputs, createdAtISO: string): PreconsultaSummary {
  const risk = computeModifiableRisk(inp.lancet)
  // Modelo MOSTRADO: Kaizen-MRCA reducido de 7 preguntas (decisión clínica 2026-06-24).
  // Inputs que la app capta: edad·sexo·educación + audición·tabaquismo·vive_solo (Lancet).
  // Faltantes → NaN → 'preliminar' (no se asume). sexo: Mujer=1/Hombre=0 (convención FE_SAP).
  // El modelo COMPLETO (predictMrca/buildMrcaInputs) queda disponible y testeado, no wireado.
  const yesL = (k: string) => inp.lancet[k] === 'si'
  const mrca = predictMrcaReduced({
    edad: inp.demo.edad ?? NaN,
    sexo: inp.demo.sexo === 'Mujer' ? 1 : inp.demo.sexo === 'Hombre' ? 0 : NaN,
    edu_anios: inp.demo.edu_anios ?? NaN,
    hipoacusia: yesL('hearing') ? 1 : 0,
    fumador: yesL('smoking') ? 1 : 0,
    vive_solo: yesL('isolation') ? 1 : 0,
  })
  const riskScores = computeRiskScores(buildRiskInputs(inp))
  const mrcaContribs = mrca.contribs.slice(0, 6).map((c) => ({
    feature: c.feature,
    label: MRCA_FEATURE_LABELS[c.feature] ?? c.feature,
    value: c.value,
  }))
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
  const instrumentScores = ['cqc', 'gds', 'tadlq', 'isi', 'mind', 'ad8', 'iqcode', 'faq', 'gad', 'ucla']
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
    alias: inp.demo.alias,
    ageYears: inp.demo.edad,
    sexo: inp.demo.sexo,
    depto: inp.demo.depto,
    phone: inp.demo.phone,
    modifiableRiskPct: Math.round(risk.modifiableRiskPct),
    modifiableRiskShare: risk.share,
    presentFactors: risk.presentFactors.map((f) => f.id),
    topFactors: risk.topFactors,
    mrcaBand: mrca.band,
    mrcaProb: mrca.prob,
    mrcaDecision: mrca.decision,
    // Honestidad (auditoría): si faltan edad/sexo/educación se usan defaults (65/Mujer/7) →
    // el resultado es PRELIMINAR aunque el modelo no tenga features NaN. No se asume en silencio.
    mrcaPreliminary:
      mrca.preliminary || inp.demo.edad == null || inp.demo.sexo == null || inp.demo.edu_anios == null,
    mrcaAceEst: mrca.aceEst,
    mrcaCut: mrca.cut,
    mrcaThreshold: mrca.threshold,
    mrcaContribs,
    riskScores,
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

// FHIR R4. Bundle con Patient + Consent + RiskAssessment + Observations +
// QuestionnaireResponse (uno por escala). Listo para la HCE oficial en el piloto.
export function toFhirBundle(s: PreconsultaSummary): Record<string, unknown> {
  const subject = { reference: 'Patient/p' }
  const patient = {
    resource: {
      resourceType: 'Patient',
      id: 'p',
      ...(s.alias ? { name: [{ text: s.alias }] } : {}),
      ...(s.sexo ? { gender: s.sexo === 'Mujer' ? 'female' : 'male' } : {}),
      ...(s.phone ? { telecom: [{ system: 'phone', value: s.phone }] } : {}),
    },
  }
  const consent = {
    resource: {
      resourceType: 'Consent',
      status: 'active',
      scope: { text: 'Cribado y acompañamiento de salud cerebral' },
      category: [{ text: 'Consentimiento informado in-app (KaizenAI)' }],
      dateTime: s.createdAt,
      patient: subject,
      policyRule: { text: 'Datos en el dispositivo de la persona (soberanía). Comparte con consentimiento.' },
    },
  }
  const riskAssessment = {
    resource: {
      resourceType: 'RiskAssessment',
      status: 'final',
      subject,
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
  }
  const observations = [
    {
      resource: {
        resourceType: 'Observation',
        status: 'final',
        subject,
        code: { text: 'ACE-III estimado (Kaizen-MRCA)' },
        valueQuantity: { value: s.mrcaAceEst },
      },
    },
    {
      resource: {
        resourceType: 'Observation',
        status: 'final',
        subject,
        code: { text: 'Carga anticolinérgica ACB' },
        valueInteger: s.medFlags.acbTotal,
      },
    },
    ...(s.ageYears != null
      ? [
          {
            resource: {
              resourceType: 'Observation',
              status: 'final',
              subject,
              code: { text: 'Edad (años)' },
              valueQuantity: { value: s.ageYears, unit: 'a' },
            },
          },
        ]
      : []),
  ]
  const questionnaireResponses = s.instrumentScores.map((i) => ({
    resource: {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      subject,
      authored: s.createdAt,
      questionnaire: `KaizenAI/${i.id}`,
      item: [{ text: i.name, answer: [{ valueString: i.text }] }],
    },
  }))

  return {
    resourceType: 'Bundle',
    type: 'collection',
    timestamp: s.createdAt,
    entry: [patient, consent, riskAssessment, ...observations, ...questionnaireResponses],
    meta: {
      tag: [{ display: 'KaizenAI · estimación, no diagnóstico · placeholders a validar' }],
    },
  }
}
