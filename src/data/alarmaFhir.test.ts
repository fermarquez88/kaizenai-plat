import { describe, it, expect } from 'vitest'
import { BRECHA_EXTENSION, bundleAlarmasMedibles, detectedIssueFromAlarma, observationsFromMedible } from './alarmaFhir'
import { PROCEDENCIA_SYSTEM, type Medible } from '../scoring/medibles'
import type { Alarma } from '../scoring/alarmas'

const NOW = Date.UTC(2026, 5, 25)

const alarma = (over: Partial<Alarma> = {}): Alarma => ({
  id: 'p7:pedidoMedicion:hba1c',
  personId: 'p7',
  alias: 'L. F.',
  tipo: 'pedidoMedicion',
  severidad: 'media',
  procedencia: 'desconocido',
  duenoRol: 'enfermero',
  accion: 'medir',
  estado: 'abierta',
  prioridad: 50,
  brechaDeServicio: false,
  detalle: 'hba1c',
  createdAt: NOW,
  ...over,
})

describe('alarmaFhir — Alarma → DetectedIssue', () => {
  it('mapea acción a mitigation.action, dueño a author y estado/severidad', () => {
    const di = detectedIssueFromAlarma(alarma())
    expect(di).toMatchObject({
      resourceType: 'DetectedIssue',
      status: 'registered',
      severity: 'moderate',
      author: { display: 'enfermero' },
      patient: { reference: 'Patient/p7' },
    })
    expect((di.mitigation as { action: { text: string } }[])[0].action.text).toBe('medir')
  })

  it('la alarma aguda es severity high; la cerrada es status final', () => {
    expect(detectedIssueFromAlarma(alarma({ severidad: 'aguda' })).severity).toBe('high')
    expect(detectedIssueFromAlarma(alarma({ estado: 'cerrada' })).status).toBe('final')
  })

  it('la brecha de servicio agrega la extensión correspondiente', () => {
    const di = detectedIssueFromAlarma(alarma({ brechaDeServicio: true, duenoRol: 'gestor', accion: 'brechaServicio' }))
    expect((di.extension as { url: string; valueBoolean: boolean }[])[0]).toMatchObject({ url: BRECHA_EXTENSION, valueBoolean: true })
  })
})

describe('alarmaFhir — Medible → Observation + Provenance', () => {
  const m: Medible = {
    tipo: 'presionArterial',
    unidad: 'mmHg',
    puntos: [
      { valor: 150, fecha: NOW, autorRol: 'medico', procedencia: 'medido' },
      { valor: 0, fecha: NOW, autorRol: 'diada', procedencia: 'desconocido' }, // no debe emitir
    ],
  }

  it('emite Observation+Provenance por cada punto conocido; el desconocido no emite', () => {
    const res = observationsFromMedible('p7', m)
    expect(res.filter((r) => r.resourceType === 'Observation')).toHaveLength(1)
    const obs = res.find((r) => r.resourceType === 'Observation')!
    expect(obs).toMatchObject({ valueQuantity: { value: 150, unit: 'mmHg' }, subject: { reference: 'Patient/p7' } })
    const prov = res.find((r) => r.resourceType === 'Provenance')!
    expect((prov.meta as { tag: { system: string; code: string }[] }).tag[0]).toMatchObject({ system: PROCEDENCIA_SYSTEM, code: 'medido' })
  })

  it('bundle de ejemplo agrupa DetectedIssue + Observation/Provenance', () => {
    const b = bundleAlarmasMedibles('p7', [alarma()], [m])
    expect(b.resourceType).toBe('Bundle')
    const tipos = (b.entry as { resource: { resourceType: string } }[]).map((e) => e.resource.resourceType)
    expect(tipos).toContain('DetectedIssue')
    expect(tipos).toContain('Observation')
    expect(tipos).toContain('Provenance')
  })
})
