// Retención / seguimiento: clasifica a las personas por tiempo desde el último
// contacto, para no perderlas (el abandono es temprano y silencioso —
// Pratap, npj Digital Medicine 2020). Umbrales orientativos, configurables.

export type SeguimientoEstado = 'aldia' | 'porvencer' | 'novolvio'

export const DIAS_POR_VENCER = 30
export const DIAS_NO_VOLVIO = 60

// Ventana configurable: `noVolvio` = días sin contacto para considerar que NO volvió;
// `porVencer` = umbral de "conviene re-contactar pronto" (por defecto, la mitad).
export function estadoSeguimiento(
  dias: number,
  noVolvio: number = DIAS_NO_VOLVIO,
  porVencer: number = Math.round(noVolvio / 2),
): SeguimientoEstado {
  if (dias > noVolvio) return 'novolvio'
  if (dias > porVencer) return 'porvencer'
  return 'aldia'
}

/** Opciones de ventana "no volvió" para el panel (días). */
export const VENTANAS_NO_VOLVIO = [30, 60, 90] as const

export const ESTADO_ORDEN: Record<SeguimientoEstado, number> = {
  novolvio: 0,
  porvencer: 1,
  aldia: 2,
}
