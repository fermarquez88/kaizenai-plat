// moduleRegistry.ts — The modular person-bus skeleton (M1–M15) as data.
// Faithful encoding of MAPA_PERFIL_MODULAR_v1.md §1: each module's WHO domain, owner role,
// preconsulta tier and completeness weight. ADDITIVE foundation — not wired into existing
// flows. The completeness engine + access matrix consume this.

/** 5 WHO functional domains + 5 determinant clusters + skeleton/synthesis layers. */
export type Dominio =
  | 'identidad' // M1 — skeleton, transversal
  | 'gate' // M2 — red flags, clinical gate
  | 'cognitivo' // M3 / M3-inf / M4
  | 'socioemocional' // M5
  | 'conductual' // M6 / M6-inf
  | 'sensorial' // M7
  | 'motor' // M8
  | 'saludFisica' // M9
  | 'habitos' // M10 (learning/connection + physical)
  | 'sueno' // M11 (modulator)
  | 'determinantesSociales' // M12 (safety/protection + environments)
  | 'medico' // M13 (access to services)
  | 'cuidador' // M14 (human axis)
  | 'sintesis' // M15 (dx/plan)

/** Actor whose layer this module belongs to (rol = vista). */
export type Role = 'persona' | 'cuidador' | 'agente' | 'medico' | 'neuropsico'

/** Where the module sits in the preconsulta completeness meter. */
export type ModuleTier = 'obligatorio' | 'deseable' | 'posterior' | 'aparte'

export interface ModuleDef {
  id: string
  nombre: string
  dominio: Dominio
  ownerRole: Role
  tier: ModuleTier
  /** Completeness weight. Obligatorio weights sum to 90 (núcleo); deseables lift up to 100.
   *  posterior/aparte = 0 (M4/M15 capa clínica; M14 cuidador module aparte). */
  weight: number
  /** Modules folded into a parent's denominator (M7/M8/M13→M9; M11→M10). */
  parent?: string
}

// Pesos de MAPA_PERFIL_MODULAR §1/§3. Núcleo obligatorio = 90; deseables suben a 100.
// M5 se separa: M5 (GDS, obligatorio 10) + M5-extra (GAD/UCLA, deseable 5).
export const MODULES: ModuleDef[] = [
  { id: 'M1', nombre: 'Identidad + demarcación + curso de vida', dominio: 'identidad', ownerRole: 'persona', tier: 'obligatorio', weight: 20 },
  { id: 'M2', nombre: 'Señales de alarma / banderas rojas', dominio: 'gate', ownerRole: 'persona', tier: 'obligatorio', weight: 10 },
  { id: 'M3', nombre: 'Cognitivo — autorreporte (CQC-24)', dominio: 'cognitivo', ownerRole: 'persona', tier: 'obligatorio', weight: 15 },
  { id: 'M3-inf', nombre: 'Cognitivo — informante (AD8/IQCODE)', dominio: 'cognitivo', ownerRole: 'cuidador', tier: 'deseable', weight: 5 },
  { id: 'M4', nombre: 'Cognitivo — objetivo / batería NPS', dominio: 'cognitivo', ownerRole: 'neuropsico', tier: 'posterior', weight: 0 },
  { id: 'M5', nombre: 'Socioemocional — ánimo (GDS-15)', dominio: 'socioemocional', ownerRole: 'persona', tier: 'obligatorio', weight: 10 },
  { id: 'M5-extra', nombre: 'Socioemocional — ansiedad/soledad (GAD-7/UCLA-3)', dominio: 'socioemocional', ownerRole: 'persona', tier: 'deseable', weight: 5 },
  { id: 'M6', nombre: 'Conductual — funcionalidad AVD/AIVD (T-ADLQ)', dominio: 'conductual', ownerRole: 'persona', tier: 'obligatorio', weight: 10 },
  { id: 'M6-inf', nombre: 'Conductual — informante (FAQ/Pfeffer)', dominio: 'conductual', ownerRole: 'cuidador', tier: 'deseable', weight: 5 },
  { id: 'M7', nombre: 'Sensorial (visión/audición)', dominio: 'sensorial', ownerRole: 'persona', tier: 'obligatorio', weight: 0, parent: 'M9' },
  { id: 'M8', nombre: 'Motor / movilidad', dominio: 'motor', ownerRole: 'persona', tier: 'deseable', weight: 0, parent: 'M9' },
  { id: 'M9', nombre: 'Lancet + salud física + cardiometabólico', dominio: 'saludFisica', ownerRole: 'persona', tier: 'obligatorio', weight: 15 },
  { id: 'M10', nombre: 'Hábitos / estilo de vida + reserva (CRC-6)', dominio: 'habitos', ownerRole: 'persona', tier: 'obligatorio', weight: 5 },
  { id: 'M11', nombre: 'Sueño', dominio: 'sueno', ownerRole: 'persona', tier: 'deseable', weight: 0, parent: 'M10' },
  { id: 'M12', nombre: 'Determinantes sociales / exposoma', dominio: 'determinantesSociales', ownerRole: 'persona', tier: 'obligatorio', weight: 5 },
  { id: 'M13', nombre: 'Antecedentes médicos + medicación', dominio: 'medico', ownerRole: 'persona', tier: 'obligatorio', weight: 0, parent: 'M9' },
  { id: 'M14', nombre: 'Cuidador (Zarit)', dominio: 'cuidador', ownerRole: 'cuidador', tier: 'aparte', weight: 0 },
  { id: 'M15', nombre: 'Diagnóstico / etiología + plan', dominio: 'sintesis', ownerRole: 'medico', tier: 'posterior', weight: 0 },
]

export const MODULE_BY_ID: Record<string, ModuleDef> = Object.fromEntries(MODULES.map((m) => [m.id, m]))

export function getModule(id: string): ModuleDef | undefined {
  return MODULE_BY_ID[id]
}

/** Total obligatorio weight (the "núcleo" — must be 90 per the map). */
export function obligatorioWeightTotal(): number {
  return MODULES.filter((m) => m.tier === 'obligatorio').reduce((a, m) => a + m.weight, 0)
}
