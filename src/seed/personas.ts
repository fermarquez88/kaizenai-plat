// Personas de ejemplo para la demo (sin datos reales). Cubren los tres niveles de
// triage, distintos perfiles, y datos de SEGUIMIENTO (retención) y DÍADA (cuidador).
import type { TriageLevel } from '../scoring/triage'
import type { MrcaModelBand } from '../scoring/mrcaModel'
import type { Cerca, Vive } from '../scoring/equity'
import type { DiscordanciaInfo } from '../scoring/alarmas'
import type { Medible } from '../scoring/medibles'

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
  /** días desde el último contacto (para el panel de "no volvieron") */
  lastSeenDays: number
  /** teléfono de ejemplo para re-contacto por WhatsApp (Nivel 0) */
  phone: string
  /** alias del cuidador/informante (díada), si hay */
  cuidador?: string
  /** discrepancia persona↔informante (señal clínica) */
  discrepancia?: boolean
  // ── Campos del modelo de alarmas (re-arquitectura red) ──────────────────────
  /** vulnerabilidad territorial/social (equidad) */
  vive?: Vive
  cerca?: Cerca
  isolation?: boolean
  /** señal aguda/reversible: ideación suicida, delirium, deterioro brusco, sospecha ACV */
  agudo?: { presente: boolean; motivo?: string }
  /** discordancia díada tipada (dirección + confusores); prevalece sobre `discrepancia` */
  discordancia?: DiscordanciaInfo
  /** medibles del perfil (serie con procedencia); los huecos gris originan pedidos */
  medibles?: Medible[]
}

// Fecha fija para un dato "medido pero viejo" (>1 año → confiabilidad amarilla).
const MEDIDO_VIEJO = Date.UTC(2024, 0, 15)

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
    lastSeenDays: 74,
    phone: '5492644000001',
    cuidador: 'su hija',
    discrepancia: true,
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
    lastSeenDays: 92,
    phone: '5492644000002',
    vive: 'campo',
    cerca: '>60',
    agudo: { presente: true, motivo: 'deterioroRapido' },
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
    lastSeenDays: 38,
    phone: '5492644000003',
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
    lastSeenDays: 12,
    phone: '5492644000004',
    cuidador: 'su esposo',
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
    lastSeenDays: 6,
    phone: '5492644000005',
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
    lastSeenDays: 49,
    phone: '5492644000006',
  },
  {
    id: 'p7',
    alias: 'L. F.',
    age: 78,
    edu: 6,
    level: 'rojo',
    riskPct: 35,
    mrca: 6,
    mrcaBand: 'alto',
    meds: 8,
    redFlags: 2,
    note: 'Cambios de conducta + caídas; discordancia con la familia (ella minimiza). Polifarmacia anticolinérgica.',
    lastSeenDays: 110,
    phone: '5492644000007',
    cuidador: 'su hijo',
    discrepancia: true,
    vive: 'campo',
    cerca: '30-60',
    // La persona minimiza y el hijo (que convive) reporta más deterioro → posible anosognosia.
    discordancia: { presente: true, direccion: 'informantePeor', informanteConvive: true },
    medibles: [
      // Presión medida hace >1 año (amarillo): no genera pedido pero baja confiabilidad.
      { tipo: 'presionArterial', unidad: 'mmHg', puntos: [{ valor: 152, fecha: MEDIDO_VIEJO, autorRol: 'medico', procedencia: 'medido' }] },
      // Nunca medida (gris) → Pedido de Medición al enfermero.
      { tipo: 'hba1c', unidad: '%', puntos: [] },
      // Nunca medida y SIN audiometría en el territorio → BRECHA DE SERVICIO (sube a política).
      { tipo: 'audicion', unidad: 'dB', puntos: [] },
    ],
  },
]

export const PRIORITY: Record<TriageLevel, number> = { rojo: 0, amarillo: 1, verde: 2 }
