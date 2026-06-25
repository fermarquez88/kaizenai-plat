// La ALARMA es la unidad atómica de la red: un objeto compartido (no una notificación)
// con 5 propiedades — (1) tipo; (2) procedencia/confiabilidad; (3) DUEÑO-DE-LOOP (un rol
// responsable de cerrarla); (4) ACCIÓN que la extingue; (5) ESTADO de cierre. Todos los
// actores ven la MISMA cola filtrada por rol. Generaliza el patrón derivationStatus ya
// probado. Cerrar una alarma genera un dato (huella longitudinal) → Learning Health System.
//
// Refinamientos del panel transdisciplinario (2026-06-25):
//  · BRECHA DE SERVICIO = estado de 1ª clase: lo que el territorio NO puede cerrar sube
//    AGREGADO al registro (responsabilidad del Estado), NO carga a la persona ni al agente.
//  · Clase AGUDA/REVERSIBLE con bypass del triage crónico (SLA en horas).
//  · Discordancia con DIRECCIÓN + confusores: solo es señal de anosognosia bajo condiciones.
//  · Una SOLA función de prioridad = f(riesgo, confiabilidad, vulnerabilidad).
// ⚠️ Reglas y pesos orientativos, a validar localmente. No diagnostica.
import type { Confiabilidad, Medible, MedibleTipo, Procedencia, Rol } from './medibles'
import { confiabilidad as confiabilidadMedible } from './medibles'
import { DIAS_NO_VOLVIO } from './retention'

export type AlarmaTipo = 'aguda' | 'noVolvio' | 'pedidoMedicion' | 'discordancia'
export type AlarmaEstado = 'abierta' | 'enCurso' | 'cerrada'
export type Severidad = 'aguda' | 'alta' | 'media' | 'baja'

// Ciclo de vida (paralelo a DERIVATION_FLOW): cerrar genera la huella longitudinal.
export const ALARMA_FLOW: AlarmaEstado[] = ['abierta', 'enCurso', 'cerrada']

export interface Alarma {
  id: string // estable: `${personId}:${tipo}[:${sub}]` — re-derivable sin duplicar
  personId: string
  alias: string
  tipo: AlarmaTipo
  severidad: Severidad
  procedencia: Procedencia // confiabilidad del dato que la origina
  duenoRol: Rol // (3) dueño-de-loop
  accion: string // (4) acción que la extingue → i18n alarmas.accion.<code>
  estado: AlarmaEstado // (5) estado de cierre
  prioridad: number // f(riesgo, confiabilidad, vulnerabilidad); la aguda domina
  /** El territorio no puede cerrarla → sube agregada al registro como brecha del Estado;
   *  NUNCA se presenta como pendiente de la persona ni colorea su perfil como déficit. */
  brechaDeServicio: boolean
  detalle?: string // i18n key o texto corto de contexto
  createdAt: number
}

// ── Prioridad: UNA sola función (el panel pidió no tener tres sistemas de triage) ──────
export interface PrioridadInput {
  riesgo: number // 0..1 (p. ej. mrcaProb o riskShare)
  /** confiabilidad del dato clave: gris sube la prioridad (triage por confiabilidad). */
  confiabilidad: Confiabilidad
  vulnerabilidad: number // equityScore (modulador de justicia, no de severidad)
  aguda?: boolean
}

export const PRIORIDAD_AGUDA = 1000

export function prioridadAlarma(i: PrioridadInput): number {
  if (i.aguda) return PRIORIDAD_AGUDA // bypass: lo agudo/reversible siempre arriba
  const conf = i.confiabilidad === 'gris' ? 1 : i.confiabilidad === 'amarillo' ? 0.5 : 0
  // pesos orientativos: riesgo + brecha de medición + modulador de vulnerabilidad
  return Math.round((i.riesgo * 50 + conf * 25 + i.vulnerabilidad * 5) * 10) / 10
}

