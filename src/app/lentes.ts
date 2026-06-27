// MATRIZ DECLARATIVA DE LENTES — la clave técnica de la IA: cada actor es una VISTA sobre
// la misma ficha-persona y la misma cola de alarmas. Toda pantalla deriva de esta tabla:
// home, navegación inferior, cola filtrada (rol), tabs por defecto y acciones permitidas
// sobre una ficha. Agregar una lente = UNA fila, no código nuevo.
import type { Rol } from '../scoring/alarmas'

export type LenteId =
  | 'paciente' | 'cuidador' | 'agente' | 'enfermeria' | 'unidad' | 'neuropsico' | 'social' | 'gestor' | 'comunidad'

export type FichaAccion = 'pedir' | 'neuropsico' | 'informe' | 'medir' | 'contacto' | 'social' | 'diagnostico' | 'turno'
export type HomeKind = 'persona' | 'gente' | 'cola' | 'tablero'
export type RedTab = 'gente' | 'cola' | 'bandeja' | 'tablero'
/** PIEL de la lente (decisión de rediseño 2026-06-27): la díada vive un HILO conversacional
 *  cálido; el equipo, un CUADERNO de tareas con deep-link. La matriz ya no pinta barras a mano. */
export type Modo = 'hilo' | 'cuaderno'
export type Voz = 'calida' | 'tecnica'

export interface NavItem {
  key: string
  /** segmento relativo a /p/:id ('' = home de la lente); con '/' inicial = ruta absoluta. */
  seg: string
}

export interface Lente {
  id: LenteId
  rol: Rol
  modo: Modo
  voz: Voz
  homeKind: HomeKind
  /** segmento del home relativo a /p/:id ('' = RoleHome). */
  homeSeg: string
  tabsDefault?: RedTab
  nav: NavItem[] // barra inferior (solo modo 'cuaderno'); el hilo no tiene barra
  acciones: FichaAccion[] // acciones disponibles sobre una ficha desde esta lente
}

export const LENTES: Record<LenteId, Lente> = {
  paciente: { id: 'paciente', rol: 'diada', modo: 'hilo', voz: 'calida', homeKind: 'persona', homeSeg: '', nav: [], acciones: [] },
  cuidador: { id: 'cuidador', rol: 'diada', modo: 'hilo', voz: 'calida', homeKind: 'persona', homeSeg: '', nav: [], acciones: [] },
  agente: { id: 'agente', rol: 'agente', modo: 'cuaderno', voz: 'tecnica', homeKind: 'gente', homeSeg: 'promotor', nav: [{ key: 'gente', seg: 'promotor' }, { key: 'seguimiento', seg: 'seguimiento' }, { key: 'alarmas', seg: 'alarmas' }, { key: 'agenda', seg: 'agenda' }], acciones: ['contacto', 'turno', 'pedir'] },
  enfermeria: { id: 'enfermeria', rol: 'enfermero', modo: 'cuaderno', voz: 'tecnica', homeKind: 'cola', homeSeg: 'alarmas', nav: [{ key: 'cola', seg: 'alarmas' }, { key: 'gente', seg: 'promotor' }, { key: 'agenda', seg: 'agenda' }], acciones: ['medir', 'turno', 'pedir'] },
  unidad: { id: 'unidad', rol: 'medico', modo: 'cuaderno', voz: 'tecnica', homeKind: 'cola', homeSeg: 'alarmas', tabsDefault: 'bandeja', nav: [{ key: 'cola', seg: 'alarmas' }, { key: 'bandeja', seg: 'red/bandeja' }, { key: 'agenda', seg: 'agenda' }], acciones: ['diagnostico', 'informe', 'turno', 'pedir', 'neuropsico'] },
  neuropsico: { id: 'neuropsico', rol: 'neuropsico', modo: 'cuaderno', voz: 'tecnica', homeKind: 'cola', homeSeg: 'alarmas', nav: [{ key: 'cola', seg: 'alarmas' }, { key: 'gente', seg: 'promotor' }], acciones: ['neuropsico', 'informe'] },
  social: { id: 'social', rol: 'trabajadorSocial', modo: 'cuaderno', voz: 'tecnica', homeKind: 'cola', homeSeg: 'alarmas', nav: [{ key: 'cola', seg: 'alarmas' }, { key: 'gente', seg: 'promotor' }], acciones: ['social', 'informe', 'pedir'] },
  gestor: { id: 'gestor', rol: 'gestor', modo: 'cuaderno', voz: 'tecnica', homeKind: 'tablero', homeSeg: '', tabsDefault: 'tablero', nav: [{ key: 'panel', seg: '' }, { key: 'alarmas', seg: 'alarmas' }, { key: 'metricas', seg: 'metricas' }], acciones: [] },
  comunidad: { id: 'comunidad', rol: 'gestor', modo: 'cuaderno', voz: 'tecnica', homeKind: 'tablero', homeSeg: '', tabsDefault: 'tablero', nav: [{ key: 'panel', seg: '' }, { key: 'gobernanza', seg: '/gobernanza' }], acciones: [] },
}

export const LENTE_IDS = Object.keys(LENTES) as LenteId[]

export function lenteDe(profileId?: string): Lente {
  return LENTES[profileId as LenteId] ?? LENTES.agente
}

/** Construye una ruta desde un segmento de la matriz (relativo a /p/:id, o absoluto). */
export function rutaDe(profileId: string, seg: string): string {
  if (seg.startsWith('/')) return seg
  return seg ? `/p/${profileId}/${seg}` : `/p/${profileId}`
}
