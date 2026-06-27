// MATRIZ DECLARATIVA DE LENTES — la clave técnica de la IA: cada actor es una VISTA sobre
// la misma ficha-persona y la misma cola de alarmas. Toda pantalla deriva de esta tabla:
// home, navegación inferior, cola filtrada (rol), tabs por defecto y acciones permitidas
// sobre una ficha. Agregar una lente = UNA fila, no código nuevo.
import type { Rol } from '../scoring/alarmas'

export type LenteId =
  | 'paciente' | 'cuidador' | 'agente' | 'enfermeria' | 'unidad' | 'neuropsico' | 'social' | 'gestor' | 'comunidad'

export type FichaAccion = 'pedir' | 'neuropsico' | 'informe' | 'medir' | 'contacto'
export type HomeKind = 'persona' | 'gente' | 'cola' | 'tablero'
export type RedTab = 'gente' | 'cola' | 'bandeja' | 'tablero'

export interface NavItem {
  key: string
  /** segmento relativo a /p/:id ('' = home de la lente); con '/' inicial = ruta absoluta. */
  seg: string
}

export interface Lente {
  id: LenteId
  rol: Rol
  homeKind: HomeKind
  /** segmento del home relativo a /p/:id ('' = RoleHome). */
  homeSeg: string
  tabsDefault?: RedTab
  nav: NavItem[] // barra inferior, ≤4
  acciones: FichaAccion[] // acciones disponibles sobre una ficha desde esta lente
}

export const LENTES: Record<LenteId, Lente> = {
  paciente: { id: 'paciente', rol: 'diada', homeKind: 'persona', homeSeg: '', nav: [{ key: 'espacio', seg: '' }, { key: 'chequeo', seg: 'preconsulta' }, { key: 'pedidos', seg: 'alarmas' }], acciones: [] },
  cuidador: { id: 'cuidador', rol: 'diada', homeKind: 'persona', homeSeg: '', nav: [{ key: 'espacio', seg: '' }, { key: 'chequeo', seg: 'preconsulta' }, { key: 'pedidos', seg: 'alarmas' }], acciones: [] },
  agente: { id: 'agente', rol: 'agente', homeKind: 'gente', homeSeg: 'promotor', nav: [{ key: 'gente', seg: 'promotor' }, { key: 'seguimiento', seg: 'seguimiento' }, { key: 'alarmas', seg: 'alarmas' }, { key: 'agenda', seg: 'agenda' }], acciones: ['contacto', 'pedir'] },
  enfermeria: { id: 'enfermeria', rol: 'enfermero', homeKind: 'cola', homeSeg: 'alarmas', nav: [{ key: 'cola', seg: 'alarmas' }, { key: 'gente', seg: 'promotor' }, { key: 'agenda', seg: 'agenda' }], acciones: ['medir', 'pedir'] },
  unidad: { id: 'unidad', rol: 'medico', homeKind: 'cola', homeSeg: 'alarmas', tabsDefault: 'bandeja', nav: [{ key: 'cola', seg: 'alarmas' }, { key: 'bandeja', seg: 'red/bandeja' }, { key: 'agenda', seg: 'agenda' }], acciones: ['informe', 'pedir', 'neuropsico'] },
  neuropsico: { id: 'neuropsico', rol: 'neuropsico', homeKind: 'cola', homeSeg: 'alarmas', nav: [{ key: 'cola', seg: 'alarmas' }, { key: 'gente', seg: 'promotor' }], acciones: ['neuropsico', 'informe'] },
  social: { id: 'social', rol: 'trabajadorSocial', homeKind: 'cola', homeSeg: 'alarmas', nav: [{ key: 'cola', seg: 'alarmas' }, { key: 'gente', seg: 'promotor' }], acciones: ['informe', 'pedir'] },
  gestor: { id: 'gestor', rol: 'gestor', homeKind: 'tablero', homeSeg: '', tabsDefault: 'tablero', nav: [{ key: 'panel', seg: '' }, { key: 'alarmas', seg: 'alarmas' }, { key: 'metricas', seg: 'metricas' }], acciones: [] },
  comunidad: { id: 'comunidad', rol: 'gestor', homeKind: 'tablero', homeSeg: '', tabsDefault: 'tablero', nav: [{ key: 'panel', seg: '' }, { key: 'gobernanza', seg: '/gobernanza' }], acciones: [] },
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
