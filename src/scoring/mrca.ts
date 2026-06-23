// MRCA — instrumento breve de 7 ítems autorreportados (memoria + cambio cognitivo).
// ⚠️ PLACEHOLDER: scoring simple (suma) con umbrales orientativos. El modelo real
// (kaizen-mrca congelado) se porta a TS en una fase posterior. Su valor es el
// DESCARTE EQUITATIVO y la usabilidad por el agente, no superar edad+educación.
// Discriminación de referencia: AUC ~0,80 (desarrollo) → ~0,63 (validación).

export const MRCA_ITEMS = [
  'recent', // olvida conversaciones/eventos recientes
  'repeat', // repite preguntas/comentarios
  'words', // dificultad para encontrar palabras
  'orientation', // se desorienta en lugares conocidos
  'help', // necesita más ayuda en tareas (cuentas, medicación)
  'slow', // piensa/reacciona más lento
  'informant', // otros notaron un cambio en su memoria
] as const

export type MrcaItemId = (typeof MRCA_ITEMS)[number]
export type MrcaBand = 'bajo' | 'intermedio' | 'alto'

export interface MrcaResult {
  score: number // 0..7
  band: MrcaBand
}

// Umbrales placeholder (configurables / a validar).
export const MRCA_THRESHOLDS = { intermedio: 2, alto: 5 }

export function computeMrca(answers: Record<string, 0 | 1>): MrcaResult {
  const score = MRCA_ITEMS.reduce((sum, id) => sum + (answers[id] === 1 ? 1 : 0), 0)
  const band: MrcaBand =
    score >= MRCA_THRESHOLDS.alto ? 'alto' : score >= MRCA_THRESHOLDS.intermedio ? 'intermedio' : 'bajo'
  return { score, band }
}
