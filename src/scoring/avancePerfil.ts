// "Avance del perfil de salud cerebral" — reemplaza la idea fría de "completitud" por un
// modelo de avance con NIVELES CÁLIDOS (Empezamos → Vamos bien → Perfil completo) y una
// PRÓXIMA-MEJOR-ACCIÓN única, alineado a la evidencia de orquestación de perfiles
// (LinkedIn: niveles nombrados > % suelto; Apple Health: acción+objeto+beneficio;
// endowed progress: nunca arrancar en 0). El % exacto queda para el equipo de salud.
// Puro y testeable. Reusa computeDomainCompleteness.
import { computeDomainCompleteness, type DomainInputs, type DomainResult } from './domainCompleteness'
import { LANCET_FACTORS } from './lancet'

export type NivelAvance = 'empezamos' | 'vamosBien' | 'completo'

// "Lo necesario para la consulta" = demografía + Lancet 14 + 3 instrumentos núcleo.
const NEC_DEMO = ['edad', 'sexo', 'edu_anios'] as const
const NEC_INSTR = ['cqc', 'gds', 'tadlq'] as const
// Orden de la próxima-mejor-acción: primero lo que da el "magic moment" (riesgo).
export const UMBRAL_VAMOS_BIEN = 0.34

export interface AvancePerfil {
  necesario: { answered: number; total: number; pct: number }
  completo: { answered: number; total: number; pct: number }
  dominios: DomainResult[]
  nivel: NivelAvance
  /** próxima MEJOR acción (código i18n: 'demografia'|'lancet'|'cqc'|'gds'|'tadlq'), o null si lo necesario está listo. */
  proxima: string | null
}

export function nivelDeAvance(necesarioPct: number): NivelAvance {
  if (necesarioPct >= 1) return 'completo'
  if (necesarioPct >= UMBRAL_VAMOS_BIEN) return 'vamosBien'
  return 'empezamos'
}

const instStarted = (inp: DomainInputs, id: string): boolean =>
  Object.values(inp.instruments[id] ?? {}).some((v) => v != null)

export function avancePerfil(inp: DomainInputs): AvancePerfil {
  const full = computeDomainCompleteness(inp)
  let answered = 0
  let total = 0
  let proxima: string | null = null
  const consider = (done: boolean, key: string) => {
    total += 1
    if (done) answered += 1
    else if (!proxima) proxima = key
  }
  for (const f of NEC_DEMO) consider(inp.demo[f] != null, 'demografia')
  // Lancet cuenta como bloque de 14 (la próxima acción es "lancet" si falta alguno).
  const lancetDone = LANCET_FACTORS.filter((f) => inp.lancet[f.id] != null).length
  total += LANCET_FACTORS.length
  answered += lancetDone
  if (lancetDone < LANCET_FACTORS.length && !proxima) proxima = 'lancet'
  for (const id of NEC_INSTR) consider(instStarted(inp, id), id)

  const pct = total ? answered / total : 0
  return {
    necesario: { answered, total, pct },
    completo: full.total,
    dominios: full.domains,
    nivel: nivelDeAvance(pct),
    proxima,
  }
}
