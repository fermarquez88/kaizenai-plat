// Seam FHIR (R4). v1 standalone: este export "habla FHIR" para conectar a la HCE
// oficial en el piloto sin rehacer nada. Se completa en F5
// (QuestionnaireResponse / RiskAssessment / Observation).
import type { Person, PreAssessmentSummary } from './types'

export interface FhirExportInput {
  person: Person
  assessment?: PreAssessmentSummary
}

export function toFhirBundle(_input: FhirExportInput): Record<string, unknown> {
  // Placeholder estructural. F5 lo completa.
  return {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [],
  }
}
