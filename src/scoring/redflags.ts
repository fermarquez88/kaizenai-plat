// Banderas rojas: si alguna está presente, sugieren derivación prioritaria / urgente.
// Las etiquetas viven en i18n: pre.banderas.items.<id>.

export const RED_FLAGS = [
  'rapid', // deterioro rápido (semanas)
  'focal', // síntomas neurológicos focales
  'delirium', // confusión aguda reciente
  'falls', // caídas o inestabilidad nuevas
  'earlyOnset', // inicio muy temprano / atípico
  'behavior', // cambios de conducta marcados o riesgo
] as const

export type RedFlagId = (typeof RED_FLAGS)[number]

export const hasUrgentRedFlags = (present: string[]): boolean => present.length > 0
