// Comparadores de riesgo INDIVIDUAL de demencia, con pesos VERIFICADOS contra la
// fuente (workflow de extracción + verificación adversarial, 2026-06). Ponderados por
// RIESGO RELATIVO (no PAF poblacional). Requieren RECALIBRACIÓN LOCAL.
//
// Fuentes verificadas:
//  - ANU-ADRI autorreporte: Anstey et al., PLOS One 2014;9(1):e86141, Tabla 2 (11 factores).
//  - LIBRA: Schiepers 2018 (Int J Geriatr Psychiatry); validación Vos 2017, Rosenau 2024.
//  - CAIDE: Kivipelto 2006 (Lancet Neurol) — score de MEDIANA EDAD.
//  - CogDrisk: Anstey 2022 (Alzheimers Dement DADM). Pesos verificados, pero la
//    OPERACIONALIZACIÓN del algoritmo no es reproducible desde el paper → NO se computa
//    internamente (se deriva a la herramienta oficial). No se inventan números.

export type Smoking = 'never' | 'former' | 'current'
export type Activity = 'low' | 'medium' | 'high'
export type CogActivity = 'low' | 'moderate' | 'high'
export type SocialNet = 'high' | 'medhigh' | 'medlow' | 'low'
export type FishWeek = 'lt1' | '1to2' | '3to4' | '5plus'
export type AlcoholPat = 'none' | 'lowmod' | 'excess'
export type Diet = 'low' | 'some' | 'high'

export interface RiskInputs {
  edad?: number
  sexo?: 'Mujer' | 'Hombre'
  edu_anios?: number
  // mediciones (opcionales)
  bmi?: number
  sbp?: number
  cholTotalMgdl?: number
  // factores
  hipertension?: boolean
  diabetes?: boolean
  colesterolDx?: boolean
  obesidadDx?: boolean
  depresion?: boolean
  tec?: boolean
  tabaquismo?: Smoking
  actividadFisica?: Activity
  inactividad?: boolean
  actividadCognitiva?: CogActivity
  redSocial?: SocialNet
  pescado?: FishWeek
  dieta?: Diet
  alcohol?: AlcoholPat
  cardiopatia?: boolean
  renal?: boolean
  ictus?: boolean
  fibrilacion?: boolean
  insomnio?: boolean
}

export interface RiskScore {
  id: string
  name: string
  computable: boolean
  value: number | null
  detail: string
  source: string
  caveat: string
  url?: string
}

const round1 = (n: number) => Math.round(n * 10) / 10
const esObeso = (i: RiskInputs) => (i.bmi != null ? i.bmi >= 30 : !!i.obesidadDx)
const esInactivo = (i: RiskInputs) =>
  i.actividadFisica ? i.actividadFisica === 'low' : !!i.inactividad

// ANU-ADRI (autorreporte, Anstey 2014 Tabla 2) — 11 factores, pesos verificados.
const ANU_AGE_M = [0, 1, 12, 18, 26, 33, 38]
const ANU_AGE_W = [0, 5, 14, 21, 29, 35, 41]
const ANU_SOCIAL: Record<SocialNet, number> = { high: 0, medhigh: 1, medlow: 4, low: 6 }
const ANU_FISH: Record<FishWeek, number> = { lt1: 0, '1to2': -3, '3to4': -4, '5plus': -5 }

