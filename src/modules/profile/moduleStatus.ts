// Estado vivo de cada módulo (M1–M15) calculado desde el store de preconsulta. Convierte el
// mapa estructural (moduleRegistry) en una ESTRUCTURA MODULAR usable: qué módulo está hecho,
// empezado o pendiente, para el chooser "elegir qué completar" y el avance del perfil.
// Puro y testeable. Reusa INSTRUMENTS y LANCET_FACTORS.
import { INSTRUMENTS } from '../../scoring/instruments'
import { LANCET_FACTORS } from '../../scoring/lancet'
import type { DomainInputs } from '../../scoring/domainCompleteness'
import { MODULES, type ModuleDef } from './moduleRegistry'

export type ModuloEstado = 'hecho' | 'empezado' | 'pendiente' | 'otraCapa'

// El estado de los módulos se calcula desde el store ampliado (incluye SDOH/CUD).
export type ModuleInputs = DomainInputs & {
  sdoh?: Record<string, string>
  cud?: Record<string, string>
}

interface Cuenta {
  answered: number
  total: number
}

const instCount = (inp: DomainInputs, ids: string[]): Cuenta => {
  let answered = 0
  let total = 0
  for (const id of ids) {
    total += INSTRUMENTS[id]?.items.length ?? 0
    answered += Object.values(inp.instruments[id] ?? {}).filter((v) => v != null).length
  }
  return { answered, total }
}
const demoCount = (inp: DomainInputs, fields: ('edad' | 'sexo' | 'edu_anios')[]): Cuenta => ({
  answered: fields.filter((f) => inp.demo[f] != null).length,
  total: fields.length,
})
const lancetCount = (inp: DomainInputs): Cuenta => ({
  answered: LANCET_FACTORS.filter((f) => inp.lancet[f.id] != null).length,
  total: LANCET_FACTORS.length,
})

// SDOH (NBI mínimo) + CUD de la persona → completitud del M12 "Tu casa y tu entorno".
const SDOH_KEYS = ['agua', 'bano', 'piso', 'viveSolo', 'ingreso', 'comida']
const sdohCount = (i: ModuleInputs): Cuenta => {
  const sd = i.sdoh ?? {}
  const cu = i.cud ?? {}
  const answered = SDOH_KEYS.filter((k) => sd[k] != null).length + (cu.persona != null ? 1 : 0)
  return { answered, total: SDOH_KEYS.length + 1 }
}

// Cómo se mide la completitud de cada módulo desde el store. Los módulos sin fuente
// (capa clínica o forms aún no construidos) quedan en total 0 → 'pendiente'/'otraCapa'.
const SOURCE: Record<string, (inp: ModuleInputs) => Cuenta> = {
  M1: (i) => demoCount(i, ['edad', 'sexo', 'edu_anios']),
  M3: (i) => instCount(i, ['cqc']),
  'M3-inf': (i) => instCount(i, ['ad8', 'iqcode']),
  M5: (i) => instCount(i, ['gds']),
  'M5-extra': (i) => instCount(i, ['gad', 'ucla']),
  M6: (i) => instCount(i, ['tadlq']),
  'M6-inf': (i) => instCount(i, ['faq']),
  M8: (i) => instCount(i, ['frail']),
  M9: (i) => lancetCount(i),
  M10: (i) => instCount(i, ['mind', 'auditc', 'mnasf']),
  M11: (i) => instCount(i, ['isi']),
  M12: (i) => sdohCount(i),
  M14: (i) => instCount(i, ['zarit']),
}

function estadoDe(m: ModuleDef, c: Cuenta): ModuloEstado {
  if (c.total === 0) return m.tier === 'posterior' || m.tier === 'aparte' ? 'otraCapa' : 'pendiente'
  if (c.answered === 0) return 'pendiente'
  return c.answered >= c.total ? 'hecho' : 'empezado'
}

export interface ModuloStatus {
  id: string
  estado: ModuloEstado
  answered: number
  total: number
}

export function computeModuleStatus(inp: ModuleInputs): Record<string, ModuloStatus> {
  const out: Record<string, ModuloStatus> = {}
  for (const m of MODULES) {
    const c = SOURCE[m.id] ? SOURCE[m.id](inp) : { answered: 0, total: 0 }
    out[m.id] = { id: m.id, estado: estadoDe(m, c), answered: c.answered, total: c.total }
  }
  return out
}

/** Resumen del núcleo obligatorio: módulos obligatorios hechos / total. */
export function resumenObligatorios(status: Record<string, ModuloStatus>): { hechos: number; total: number } {
  const oblig = MODULES.filter((m) => m.tier === 'obligatorio')
  return { hechos: oblig.filter((m) => status[m.id]?.estado === 'hecho').length, total: oblig.length }
}
