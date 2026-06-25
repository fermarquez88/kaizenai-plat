// IPAQ versión CORTA — actividad física última semana. Scoring del protocolo oficial
// (Guidelines for Data Processing and Analysis of the IPAQ, 2005):
//   MET-min/sem = MET · minutos/día · días.  Caminar 3,3 · moderada 4,0 · vigorosa 8,0 MET.
//   Bouts truncados a 180 min/día. Categorías: baja / moderada / alta.
// ⚠️ Scoring orientativo a confirmar contra el protocolo IPAQ; no diagnóstico.

const WALK_MET = 3.3
const MOD_MET = 4.0
const VIG_MET = 8.0
const CAP = 180 // minutos/día máximos por bout (regla de truncamiento IPAQ)

export interface IpaqAnswers {
  vigDays?: number
  vigMin?: number
  modDays?: number
  modMin?: number
  walkDays?: number
  walkMin?: number
  sitMin?: number // sedentarismo (informativo, no entra al MET total)
}

export type IpaqCategoria = 'baja' | 'moderada' | 'alta'

export interface IpaqResult {
  metMin: number
  walkMet: number
  modMet: number
  vigMet: number
  categoria: IpaqCategoria
  answered: boolean
}

const cap = (m?: number) => Math.min(Math.max(m ?? 0, 0), CAP)
const days = (d?: number) => Math.min(Math.max(d ?? 0, 0), 7)

export function scoreIpaq(a: IpaqAnswers): IpaqResult {
  const vd = days(a.vigDays)
  const md = days(a.modDays)
  const wd = days(a.walkDays)
  const vm = cap(a.vigMin)
  const mm = cap(a.modMin)
  const wm = cap(a.walkMin)
  const vigMet = VIG_MET * vm * vd
  const modMet = MOD_MET * mm * md
  const walkMet = WALK_MET * wm * wd
  const metMin = vigMet + modMet + walkMet
  const combinedDays = vd + md + wd

  // ALTA: (a) vigorosa ≥3 días y ≥1500 MET-min/sem; o (b) ≥7 días cualquier combinación y ≥3000.
  const alta = (vd >= 3 && metMin >= 1500) || (combinedDays >= 7 && metMin >= 3000)
  // MODERADA: (a) vigorosa ≥3 días ≥20 min; (b) moderada/caminar ≥5 días ≥30 min;
  //           (c) ≥5 días cualquier combinación con ≥600 MET-min/sem.
  const moderada =
    (vd >= 3 && vm >= 20) || (md + wd >= 5 && (mm >= 30 || wm >= 30)) || (combinedDays >= 5 && metMin >= 600)
  const categoria: IpaqCategoria = alta ? 'alta' : moderada ? 'moderada' : 'baja'

  const answered =
    [a.vigDays, a.vigMin, a.modDays, a.modMin, a.walkDays, a.walkMin].some((v) => v != null)

  return {
    metMin: Math.round(metMin),
    walkMet: Math.round(walkMet),
    modMet: Math.round(modMet),
    vigMet: Math.round(vigMet),
    categoria,
    answered,
  }
}
