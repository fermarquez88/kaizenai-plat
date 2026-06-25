// completeness.ts — Progressive-completeness engine over the person-bus (additive, pure).
// Implements MAPA_PERFIL_MODULAR §3: per-module % (RedLat missing-code taxonomy) + the two
// meters — "Tu chequeo" (preconsulta %, persona) and "Riqueza del perfil" (semáforo, clínico).

import { MODULES, type ModuleDef } from './moduleRegistry'

/** RedLat missing-code taxonomy. 88 = "no aplica" (excluded from denominator). */
export type MissingCode = 9 | 88 | 95 | 96 | 97 | 98 | 99

export interface ItemState {
  /** Present value (any non-null = answered). */
  value?: unknown
  /** Explicit missing code; 88 removes the item from the denominator. */
  missingCode?: MissingCode
  /** Force "not applicable" without a code. */
  applicable?: boolean
}

export interface ModuleCompleteness {
  applicable: number
  answered: number
  pct: number // 0..1
  complete: boolean
}

const isAnswered = (i: ItemState): boolean =>
  i.value != null || (i.missingCode != null && i.missingCode !== 88)

const isApplicable = (i: ItemState): boolean => i.applicable !== false && i.missingCode !== 88

/** Per-module completeness. A module is complete when every applicable item has a value or an
 * explicit missing-code. An empty/all-N/A module counts as complete (nothing pending). */
export function computeModuleCompleteness(items: ItemState[]): ModuleCompleteness {
  const applicableItems = items.filter(isApplicable)
  const answered = applicableItems.filter(isAnswered).length
  const applicable = applicableItems.length
  const pct = applicable === 0 ? 1 : answered / applicable
  return { applicable, answered, pct, complete: answered === applicable }
}

/** Map of moduleId → its current item states (only the modules the profile has touched). */
export type ProfileItems = Record<string, ItemState[]>

function moduleIsComplete(mod: ModuleDef, items?: ItemState[]): boolean {
  if (!items) return false
  return computeModuleCompleteness(items).complete
}

/**
 * "Tu chequeo" — global preconsulta % shown to the person.
 * = min(100, Σ weightObligatorio[complete] + Σ weightDeseable[complete]).
 * M4 (NPS) and M15 (dx) never count here (capa clínica, weight 0).
 */
export function computePreconsultaPercent(profile: ProfileItems): number {
  let earned = 0
  for (const mod of MODULES) {
    const complete = moduleIsComplete(mod, profile[mod.id])
    if (!complete) continue
    earned += mod.weight
  }
  return Math.min(100, earned)
}

export type Semaforo = 'verde' | 'amarillo' | 'gris'

export interface RichnessCell {
  moduleId: string
  nombre: string
  dominio: string
  semaforo: Semaforo // verde=completo · amarillo=parcial · gris=vacío
  pct: number
}

/** "Riqueza del perfil" — per-module semáforo for the clinical view. */
export function computeProfileRichness(profile: ProfileItems): RichnessCell[] {
  return MODULES.map((mod) => {
    const items = profile[mod.id]
    const c = items ? computeModuleCompleteness(items) : { applicable: 0, answered: 0, pct: 0, complete: false }
    const semaforo: Semaforo = c.complete && c.applicable > 0 ? 'verde' : c.answered > 0 ? 'amarillo' : 'gris'
    return { moduleId: mod.id, nombre: mod.nombre, dominio: mod.dominio, semaforo, pct: c.pct }
  })
}
