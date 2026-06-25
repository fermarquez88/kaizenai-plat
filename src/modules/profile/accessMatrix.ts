// accessMatrix.ts — Role-as-view access matrix (additive, pure).
// Encodes MAPA_PERFIL_MODULAR §4: per module × role → View / View+Edit / none.
// The person owns the data; each actor edits only its layer (LOSSLESS by source).

import type { Role } from './moduleRegistry'

export type Access = 'V' | 'VE' | '-'

const ROLES: Role[] = ['persona', 'cuidador', 'agente', 'medico', 'neuropsico']

// Order: persona · cuidador · agente · medico · neuropsico
const M: Record<string, [Access, Access, Access, Access, Access]> = {
  M1: ['VE', 'V', 'VE', 'V', 'V'],
  M2: ['VE', 'VE', 'VE', 'V', 'V'],
  M3: ['VE', 'V', 'V', 'V', 'V'], // cuidador NO edita el autorreporte cognitivo de la persona
  'M3-inf': ['V', 'VE', 'V', 'V', 'V'],
  M4: ['V', '-', '-', 'V', 'VE'], // neuropsico edita; persona ve devolución llana
  M5: ['VE', 'V', 'V', 'V', 'V'],
  M6: ['VE', 'VE', 'V', 'V', 'V'],
  'M6-inf': ['V', 'VE', 'V', 'V', 'V'],
  M7: ['VE', 'V', 'VE', 'V', 'V'],
  M8: ['VE', 'V', 'VE', 'V', 'V'],
  M9: ['VE', 'V', 'VE', 'VE', 'V'], // agente pasa vitales a "medido"; médico valida
  M10: ['VE', 'V', 'V', 'V', 'V'],
  M11: ['VE', 'V', 'V', 'V', 'V'],
  M12: ['VE', 'V', 'VE', 'V', 'V'],
  M13: ['VE', 'VE', 'VE', 'VE', 'V'], // médico concilia meds
  M14: ['-', 'VE', 'V', 'V', 'V'], // cuidador sobre sí
  M15: ['V', 'V', 'V', 'VE', 'V'], // solo médico firma dx; neuropsico aporta, no firma
}

function access(role: Role, moduleId: string): Access {
  const row = M[moduleId]
  if (!row) return '-'
  return row[ROLES.indexOf(role)] ?? '-'
}

export function canView(role: Role, moduleId: string): boolean {
  return access(role, moduleId) !== '-'
}

export function canEdit(role: Role, moduleId: string): boolean {
  return access(role, moduleId) === 'VE'
}