// ── Capacidad local (catálogo de capacidades): qué se puede cerrar en el territorio ────
export interface CapacidadLocal {
  /** medibles que el territorio puede medir; ausente/false = brecha de servicio. */
  puedeMedir?: Partial<Record<MedibleTipo, boolean>>
  /** ¿existe vía de confirmación/tratamiento? (Wilson-Jungner: no cribar lo que no se sigue). */
  hayDerivacionClinica?: boolean
}

// Quién es dueño natural del pedido de medición de cada medible.
const DUENO_MEDIBLE: Record<MedibleTipo, Rol> = {
  presionArterial: 'enfermero',
  imc: 'enfermero',
  hba1c: 'enfermero',
  ldl: 'enfermero',
  audicion: 'medico',
  vision: 'medico',
}

// ── Discordancia díada con dirección + confusores (refinamiento clínico #3) ────────────
export interface DiscordanciaInfo {
  presente: boolean
  /** informantePeor = informante reporta más deterioro (posible anosognosia);
   *  personaPeor = la persona se reporta peor (posible depresión/sobre-reporte). */
  direccion?: 'informantePeor' | 'personaPeor'
  informanteConvive?: boolean
  informanteDeprimido?: boolean
  personaSobreReporteDepresivo?: boolean
}

export interface DeriveAlarmasInput {
  personId: string
  alias: string
  riesgo: number // 0..1
  vulnerabilidad: number // equityScore
  diasSinContacto: number
  noVolvioUmbral?: number
  /** señal aguda/reversible: ideación suicida (GDS), delirium, deterioro brusco, sospecha ACV. */
  agudo?: { presente: boolean; motivo?: string }
  discordancia?: DiscordanciaInfo
  medibles?: Medible[]
  capacidad?: CapacidadLocal
  now: number
}

function nueva(
  base: Pick<DeriveAlarmasInput, 'personId' | 'alias' | 'now'>,
  a: Omit<Alarma, 'personId' | 'alias' | 'createdAt'>,
): Alarma {
  return { personId: base.personId, alias: base.alias, createdAt: base.now, ...a }
}

/**
 * Deriva la cola de alarmas de una persona desde su estado actual (sin persistir).
 * Mismo patrón que redRecords.fromAssessment: se calcula en tiempo de lectura.
 */
