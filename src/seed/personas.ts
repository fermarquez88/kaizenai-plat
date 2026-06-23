// Personas de ejemplo para la demo (sin datos reales). Cubren los tres niveles de
// triage y perfiles variados. Valores precomputados, ilustrativos.
import type { TriageLevel } from '../scoring/triage'
import type { MrcaModelBand } from '../scoring/mrcaModel'

export interface SeedPersona {
  id: string
  alias: string
  age: number
  edu: number
  level: TriageLevel
  riskPct: number
  mrca: number
  mrcaBand: MrcaModelBand
  meds: number
  redFlags: number
  note: string
}

export const SEED_PERSONAS: SeedPersona[] = [
  {
    id: 'p1',
    alias: 'M. R.',
    age: 72,
    edu: 4,
    level: 'rojo',
    riskPct: 31,
    mrca: 6,
    mrcaBand: 'alto',
    meds: 7,
    redFlags: 1,
    note: 'Baja escolaridad, quejas de memoria y polifarmacia.',
  },
  {
    id: 'p2',
    alias: 'C. P.',
    age: 75,
    edu: 3,
    level: 'rojo',
    riskPct: 27,
    mrca: 5,
    mrcaBand: 'alto',
    meds: 4,
    redFlags: 1,
    note: 'Periférica, con señal de alarma (deterioro rápido).',
  },
  {
    id: 'p3',
    alias: 'J. L.',
    age: 68,
    edu: 7,
    level: 'amarillo',
    riskPct: 22,
    mrca: 3,
    mrcaBand: 'moderado',
    meds: 5,
    redFlags: 0,
    note: 'Varios factores modificables presentes.',
  },
  {
    id: 'p4',
    alias: 'R. G.',
    age: 64,
    edu: 9,
    level: 'amarillo',
    riskPct: 18,
    mrca: 2,
    mrcaBand: 'moderado',
    meds: 6,
    redFlags: 0,
    note: 'Polifarmacia con carga anticolinérgica.',
  },
  {
    id: 'p5',
    alias: 'A. S.',
    age: 60,
    edu: 12,
    level: 'verde',
    riskPct: 8,
    mrca: 1,
    mrcaBand: 'bajo',
    meds: 1,
    redFlags: 0,
    note: 'Riesgo bajo: prevención y seguimiento comunitario.',
  },
  {
    id: 'p6',
    alias: 'E. M.',
    age: 58,
    edu: 11,
    level: 'verde',
    riskPct: 11,
    mrca: 0,
    mrcaBand: 'bajo',
    meds: 2,
    redFlags: 0,
    note: 'Control de factores; seguimiento en la comunidad.',
  },
]

export const PRIORITY: Record<TriageLevel, number> = { rojo: 0, amarillo: 1, verde: 2 }
