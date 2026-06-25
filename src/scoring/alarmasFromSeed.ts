// Adapter de lectura: convierte cada persona seed en su cola de alarmas (sin persistir),
// mismo patrón que redRecords.fromAssessment. Reusa computeEquity (vulnerabilidad) y el
// catálogo de capacidades del territorio piloto. ⚠️ Mapeo riesgo↔banda orientativo.
import type { SeedPersona } from '../seed/personas'
import { computeEquity } from './equity'
import { derivarAlarmas, type Alarma, type CapacidadLocal, type DeriveAlarmasInput } from './alarmas'
import type { MrcaModelBand } from './mrcaModel'

const RIESGO_POR_BANDA: Record<MrcaModelBand, number> = { bajo: 0.2, moderado: 0.5, alto: 0.8 }

// Capacidad del territorio piloto (demo): APS puede medir lo básico; NO hay audiometría
// de campo a <60 km → los pedidos de audición nacen como BRECHA DE SERVICIO (suben a política).
export const CAPACIDAD_DEMO: CapacidadLocal = {
  puedeMedir: { presionArterial: true, imc: true, hba1c: true, ldl: true, audicion: false, vision: true },
  hayDerivacionClinica: true,
}

export function inputFromSeed(p: SeedPersona, now: number): DeriveAlarmasInput {
  const vulnerabilidad = computeEquity({
    edad: p.age,
    edu_anios: p.edu,
    vive: p.vive,
    cerca: p.cerca,
    isolation: p.isolation,
  }).score
  return {
    personId: p.id,
    alias: p.alias,
    riesgo: RIESGO_POR_BANDA[p.mrcaBand],
    vulnerabilidad,
    diasSinContacto: p.lastSeenDays,
    agudo: p.agudo,
    // Discordancia tipada si existe; si no, el booleano legado se trata como caso sin dirección.
    discordancia: p.discordancia ?? (p.discrepancia ? { presente: true } : undefined),
    medibles: p.medibles,
    capacidad: CAPACIDAD_DEMO,
    now,
  }
}

/** Cola de alarmas de toda la cohorte seed (la "red" en un dispositivo, para la demo). */
export function alarmasDeSeed(personas: SeedPersona[], now: number): Alarma[] {
  return personas.flatMap((p) => derivarAlarmas(inputFromSeed(p, now))).sort((a, b) => b.prioridad - a.prioridad)
}