export function derivarAlarmas(input: DeriveAlarmasInput): Alarma[] {
  const { personId, alias, now, riesgo, vulnerabilidad } = input
  const alarmas: Alarma[] = []

  // 1) AGUDA / REVERSIBLE — bypass del triage crónico, SLA en horas.
  if (input.agudo?.presente) {
    alarmas.push(
      nueva(input, {
        id: `${personId}:aguda`,
        tipo: 'aguda',
        severidad: 'aguda',
        procedencia: 'reportado',
        duenoRol: 'medico',
        accion: 'protocoloInmediato',
        estado: 'abierta',
        prioridad: prioridadAlarma({ riesgo, confiabilidad: 'gris', vulnerabilidad, aguda: true }),
        brechaDeServicio: false, // lo agudo siempre debe tener vía; si no, es emergencia, no cribado
        detalle: input.agudo.motivo,
      }),
    )
  }

  // 2) NO-VOLVIÓ — abandono = modo de falla #1; dueño = agente humano.
  const umbral = input.noVolvioUmbral ?? DIAS_NO_VOLVIO
  if (input.diasSinContacto > umbral) {
    const muyVencido = input.diasSinContacto > umbral * 1.5
    alarmas.push(
      nueva(input, {
        id: `${personId}:noVolvio`,
        tipo: 'noVolvio',
        severidad: muyVencido ? 'alta' : 'media',
        procedencia: 'medido', // el "días sin contacto" es un dato observado
        duenoRol: 'agente',
        accion: 'reContactar',
        estado: 'abierta',
        prioridad: prioridadAlarma({ riesgo, confiabilidad: 'amarillo', vulnerabilidad }),
        brechaDeServicio: false,
        detalle: `${input.diasSinContacto}`,
      }),
    )
  }

  // 3) PEDIDO DE MEDICIÓN — cada hueco gris (nunca/desconocido) es accionable, no null.
  for (const m of input.medibles ?? []) {
    const conf = confiabilidadMedible(m, now)
    if (conf !== 'gris') continue
    const puede = input.capacidad?.puedeMedir?.[m.tipo]
    // Si el territorio NO puede medir → BRECHA DE SERVICIO: dueño = gestor (sube al registro),
    // NO se presenta como pendiente de la persona ni del agente.
    const brecha = puede === false
    alarmas.push(
      nueva(input, {
        id: `${personId}:pedidoMedicion:${m.tipo}`,
        tipo: 'pedidoMedicion',
        severidad: brecha ? 'media' : vulnerabilidad >= 3 ? 'alta' : 'media',
        procedencia: 'desconocido',
        duenoRol: brecha ? 'gestor' : DUENO_MEDIBLE[m.tipo],
        accion: brecha ? 'brechaServicio' : 'medir',
        estado: 'abierta',
        prioridad: prioridadAlarma({ riesgo, confiabilidad: 'gris', vulnerabilidad }),
        brechaDeServicio: brecha,
        detalle: m.tipo,
      }),
    )
  }

  // 4) DISCORDANCIA díada — señal clínica con dirección y confusores, nunca acusación.
  const d = input.discordancia
  if (d?.presente) {
    const esAnosognosia =
      d.direccion === 'informantePeor' &&
      d.informanteConvive === true &&
      !d.informanteDeprimido &&
      !d.personaSobreReporteDepresivo
    const esDepresion = d.direccion === 'personaPeor'
    alarmas.push(
      nueva(input, {
        id: `${personId}:discordancia`,
        tipo: 'discordancia',
        severidad: esAnosognosia ? 'alta' : 'media',
        procedencia: 'reportado',
        // anosognosia → mirada neuropsico; sobre-reporte/depresión → ruta clínica de ánimo.
        duenoRol: esAnosognosia ? 'neuropsico' : 'medico',
        accion: esDepresion ? 'evaluarAnimo' : 'mirarJuntos',
        estado: 'abierta',
        prioridad: prioridadAlarma({ riesgo, confiabilidad: 'amarillo', vulnerabilidad }),
        brechaDeServicio: false,
        detalle: esAnosognosia ? 'anosognosia' : esDepresion ? 'depresion' : 'revisar',
      }),
    )
  }

  return alarmas.sort((a, b) => b.prioridad - a.prioridad)
}

// ── Cola única filtrada por rol (vistas/proyecciones, no copias) ───────────────────────
// Qué tipos de alarma "posee" cada rol. La díada ve sus propias alarmas (co-posesión);
// la brecha de servicio la posee el gestor (no carga a la persona ni al agente).
const COLA_POR_ROL: Record<Rol, AlarmaTipo[]> = {
  diada: ['noVolvio', 'pedidoMedicion', 'discordancia', 'aguda'],
  agente: ['noVolvio', 'pedidoMedicion'],
  enfermero: ['pedidoMedicion', 'aguda'],
  medico: ['aguda', 'discordancia', 'pedidoMedicion'],
  neuropsico: ['discordancia'],
  gestor: ['noVolvio', 'pedidoMedicion', 'discordancia', 'aguda'], // ve agregados + brechas
}

export function colaPorRol(alarmas: Alarma[], rol: Rol): Alarma[] {
  const tipos = COLA_POR_ROL[rol]
  return alarmas
    .filter((a) => a.estado !== 'cerrada')
    .filter((a) => {
      // El gestor es dueño de las brechas de servicio (agregado de política).
      if (a.brechaDeServicio) return rol === 'gestor' || rol === 'diada'
      // La díada co-posee toda alarma sobre sí; los demás, por tipo y por ser su dueño.
      if (rol === 'diada') return true
      return tipos.includes(a.tipo) || a.duenoRol === rol
    })
    .sort((x, y) => y.prioridad - x.prioridad)
}