export function anuAdri(i: RiskInputs): RiskScore {
  if (i.edad == null || i.sexo == null || i.edu_anios == null) {
    return {
      id: 'anu',
      name: 'ANU-ADRI (autorreporte)',
      computable: false,
      value: null,
      detail: 'requiere edad, sexo y educación',
      source: 'Anstey 2014 (PLOS One, Tabla 2)',
      caveat: 'Versión autorreporte de 11 factores.',
    }
  }
  const ageBand =
    i.edad < 65 ? 0 : i.edad < 70 ? 1 : i.edad < 75 ? 2 : i.edad < 80 ? 3 : i.edad < 85 ? 4 : i.edad < 90 ? 5 : 6
  let v = (i.sexo === 'Hombre' ? ANU_AGE_M : ANU_AGE_W)[ageBand]
  // Educación PROTECTORA: >11 años = 0 (ref), 8–11 = +3, <8 años = +6 (Anstey 2014,
  // PLOS One Tabla 2). A menos educación, más puntos (más riesgo). NO invertir.
  v += i.edu_anios < 8 ? 6 : i.edu_anios <= 11 ? 3 : 0
  if (i.diabetes) v += 3
  if (i.depresion) v += 2
  if (i.tec) v += 4
  if (i.tabaquismo === 'former') v += 1
  else if (i.tabaquismo === 'current') v += 4
  if (i.actividadFisica === 'medium') v -= 2
  else if (i.actividadFisica === 'high') v -= 3
  if (i.actividadCognitiva === 'moderate') v -= 6
  else if (i.actividadCognitiva === 'high') v -= 7
  if (i.redSocial) v += ANU_SOCIAL[i.redSocial]
  if (i.pescado) v += ANU_FISH[i.pescado]
  if (i.alcohol === 'lowmod') v -= 3 // abstemio=0; excesivo: sin valor en la fuente → no se suma
  return {
    id: 'anu',
    name: 'ANU-ADRI (autorreporte)',
    computable: true,
    value: v,
    detail: `${v} pts (11 factores; ↑ = ↑ riesgo)`,
    source: 'Anstey 2014 (PLOS One, Tabla 2; pesos verificados)',
    caveat:
      'IMC y colesterol EXCLUIDOS por diseño en esta versión; alcohol "excesivo" sin puntaje en la fuente. Recalibrar localmente.',
  }
}

// LIBRA completo (Schiepers 2018) — pesos verificados.
export function libra(i: RiskInputs): RiskScore {
  let v = 0
  if (i.actividadCognitiva === 'high') v -= 3.2
  if (i.dieta === 'high') v -= 1.7
  if (i.alcohol === 'lowmod') v -= 1.0
  if (i.depresion) v += 2.1
  if (i.hipertension) v += 1.6
  if (esObeso(i)) v += 1.6
  if (i.tabaquismo === 'current') v += 1.5
  if (i.colesterolDx) v += 1.4
  if (i.diabetes) v += 1.3
  if (i.renal) v += 1.1
  if (esInactivo(i)) v += 1.1
  if (i.cardiopatia) v += 1.0
  return {
    id: 'libra',
    name: 'LIBRA',
    computable: true,
    value: round1(v),
    detail: `${round1(v)} (rango −5,9 a +12,7; ↑ = ↑ riesgo modificable)`,
    source: 'Schiepers 2018; validado Vos 2017, Rosenau 2024 (12 factores)',
    caveat: 'Ponderado por riesgo relativo. Recalibrar localmente.',
  }
}

// CAIDE (Kivipelto 2006, Lancet Neurol) — score 0–15. Colesterol >6,5 mmol/L (~251 mg/dL) = 2 pts
// (verificado contra fuente: la suma de máximos da 15 SÓLO con colesterol=2). Medidas si están; si no, proxy.
export function caide(i: RiskInputs): RiskScore {
  if (i.edad == null || i.edu_anios == null) {
    return {
      id: 'caide',
      name: 'CAIDE',
      computable: false,
      value: null,
      detail: 'requiere edad y educación',
      source: 'Kivipelto 2006 (Lancet Neurol)',
      caveat: 'Score de mediana edad.',
    }
  }
  const ageP = i.edad < 47 ? 0 : i.edad <= 53 ? 3 : 4
  const eduP = i.edu_anios >= 10 ? 0 : i.edu_anios >= 7 ? 2 : 3
  const sexP = i.sexo === 'Hombre' ? 1 : 0
  const htaP = (i.sbp != null ? i.sbp > 140 : !!i.hipertension) ? 2 : 0
  const obP = esObeso(i) ? 2 : 0
  const colP = (i.cholTotalMgdl != null ? i.cholTotalMgdl > 251 : !!i.colesterolDx) ? 2 : 0
  const inP = esInactivo(i) ? 1 : 0
  const v = ageP + eduP + sexP + htaP + obP + colP + inP
  const r20 = v <= 5 ? '~1%' : v <= 7 ? '~1,9%' : v <= 9 ? '~4,2%' : v <= 11 ? '~7,4%' : '~16,4%'
  const medido = i.sbp != null && i.cholTotalMgdl != null
  return {
    id: 'caide',
    name: 'CAIDE',
    computable: true,
    value: v,
    detail: `${v}/15 · riesgo a 20 años ${r20}${medido ? '' : ' (proxy)'}`,
    source: 'Kivipelto 2006 (Lancet Neurol)',
    caveat: medido
      ? 'Validado en MEDIANA EDAD: interpretar con cautela en mayores.'
      : 'MEDIANA EDAD + sin PA/colesterol medidos (usa proxy sí/no). Cargá medidas para fidelidad.',
  }
}

