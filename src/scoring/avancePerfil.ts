// "Avance del perfil de salud cerebral" — reemplaza la idea fría de "completitud" por un
// modelo de avance con NIVELES CÁLIDOS (Empezamos → Vamos bien → Perfil completo) y una
// PRÓXIMA-MEJOR-ACCIÓN única, alineado a la evidencia de orquestación de perfiles
// (LinkedIn: niveles nombrados > % suelto; Apple Health: acción+objeto+beneficio;
// endowed progress: nunca arrancar en 0). El % exacto queda para el equipo de salud.
// Puro y testeable. Reusa computeDomainCompleteness.
import { computeDomainCompleteness, type DomainInputs, type DomainResult } from './domainCompleteness'
import { LANCET_FACTORS } from './lancet'

export type NivelAvance = 'empezamos' | 'vamosBien' | 'completo'

// "Lo necesario para la consulta" = demografía (edad/sexo/educación) + Lancet 14.
// Eso cubre el modelo MRCA-7 reducido (edad·sexo·edu·hipoacusia·tabaco·vive_solo, las 3
// últimas son ítems Lancet). NO incluye CQC/GDS/T-ADLQ (esos son del modelo VIEJO de 20+
// y van como DESEABLES, ofrecidos al final en orden de relevancia).
const NEC_DEMO = ['edad', 'sexo', 'edu_anios'] as const
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

  const pct = total ? answered / total : 0
  return {
    necesario: { answered, total, pct },
    completo: full.total,
    dominios: full.domains,
    nivel: nivelDeAvance(pct),
    proxima,
  }
}
