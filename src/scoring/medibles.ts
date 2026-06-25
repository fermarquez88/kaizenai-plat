// Principio de datos "nunca asumir verdades": cada medible (presión, HbA1c, LDL, IMC,
// audición, visión…) es una SERIE LONGITUDINAL append-only con PROCEDENCIA obligatoria.
// "Nunca medido" NO es ausencia (null): es un estado accionable (gris) que origina un
// Pedido de Medición. El mapa de confiabilidad (verde/amarillo/gris), agregado, es un
// MAPA DE INEQUIDAD — los huecos grises se concentran en los más vulnerables.
// Puro y testeable. ⚠️ Catálogo y umbral de recencia orientativos, a validar localmente.

export type Procedencia = 'medido' | 'reportado' | 'desconocido'
export type Confiabilidad = 'verde' | 'amarillo' | 'gris'

// Roles que pueden originar un dato o ser dueños de un loop (dueño-de-alarma).
export type Rol = 'diada' | 'agente' | 'enfermero' | 'medico' | 'neuropsico' | 'gestor'

// Medibles que el perfil de salud cerebral espera (Lancet/ICOPE + metabólico modificable).
export type MedibleTipo = 'presionArterial' | 'hba1c' | 'ldl' | 'imc' | 'audicion' | 'vision'

export interface PuntoMedible {
  valor: number
  fecha: number // timestamp
  autorRol: Rol
  procedencia: Procedencia
  /** confiabilidad del informante para ESTE dato (p. ej. baja en demencia). */
  confiable?: boolean
}

export interface Medible {
  tipo: MedibleTipo
  unidad: string
  /** APPEND-ONLY: nunca se pisa; el valor "actual" es el punto más reciente. */
  puntos: PuntoMedible[]
}

export const DIA_MS = 86_400_000
// Un dato MEDIDO cuenta como verde mientras sea más reciente que esta ventana.
export const RECIENTE_DIAS = 365

export const CATALOGO_MEDIBLES: { tipo: MedibleTipo; unidad: string }[] = [
  { tipo: 'presionArterial', unidad: 'mmHg' },
  { tipo: 'hba1c', unidad: '%' },
  { tipo: 'ldl', unidad: 'mg/dL' },
  { tipo: 'imc', unidad: 'kg/m²' },
  { tipo: 'audicion', unidad: 'dB' },
  { tipo: 'vision', unidad: 'logMAR' },
]

/** Perfil de medibles vacío (todos en gris = nunca medido = pedidos potenciales). */
export function perfilVacio(): Medible[] {
  return CATALOGO_MEDIBLES.map((c) => ({ tipo: c.tipo, unidad: c.unidad, puntos: [] }))
}

/** Punto más reciente de la serie (o undefined si nunca se midió). */
export function ultimoPunto(m: Medible): PuntoMedible | undefined {
  return m.puntos.reduce<PuntoMedible | undefined>(
    (acc, p) => (acc == null || p.fecha > acc.fecha ? p : acc),
    undefined,
  )
}

/** Agrega un punto SIN pisar la serie (devuelve un nuevo Medible). */
export function agregarPunto(m: Medible, p: PuntoMedible): Medible {
  return { ...m, puntos: [...m.puntos, p] }
}

/** verde = medido reciente · amarillo = reportado o medido viejo · gris = nunca/desconocido. */
export function confiabilidad(m: Medible, now: number): Confiabilidad {
  const u = ultimoPunto(m)
  if (!u || u.procedencia === 'desconocido') return 'gris'
  if (u.procedencia === 'reportado') return 'amarillo'
  const dias = Math.max(0, Math.floor((now - u.fecha) / DIA_MS))
  return dias <= RECIENTE_DIAS ? 'verde' : 'amarillo'
}

export interface MapaConfiabilidad {
  verde: number
  amarillo: number
  gris: number
  total: number
  /** 0..1 — proporción de huecos grises = señal operacionable de inequidad. */
  brechaGris: number
}

export function mapaConfiabilidad(medibles: Medible[], now: number): MapaConfiabilidad {
  let verde = 0
  let amarillo = 0
  let gris = 0
  for (const m of medibles) {
    const c = confiabilidad(m, now)
    if (c === 'verde') verde += 1
    else if (c === 'amarillo') amarillo += 1
    else gris += 1
  }
  const total = medibles.length
  return { verde, amarillo, gris, total, brechaGris: total ? Math.round((gris / total) * 100) / 100 : 0 }
}
