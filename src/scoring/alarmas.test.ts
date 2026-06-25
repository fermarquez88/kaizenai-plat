import { describe, it, expect } from 'vitest'
import {
  colaPorRol,
  derivarAlarmas,
  PRIORIDAD_AGUDA,
  prioridadAlarma,
  type DeriveAlarmasInput,
} from './alarmas'
import { DIA_MS, perfilVacio, type Medible } from './medibles'

const NOW = 1_700_000_000_000

const base = (over: Partial<DeriveAlarmasInput> = {}): DeriveAlarmasInput => ({
  personId: 'p1',
  alias: 'M. R.',
  riesgo: 0.5,
  vulnerabilidad: 0,
  diasSinContacto: 0,
  now: NOW,
  ...over,
})

describe('prioridadAlarma — una sola función f(riesgo, confiabilidad, vulnerabilidad)', () => {
  it('lo agudo hace bypass: siempre la prioridad máxima', () => {
    expect(prioridadAlarma({ riesgo: 0, confiabilidad: 'verde', vulnerabilidad: 0, aguda: true })).toBe(PRIORIDAD_AGUDA)
  })

  it('gris (desconocido) prioriza por sobre amarillo y verde a igual riesgo (triage por confiabilidad)', () => {
    const gris = prioridadAlarma({ riesgo: 0.4, confiabilidad: 'gris', vulnerabilidad: 0 })
    const amar = prioridadAlarma({ riesgo: 0.4, confiabilidad: 'amarillo', vulnerabilidad: 0 })
    const verde = prioridadAlarma({ riesgo: 0.4, confiabilidad: 'verde', vulnerabilidad: 0 })
    expect(gris).toBeGreaterThan(amar)
    expect(amar).toBeGreaterThan(verde)
  })

  it('la vulnerabilidad modula al alza (justicia, no severidad)', () => {
    const sinVuln = prioridadAlarma({ riesgo: 0.4, confiabilidad: 'verde', vulnerabilidad: 0 })
    const conVuln = prioridadAlarma({ riesgo: 0.4, confiabilidad: 'verde', vulnerabilidad: 5 })
    expect(conVuln).toBeGreaterThan(sinVuln)
  })
})

describe('derivarAlarmas — las 4 clases', () => {
  it('AGUDA: genera alarma con dueño médico, severidad aguda y prioridad de bypass', () => {
    const a = derivarAlarmas(base({ agudo: { presente: true, motivo: 'ideacionSuicida' } }))
    const aguda = a.find((x) => x.tipo === 'aguda')
    expect(aguda).toBeDefined()
    expect(aguda).toMatchObject({ severidad: 'aguda', duenoRol: 'medico', accion: 'protocoloInmediato' })
    expect(aguda?.prioridad).toBe(PRIORIDAD_AGUDA)
    // y va primera en la cola ordenada
    expect(a[0].tipo).toBe('aguda')
  })

  it('NO-VOLVIÓ: solo si supera el umbral; alta cuando está muy vencido', () => {
    expect(derivarAlarmas(base({ diasSinContacto: 30 })).some((x) => x.tipo === 'noVolvio')).toBe(false)
    const a = derivarAlarmas(base({ diasSinContacto: 120 })).find((x) => x.tipo === 'noVolvio')
    expect(a).toMatchObject({ duenoRol: 'agente', accion: 'reContactar', severidad: 'alta' })
  })

  it('PEDIDO DE MEDICIÓN: un hueco gris genera pedido al dueño correcto', () => {
    const medibles = perfilVacio() // todos gris
    const a = derivarAlarmas(base({ medibles, capacidad: { puedeMedir: { presionArterial: true } } }))
    const ta = a.find((x) => x.id === 'p1:pedidoMedicion:presionArterial')
    expect(ta).toMatchObject({ tipo: 'pedidoMedicion', duenoRol: 'enfermero', accion: 'medir', procedencia: 'desconocido', brechaDeServicio: false })
  })

  it('BRECHA DE SERVICIO: si el territorio no puede medir → dueño gestor, no carga a la persona', () => {
    const medibles: Medible[] = [{ tipo: 'audicion', unidad: 'dB', puntos: [] }]
    const a = derivarAlarmas(base({ medibles, capacidad: { puedeMedir: { audicion: false } } }))
    const br = a.find((x) => x.tipo === 'pedidoMedicion')
    expect(br).toMatchObject({ brechaDeServicio: true, duenoRol: 'gestor', accion: 'brechaServicio' })
  })

  it('un dato medido reciente NO genera pedido', () => {
    const medibles: Medible[] = [
      { tipo: 'presionArterial', unidad: 'mmHg', puntos: [{ valor: 120, fecha: NOW - 5 * DIA_MS, autorRol: 'enfermero', procedencia: 'medido' }] },
    ]
    expect(derivarAlarmas(base({ medibles })).some((x) => x.tipo === 'pedidoMedicion')).toBe(false)
  })

  it('DISCORDANCIA anosognosia: informante peor + convive + sin depresión → neuropsico/mirarJuntos', () => {
    const a = derivarAlarmas(
      base({ discordancia: { presente: true, direccion: 'informantePeor', informanteConvive: true } }),
    ).find((x) => x.tipo === 'discordancia')
    expect(a).toMatchObject({ duenoRol: 'neuropsico', accion: 'mirarJuntos', detalle: 'anosognosia', severidad: 'alta' })
  })

  it('DISCORDANCIA con confusor (informante deprimido) NO se reifica como anosognosia', () => {
    const a = derivarAlarmas(
      base({ discordancia: { presente: true, direccion: 'informantePeor', informanteConvive: true, informanteDeprimido: true } }),
    ).find((x) => x.tipo === 'discordancia')
    expect(a?.detalle).not.toBe('anosognosia')
    expect(a?.duenoRol).toBe('medico')
  })

  it('DISCORDANCIA persona peor → ruta de ánimo (depresión), no demencia', () => {
    const a = derivarAlarmas(
      base({ discordancia: { presente: true, direccion: 'personaPeor' } }),
    ).find((x) => x.tipo === 'discordancia')
    expect(a).toMatchObject({ accion: 'evaluarAnimo', detalle: 'depresion', duenoRol: 'medico' })
  })
})

describe('colaPorRol — una sola cola filtrada por rol (proyección, no copia)', () => {
  const alarmas = derivarAlarmas(
    base({
      diasSinContacto: 120,
      agudo: { presente: true },
      medibles: [{ tipo: 'audicion', unidad: 'dB', puntos: [] }],
      capacidad: { puedeMedir: { audicion: false } }, // → brecha de servicio
      discordancia: { presente: true, direccion: 'informantePeor', informanteConvive: true },
    }),
  )

  it('la díada co-posee todas sus alarmas', () => {
    expect(colaPorRol(alarmas, 'diada').length).toBe(alarmas.length)
  })

  it('el agente ve no-volvió pero NO la brecha de servicio (no le carga lo que no puede cerrar)', () => {
    const cola = colaPorRol(alarmas, 'agente')
    expect(cola.some((a) => a.tipo === 'noVolvio')).toBe(true)
    expect(cola.some((a) => a.brechaDeServicio)).toBe(false)
  })

  it('el gestor ve la brecha de servicio (agregado de política)', () => {
    expect(colaPorRol(alarmas, 'gestor').some((a) => a.brechaDeServicio)).toBe(true)
  })

  it('una alarma cerrada no aparece en ninguna cola', () => {
    const cerradas = alarmas.map((a) => ({ ...a, estado: 'cerrada' as const }))
    expect(colaPorRol(cerradas, 'diada')).toHaveLength(0)
  })
})
