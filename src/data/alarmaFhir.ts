// Seam FHIR (R4) del modelo de red: la ALARMA es un DetectedIssue (con dueño-de-loop y la
// acción que la extingue como mitigation.action), y cada punto MEDIBLE es un Observation +
// Provenance (con la procedencia como tag). El hueco "desconocido" NO emite Observation: la
// ausencia ES el pedido. Es un adaptador de SALIDA (no el modelo de runtime). No persiste.
import type { Alarma } from '../scoring/alarmas'
import type { Medible } from '../scoring/medibles'
import { PROCEDENCIA_SYSTEM } from '../scoring/medibles'

const ESTADO_FHIR: Record<Alarma['estado'], string> = {
  abierta: 'registered',
  enCurso: 'preliminary',
  cerrada: 'final',
}
const SEVERIDAD_FHIR: Record<Alarma['severidad'], string> = {
  aguda: 'high',
  alta: 'high',
  media: 'moderate',
  baja: 'low',
}

export const BRECHA_EXTENSION = 'https://kaizenai.ar/fhir/StructureDefinition/brecha-servicio'

/** Alarma → DetectedIssue R4. */
export function detectedIssueFromAlarma(a: Alarma): Record<string, unknown> {
  return {
    resourceType: 'DetectedIssue',
    id: a.id,
    status: ESTADO_FHIR[a.estado],
    severity: SEVERIDAD_FHIR[a.severidad],
    code: { text: a.tipo },
    identifiedDateTime: new Date(a.createdAt).toISOString(),
    patient: { reference: `Patient/${a.personId}` },
    author: { display: a.duenoRol }, // dueño-de-loop
    ...(a.detalle ? { detail: a.detalle } : {}),
    mitigation: [{ action: { text: a.accion } }], // acción que la extingue
    ...(a.brechaDeServicio ? { extension: [{ url: BRECHA_EXTENSION, valueBoolean: true }] } : {}),
  }
}

/** Medible → pares Observation+Provenance (uno por punto medido/reportado). */
export function observationsFromMedible(personId: string, m: Medible): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = []
  m.puntos.forEach((punto, i) => {
    if (punto.procedencia === 'desconocido') return // la ausencia no es un dato
    const obsId = `${personId}-${m.tipo}-${i}`
    out.push({
      resourceType: 'Observation',
      id: obsId,
      status: 'final',
      code: { text: m.tipo },
      subject: { reference: `Patient/${personId}` },
      effectiveDateTime: new Date(punto.fecha).toISOString(),
      valueQuantity: { value: punto.valor, unit: m.unidad },
    })
    out.push({
      resourceType: 'Provenance',
      target: [{ reference: `Observation/${obsId}` }],
      recorded: new Date(punto.fecha).toISOString(),
      agent: [{ who: { display: punto.autorRol } }],
      meta: { tag: [{ system: PROCEDENCIA_SYSTEM, code: punto.procedencia }] },
    })
  })
  return out
}

/** Bundle de ejemplo (seam): alarmas + medibles de una persona. */
export function bundleAlarmasMedibles(
  personId: string,
  alarmas: Alarma[],
  medibles: Medible[],
): Record<string, unknown> {
  const entry: Record<string, unknown>[] = [
    ...alarmas.map((a) => ({ resource: detectedIssueFromAlarma(a) })),
    ...medibles.flatMap((m) => observationsFromMedible(personId, m)).map((resource) => ({ resource })),
  ]
  return {
    resourceType: 'Bundle',
    type: 'collection',
    entry,
    meta: { tag: [{ display: 'KaizenAI · FHIR seam (alarmas+medibles) · estimación, no diagnóstico' }] },
  }
}
