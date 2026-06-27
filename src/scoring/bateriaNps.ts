// Batería neuropsicológica curada: etiquetas legibles → (testId, subtest) REALES del pack
// de normas (cognitiveNorms). Cada entrada se verifica en bateriaNps.test.ts contra el motor.
import { scoreSubtest, type Demographics, type ScoreOutcome } from './cognitiveNorms'

export interface TestNps {
  id: string
  label: string
  testId: string
  subtest: string
  /** pista de qué cargar (rango/unidad) para el evaluador. */
  ayuda?: string
}

// Subtests confirmados existentes con normas usables (ver dump del pack).
export const BATERIA_NPS: TestNps[] = [
  { id: 'ravlt_inm', label: 'RAVLT — Recuerdo inmediato (total)', testId: 'RAVLT', subtest: 'Recuerdo inmediato (total)', ayuda: 'suma de 5 ensayos' },
  { id: 'ravlt_dif', label: 'RAVLT — Recuerdo diferido', testId: 'RAVLT', subtest: 'Recuerdo diferido', ayuda: '0–15' },
  { id: 'ravlt_rec', label: 'RAVLT — Reconocimiento corregido', testId: 'RAVLT', subtest: 'Reconocimiento corregido' },
  { id: 'dig_dir', label: 'Dígitos directo', testId: 'Digitos', subtest: 'Directo (adelante)' },
  { id: 'dig_inv', label: 'Dígitos inverso', testId: 'Digitos', subtest: 'Inverso (atras)' },
  { id: 'tmt_a', label: 'TMT-A (segundos)', testId: 'TMT', subtest: 'A', ayuda: 'tiempo en segundos' },
  { id: 'tmt_b', label: 'TMT-B (segundos)', testId: 'TMT', subtest: 'B', ayuda: 'tiempo en segundos' },
  { id: 'flu_sem', label: 'Fluencia semántica (animales)', testId: 'FluenciaSemantica', subtest: '_' },
  { id: 'flu_fon', label: 'Fluencia fonológica (letra)', testId: 'FluenciaFonologica', subtest: '_' },
  { id: 'ifs', label: 'IFS — función ejecutiva', testId: 'IFS', subtest: '_' },
  { id: 'relatos_inm', label: 'Memoria de relatos — inmediato', testId: 'MemoriaDeRelatos', subtest: 'Inmediato' },
  { id: 'relatos_dif', label: 'Memoria de relatos — diferido', testId: 'MemoriaDeRelatos', subtest: 'Diferido' },
  { id: 'rocf_copia', label: 'Figura de Rey (ROCF) — copia', testId: 'ROCF', subtest: 'Copia' },
  { id: 'rocf_dif', label: 'Figura de Rey (ROCF) — diferido', testId: 'ROCF', subtest: 'Diferido (recuerdo)' },
  { id: 'sdmt', label: 'SDMT — atención/velocidad', testId: 'SDMT', subtest: '_' },
]

export const BATERIA_BY_ID: Record<string, TestNps> = Object.fromEntries(BATERIA_NPS.map((t) => [t.id, t]))

export interface ResultadoBateria extends TestNps {
  raw: number
  outcome: ScoreOutcome
}

/** Puntúa los tests cargados (los que tienen raw) con el motor de normas. */
export function puntuarBateria(raws: Record<string, number>, demo: Demographics): ResultadoBateria[] {
  return BATERIA_NPS.filter((t) => raws[t.id] != null && !Number.isNaN(raws[t.id])).map((t) => ({
    ...t,
    raw: raws[t.id],
    outcome: scoreSubtest(t.testId, t.subtest, raws[t.id], demo),
  }))
}
