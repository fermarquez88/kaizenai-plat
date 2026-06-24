import { describe, expect, it } from 'vitest'
import { bundleFromData } from './fhirExport'
import type { PreAssessmentSummary, Person } from './types'

const person: Person = { id: 'x', alias: 'M. R.', lang: 'es', createdAt: 0, depto: 'Jáchal' }
const assessment: PreAssessmentSummary = {
  id: 'a',
  personId: 'x',
  createdAt: 0,
  triage: 'rojo',
  mrcaBand: 'alto',
  mrcaProb: 0.5,
  riskPct: 31,
  derivationStatus: 'emitida',
}

describe('FHIR bundleFromData', () => {
  it('incluye Consent, Patient y RiskAssessment con referencias correctas', () => {
    const b = bundleFromData({
      people: [person],
      assessments: [assessment],
      consent: { accepted: true, at: 0, version: '1.0', scope: 'cribado' },
    }) as { entry: { resource: Record<string, unknown> }[] }
    const types = b.entry.map((e) => e.resource.resourceType)
    expect(types).toContain('Consent')
    expect(types).toContain('Patient')
    expect(types).toContain('RiskAssessment')
    const ra = b.entry.find((e) => e.resource.resourceType === 'RiskAssessment')!.resource as Record<string, any>
    expect(ra.subject.reference).toBe('Patient/x')
    expect(ra.prediction[0].qualitativeRisk.text).toBe('rojo')
    const consent = b.entry.find((e) => e.resource.resourceType === 'Consent')!.resource as Record<string, any>
    expect(consent.patient.reference).toBe('Patient/x')
  })

  it('omite Consent si no se pasa y produce un Bundle vacío válido', () => {
    const b = bundleFromData({ people: [], assessments: [] }) as Record<string, any>
    expect(b.resourceType).toBe('Bundle')
    expect(b.entry.length).toBe(0)
  })
})
