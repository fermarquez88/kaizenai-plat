// ⚠️ PLACEHOLDERS — requieren validación clínica antes de cualquier uso real.
// Todos los pesos/umbrales son configurables. La app SIEMPRE muestra que el
// resultado es una ESTIMACIÓN, no un diagnóstico.

export interface TriageThresholds {
  /** umbral inferior para nivel amarillo (0..1) */
  amarillo: number
  /** umbral inferior para nivel rojo (0..1) */
  rojo: number
}

export const SCORING_CONFIG = {
  isPlaceholder: true,
  triage: { amarillo: 0.33, rojo: 0.66 } as TriageThresholds,
  // Lancet PAF weights (F1), MRCA coefficients (F3), reglas de banderas rojas (F2)
  // se agregan en sus fases respectivas.
} as const
