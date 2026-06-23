// Datos territoriales de San Juan, portados de "Acompañar v0.5".
import { waMeLink } from '../channel/ChannelAdapter'

export const DEPTOS = [
  'Capital',
  'Rawson',
  'Rivadavia',
  'Chimbas',
  'Santa Lucía',
  'Pocito',
  'Caucete',
  'Albardón',
  'Angaco',
  'San Martín',
  '9 de Julio',
  '25 de Mayo',
  'Sarmiento',
  'Zonda',
  'Ullum',
  'Iglesia',
  'Jáchal',
  'Valle Fértil',
  'Calingasta',
] as const

// Hospital de referencia por departamento (fuentes públicas — ⚠️ VERIFICAR con
// datos oficiales del Min. Salud SJ; los que faltan caen al 107 + guardia más cercana).
const GUARDIA: Record<string, string> = {
  Capital: 'Hospital Dr. Guillermo Rawson',
  Rivadavia: 'Hospital Dr. Marcial Quiroga',
  Caucete: 'Hospital Dr. César Aguilar',
  Angaco: 'Hospital Dr. Alfredo Rizo Esparza',
  Pocito: 'Hospital Dr. Federico Cantoni',
  Albardón: 'Hospital Dr. José Giordano',
  Calingasta: 'Hospital Dr. Aldo Cantoni (Barreal)',
  Jáchal: 'Hospital San Roque',
  Iglesia: 'Hospital Dr. Tomás Perón',
  'Valle Fértil': 'Hospital Dr. Alejandro Albarracín',
  '25 de Mayo': 'Hospital 25 de Mayo',
}

export function guardiaDe(d?: string): string {
  if (d && GUARDIA[d]) return GUARDIA[d]
  return `la guardia / hospital más cercano${d ? ' de ' + d : ''}`
}

// San Juan saca turnos de salud por CIDI (WhatsApp). Nivel 0: abre el chat con el
// mensaje listo; la persona lo envía. (Número de ejemplo, a confirmar.)
export const CIDI_PHONE = '542644592201'

export function cidiTurnoLink(prioridad: string): string {
  return waMeLink(
    CIDI_PHONE,
    `Hola, quiero pedir un turno de salud cerebral. Prioridad orientativa: ${prioridad}. (Generado con KaizenAI — no diagnóstico.)`,
  )
}
