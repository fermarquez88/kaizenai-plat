// CLASIFICACIÓN BASE de los módulos/escalas de salud cerebral, ordenados de MÁS a MENOS
// deseable. Es el cimiento que gobierna: (a) qué se ofrece primero al "elegir qué completar";
// (b) el orden de la próxima-mejor-acción y de "otros temas"; (c) las opciones del panel de
// pedidos. El perfil CRECE sumando estos módulos. ⚠️ Tiers/prioridades orientativos
// (Lancet 2024 + OMS ICOPE + auditoría del panel), a validar/ajustar con Fernando.
import type { Rol } from './medibles'

export type Tier = 'obligatorio' | 'deseable-alto' | 'deseable-medio' | 'deseable-bajo'
export type Via = 'autorreporte' | 'informante' | 'medido' | 'test'
// Dominios de salud cerebral (OMS) + ejes nuevos (social/discapacidad/metabólico/cuidador).
export type DominioCat =
  | 'identidad' | 'cognitivo' | 'animo' | 'funcional' | 'sueno' | 'habitos' | 'fisica'
  | 'social' | 'discapacidad' | 'metabolico' | 'cuidador'

export interface ModuloCatalogo {
  id: string
  dominio: DominioCat
  tier: Tier
  /** 0..100; mayor = más deseable/prioritario (ordena de más a menos deseable). */
  prioridad: number
  /** quién puede completarlo (dueño-de-loop posible). */
  responsables: Rol[]
  via: Via
}

// El orden del array es indicativo; `prioridad` es la fuente de verdad del ranking.
export const CATALOGO_MODULOS: ModuloCatalogo[] = [
  // ── OBLIGATORIO: lo necesario para la consulta ──────────────────────────────
  { id: 'banderas', dominio: 'cognitivo', tier: 'obligatorio', prioridad: 100, responsables: ['diada', 'agente'], via: 'autorreporte' },
  { id: 'identidad', dominio: 'identidad', tier: 'obligatorio', prioridad: 99, responsables: ['diada', 'agente'], via: 'autorreporte' },
  { id: 'lancet', dominio: 'fisica', tier: 'obligatorio', prioridad: 98, responsables: ['diada', 'agente'], via: 'autorreporte' },
  { id: 'cqc', dominio: 'cognitivo', tier: 'obligatorio', prioridad: 96, responsables: ['diada'], via: 'autorreporte' },
  { id: 'gds', dominio: 'animo', tier: 'obligatorio', prioridad: 95, responsables: ['diada'], via: 'autorreporte' },
  { id: 'tadlq', dominio: 'funcional', tier: 'obligatorio', prioridad: 94, responsables: ['diada'], via: 'autorreporte' },
  { id: 'sdoh', dominio: 'social', tier: 'obligatorio', prioridad: 92, responsables: ['trabajadorSocial', 'agente', 'diada'], via: 'autorreporte' },
  // ── DESEABLE-ALTO: alto valor, barato, evidencia fuerte ─────────────────────
  { id: 'vitales', dominio: 'metabolico', tier: 'deseable-alto', prioridad: 72, responsables: ['enfermero'], via: 'medido' },
  { id: 'cud', dominio: 'discapacidad', tier: 'deseable-alto', prioridad: 70, responsables: ['trabajadorSocial', 'diada'], via: 'autorreporte' },
  { id: 'soporteSocial', dominio: 'social', tier: 'deseable-alto', prioridad: 68, responsables: ['diada'], via: 'autorreporte' },
  { id: 'isi', dominio: 'sueno', tier: 'deseable-alto', prioridad: 64, responsables: ['diada'], via: 'autorreporte' },
  { id: 'auditc', dominio: 'habitos', tier: 'deseable-alto', prioridad: 62, responsables: ['diada'], via: 'autorreporte' },
  // ── DESEABLE-MEDIO ──────────────────────────────────────────────────────────
  { id: 'ipaq', dominio: 'habitos', tier: 'deseable-medio', prioridad: 46, responsables: ['diada'], via: 'autorreporte' },
  { id: 'mind', dominio: 'habitos', tier: 'deseable-medio', prioridad: 44, responsables: ['diada'], via: 'autorreporte' },
  { id: 'frail', dominio: 'fisica', tier: 'deseable-medio', prioridad: 42, responsables: ['diada', 'enfermero'], via: 'autorreporte' },
  { id: 'mnasf', dominio: 'habitos', tier: 'deseable-medio', prioridad: 40, responsables: ['diada'], via: 'autorreporte' },
  { id: 'crc6', dominio: 'cognitivo', tier: 'deseable-medio', prioridad: 38, responsables: ['diada'], via: 'autorreporte' },
  // ── DESEABLE-BAJO / a pedido ────────────────────────────────────────────────
  { id: 'eva', dominio: 'fisica', tier: 'deseable-bajo', prioridad: 26, responsables: ['diada'], via: 'autorreporte' },
  { id: 'zarit', dominio: 'cuidador', tier: 'deseable-bajo', prioridad: 24, responsables: ['diada'], via: 'informante' },
  { id: 'bateriaNps', dominio: 'cognitivo', tier: 'deseable-bajo', prioridad: 20, responsables: ['neuropsico'], via: 'test' },
]

const TIER_ORDEN: Record<Tier, number> = { obligatorio: 0, 'deseable-alto': 1, 'deseable-medio': 2, 'deseable-bajo': 3 }

/** Catálogo ordenado de MÁS a MENOS deseable. */
export function modulosOrdenados(): ModuloCatalogo[] {
  return [...CATALOGO_MODULOS].sort((a, b) => b.prioridad - a.prioridad)
}

/** Módulos que un rol puede completar, de más a menos deseable. */
export function modulosPorResponsable(rol: Rol): ModuloCatalogo[] {
  return modulosOrdenados().filter((m) => m.responsables.includes(rol))
}

/** Prioridad máxima de un dominio (para ordenar "otros temas" de la puerta). */
export function prioridadDominio(dominio: string): number {
  return CATALOGO_MODULOS.filter((m) => m.dominio === dominio).reduce((max, m) => Math.max(max, m.prioridad), 0)
}

export function esObligatorio(id: string): boolean {
  return CATALOGO_MODULOS.some((m) => m.id === id && m.tier === 'obligatorio')
}
