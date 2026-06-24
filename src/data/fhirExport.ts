// Seam FHIR (R4) a nivel de TODO el registro de la persona (Patient + Consent +
// RiskAssessment por cada cribado). Se usa en "Mis datos" y queda listo para
// transmitir a la HCE oficial (HSI/Andes) en el piloto, sin rehacer nada.
import type { ConsentRecord, Person, PreAssessmentSummary } from './types'

export interface FhirExportInput {
  people: Person[]
  assessments: PreAssessmentSummary[]
  consent?: ConsentRecord
}

export function bundleFromData(input: FhirExportInput): Record<string, unknown> {
  const { people, assessments, consent } = input
  const entry: Record<string, unknown>[] = []

  if (consent) {
    entry.push({
      resource: {
        resourceType: 'Consent',
        status: consent.accepted ? 'active' : 'rejected',
        scope: { text: consent.scope },
        category: [{ text: 'Consentimiento informado in-app (KaizenAI)' }],
        dateTime: new Date(consent.at).toISOString(),
        ...(people[0] ? { patient: { reference: `Patient/${people[0].id}` } } : {}),
        policyRule: { text: `KaizenAI consent v${consent.version} · datos en el dispositivo de la persona` },
      },
    })
  }

  for (const p of people) {
    entry.push({
      resource: {
        resourceType: 'Patient',
        id: p.id,
        name: [{ text: p.alias }],
        ...(p.depto ? { address: [{ district: p.depto, state: 'San Juan', country: 'AR' }] } : {}),
      },
    })
  }

  for (const a of assessments) {
    entry.push({
      resource: {
        resourceType: 'RiskAssessment',
        status: 'final',
        subject: { reference: `Patient/${a.personId}` },
        occurrenceDateTime: new Date(a.createdAt).toISOString(),
        code: { text: 'Cribado de riesgo cognitivo (KaizenAI)' },
        prediction: [
          {
            outcome: { text: 'Prioridad de derivación' },
            ...(a.triage ? { qualitativeRisk: { text: a.triage } } : {}),
            ...(a.mrcaProb != null ? { probabilityDecimal: a.mrcaProb } : {}),
          },
        ],
        note: [
          {
            text: `MRCA ${a.mrcaBand ?? '-'}; derivación ${a.derivationStatus ?? 'sin emitir'}; factores ~${a.riskPct ?? '-'}%`,
          },
        ],
      },
    })
  }

  return {
    resourceType: 'Bundle',
    type: 'collection',
    entry,
    meta: { tag: [{ display: 'KaizenAI · FHIR seam · estimación, no diagnóstico' }] },
  }
}
