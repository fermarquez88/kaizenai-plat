// Batería neuropsicológica curada: etiquetas legibles → (testId, subtest) REALES del pack
// de normas (cognitiveNorms). Cada entrada se verifica en bateriaNps.test.ts contra el motor.
import { scoreSubtest, type Demographics, type ScoreOutcome } from './cognitiveNorms'

export type DominioNps = 'Memoria verbal' | 'Memoria visual' | 'Atención y memoria de trabajo' | 'Funciones ejecutivas' | 'Lenguaje' | 'Visuoespacial' | 'Cognición social' | 'Velocidad'

export interface TestNps {
  id: string
  label: string
  testId: string
  subtest: string
  dominio: DominioNps
  /** pista de qué cargar (rango/unidad) para el evaluador. */
  ayuda?: string
}

// Catálogo seleccionable de subtests → (testId, subtest) EXACTOS del pack de normas El Castaño.
// La neuropsicóloga elige qué administra; el motor (cognitiveNorms) puntúa los cargados y declara
// "sin norma" si el perfil no tiene baremo (nunca inventa). Verificado en bateriaNps.test.ts.
export const BATERIA_NPS: TestNps[] = [
  // Memoria verbal
  { id: 'ravlt_inm', label: 'RAVLT — Recuerdo inmediato (total)', testId: 'RAVLT', subtest: 'Recuerdo inmediato (total)', dominio: 'Memoria verbal', ayuda: 'suma de 5 ensayos' },
  { id: 'ravlt_dif', label: 'RAVLT — Recuerdo diferido', testId: 'RAVLT', subtest: 'Recuerdo diferido', dominio: 'Memoria verbal', ayuda: '0–15' },
  { id: 'ravlt_rec', label: 'RAVLT — Reconocimiento corregido', testId: 'RAVLT', subtest: 'Reconocimiento corregido', dominio: 'Memoria verbal' },
  { id: 'relatos_inm', label: 'Memoria de relatos — inmediato', testId: 'MemoriaDeRelatos', subtest: 'Inmediato', dominio: 'Memoria verbal' },
  { id: 'relatos_dif', label: 'Memoria de relatos — diferido', testId: 'MemoriaDeRelatos', subtest: 'Diferido', dominio: 'Memoria verbal' },
  // Memoria visual
  { id: 'rocf_inm', label: 'Figura de Rey (ROCF) — inmediato', testId: 'ROCF', subtest: 'Inmediato (recuerdo)', dominio: 'Memoria visual' },
  { id: 'rocf_dif', label: 'Figura de Rey (ROCF) — diferido', testId: 'ROCF', subtest: 'Diferido (recuerdo)', dominio: 'Memoria visual' },
  { id: 'rocf_rec', label: 'Figura de Rey (ROCF) — reconocimiento', testId: 'ROCF', subtest: 'Reconocimiento', dominio: 'Memoria visual' },
  // Visuoespacial
  { id: 'rocf_copia', label: 'Figura de Rey (ROCF) — copia', testId: 'ROCF', subtest: 'Copia', dominio: 'Visuoespacial' },
  // Atención y memoria de trabajo
  { id: 'dig_dir', label: 'Dígitos directo', testId: 'Digitos', subtest: 'Directo (adelante)', dominio: 'Atención y memoria de trabajo' },
  { id: 'dig_inv', label: 'Dígitos inverso', testId: 'Digitos', subtest: 'Inverso (atras)', dominio: 'Atención y memoria de trabajo' },
  // Velocidad / atención
  { id: 'tmt_a', label: 'TMT-A (segundos)', testId: 'TMT', subtest: 'A', dominio: 'Velocidad', ayuda: 'tiempo en segundos' },
  { id: 'sdmt', label: 'SDMT — atención/velocidad', testId: 'SDMT', subtest: '_', dominio: 'Velocidad' },
  // Funciones ejecutivas
  { id: 'tmt_b', label: 'TMT-B (segundos)', testId: 'TMT', subtest: 'B', dominio: 'Funciones ejecutivas', ayuda: 'tiempo en segundos' },
  { id: 'flu_fon', label: 'Fluencia fonológica (letra)', testId: 'FluenciaFonologica', subtest: '_', dominio: 'Funciones ejecutivas' },
  { id: 'ifs', label: 'IFS — función ejecutiva', testId: 'IFS', subtest: '_', dominio: 'Funciones ejecutivas' },
  // Lenguaje
  { id: 'flu_sem', label: 'Fluencia semántica (animales)', testId: 'FluenciaSemantica', subtest: '_', dominio: 'Lenguaje' },
]

// Solo dominios con subtests normados en el pack El Castaño (no se ofrecen pruebas sin baremo).
export const DOMINIOS_NPS: DominioNps[] = ['Memoria verbal', 'Memoria visual', 'Visuoespacial', 'Atención y memoria de trabajo', 'Velocidad', 'Funciones ejecutivas', 'Lenguaje']

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