// CogDrisk: pesos verificados, pero el algoritmo de operacionalización NO es reproducible
// desde el paper → no se computa internamente; se deriva a la herramienta oficial.
export function cogdrisk(_i: RiskInputs): RiskScore {
  return {
    id: 'cogdrisk',
    name: 'CogDrisk',
    computable: false,
    value: null,
    detail: '17 factores; la app ya recoge sus inputs (edad×sexo, diabetes, ictus, FA, insomnio, depresión…)',
    source: 'Anstey 2022 (Alzheimers Dement DADM); verificación: pesos OK, algoritmo no reproducible',
    caveat: 'El puntaje validado se computa en la herramienta oficial (cuestionario completo).',
    url: 'https://www.cogdrisk.com',
  }
}

export function computeRiskScores(i: RiskInputs): RiskScore[] {
  return [libra(i), caide(i), anuAdri(i), cogdrisk(i)]
}

// Inputs armonizados extra (graduados) que la app no captura como sí/no.
export interface Factores {
  peso_kg?: number
  talla_cm?: number
  pas_mmhg?: number
  colesterol_total?: number
  tabaquismo?: Smoking
  actividad_fisica?: Activity
  actividad_cognitiva?: CogActivity
  red_social?: SocialNet
  pescado?: FishWeek
  dieta?: Diet
  alcohol_patron?: AlcoholPat
  cardiopatia?: boolean
  ictus?: boolean
  enf_renal?: boolean
  fibrilacion?: boolean
  insomnio?: boolean
}

export function bmiFrom(f: Factores): number | undefined {
  if (typeof f.peso_kg === 'number' && f.peso_kg > 0 && typeof f.talla_cm === 'number' && f.talla_cm > 0) {
    const m = f.talla_cm / 100
    return f.peso_kg / (m * m)
  }
  return undefined
}

export const MRCA_FEATURE_LABELS: Record<string, string> = {
  edad: 'Edad',
  edad2: 'Edad (no lineal)',
  sexo: 'Sexo',
  edu_anios: 'Años de educación',
  cqc_total: 'Queja cognitiva (CQC)',
  adlq_pct: 'Funcionalidad (ADLQ)',
  gds_total: 'Ánimo (GDS)',
  chsc_fisica: 'Hábitos: actividad física',
  chsc_nutri: 'Hábitos: nutrición',
  chsc_social: 'Hábitos: vínculos sociales',
  chsc_sueno: 'Hábitos: sueño',
  chsc_mental: 'Hábitos: actividad mental',
  reserva_cognitiva: 'Reserva cognitiva',
  res_x_edad: 'Reserva × edad',
  carga_cardiometabolica: 'Carga cardiometabólica',
  obesidad: 'Obesidad',
  hipoacusia: 'Hipoacusia',
  fumador: 'Tabaquismo',
  vive_solo: 'Vive solo/a',
  saneamiento_deficit: 'Déficit de saneamiento',
  deficit_visual: 'Déficit visual',
}
