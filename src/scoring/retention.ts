// Retención / seguimiento: clasifica a las personas por tiempo desde el último
// contacto, para no perderlas (el abandono es temprano y silencioso —
// Pratap, npj Digital Medicine 2020). Umbrales orientativos, configurables.

export type SeguimientoEstado = 'aldia' | 'porvencer' | 'novolvio'

export const DIAS_POR_VENCER = 30
export const DIAS_NO_VOLVIO = 60

export function estadoSeguimiento(dias: number): SeguimientoEstado {
  if (dias > DIAS_NO_VOLVIO) return 'novolvio'
  if (dias > DIAS_POR_VENCER) return 'porvencer'
  return 'aldia'
}

export const ESTADO_ORDEN: Record<SeguimientoEstado, number> = {
  novolvio: 0,
  porvencer: 1,
  aldia: 2,
}
