// Comparadores de riesgo INDIVIDUAL de demencia (validados), para la vista del
// profesional. ⚠️ Son índices ponderados por RIESGO RELATIVO (no PAF poblacional)
// y requieren RECALIBRACIÓN LOCAL. Aproximaciones documentadas (faltan factores /
// se usan proxies sí-no), en el espíritu del análisis del director (m11 LIBRA-approx).
//
// Referencias:
//  - LIBRA: Schiepers 2018 (Int J Geriatr Psychiatry); validación Vos 2017, Rosenau 2024 (J Alzheimers Dis).
//  - CAIDE: Kivipelto 2006 (Lancet Neurol) — score de MEDIANA EDAD.
//  - ANU-ADRI: Anstey 2014 (BMJ Open). CogDrisk: Anstey 2021. Comparación: Huque 2023 (JAMA Netw Open).

export interface RiskInputs {
  edad?: number
  sexo?: 'Mujer' | 'Hombre'
  edu_anios?: number
  hipertension?: boolean
  diabetes?: boolean
  colesterol?: boolean
  obesidad?: boolean
  tabaquismo?: boolean
  inactividad?: boolean
  depresion?: boolean
  tbi?: boolean
  alcoholExceso?: boolean
}

export interface RiskScore {
  id: string
  name: string
  computable: boolean
  value: number | null
  detail: string // banda / interpretación
  source: string
  caveat: string
  url?: string // herramienta oficial, si aplica
}

// LIBRA (parcial; pesos publicados Schiepers 2018 para los factores capturados).
export function libra(i: RiskInputs): RiskScore {
  const W: Record<string, number> = {
    depresion: 2.1,
    diabetes: 1.3,
    hipertension: 1.6,
    obesidad: 1.6,
    colesterol: 1.4,
    tabaquismo: 1.5,
    inactividad: 1.1,
  }
  let v = 0
  if (i.depresion) v += W.depresion
  if (i.diabetes) v += W.diabetes
  if (i.hipertension) v += W.hipertension
  if (i.obesidad) v += W.obesidad
  if (i.colesterol) v += W.colesterol
  if (i.tabaquismo) v += W.tabaquismo
  if (i.inactividad) v += W.inactividad
  return {
    id: 'libra',
    name: 'LIBRA',
    computable: true,
    value: Math.round(v * 10) / 10,
    detail: 'a mayor puntaje, mayor riesgo modificable (ponderado por RR)',
    source: 'Schiepers 2018; validado Vos 2017, Rosenau 2024',
    caveat:
      'Parcial: faltan dieta mediterránea, actividad cognitiva y alcohol (protectores), cardiopatía y enf. renal. Recalibrar localmente.',
  }
}

// CAIDE (Kivipelto 2006). Score de MEDIANA EDAD; proxies sí-no de PA/IMC/colesterol.
export function caide(i: RiskInputs): RiskScore {
  if (i.edad == null || i.edu_anios == null) {
    return {
      id: 'caide',
      name: 'CAIDE',
      computable: false,
      value: null,
      detail: 'requiere edad y educación',
      source: 'Kivipelto 2006 (Lancet Neurol)',
      caveat: 'Validado en mediana edad.',
    }
  }
  const ageP = i.edad < 47 ? 0 : i.edad <= 53 ? 3 : 4
  const eduP = i.edu_anios >= 10 ? 0 : i.edu_anios >= 7 ? 2 : 3
  const sexP = i.sexo === 'Hombre' ? 1 : 0
  const htaP = i.hipertension ? 2 : 0
  const obP = i.obesidad ? 2 : 0
  const colP = i.colesterol ? 2 : 0
  const inP = i.inactividad ? 1 : 0
  const v = ageP + eduP + sexP + htaP + obP + colP + inP
  // riesgo de demencia a 20 años por banda (cohorte original)
  const r20 = v <= 5 ? '~1%' : v <= 7 ? '~1,9%' : v <= 9 ? '~4,2%' : v <= 11 ? '~7,4%' : '~16,4%'
  return {
    id: 'caide',
    name: 'CAIDE',
    computable: true,
    value: v,
    detail: `${v}/15 · riesgo a 20 años ${r20}`,
    source: 'Kivipelto 2006 (Lancet Neurol)',
    caveat:
      'Validado en MEDIANA EDAD: interpretar con cautela en adultos mayores. Usa respuestas sí/no como proxy de PA, IMC y colesterol medidos.',
  }
}

// ANU-ADRI y CogDrisk: instrumentos COMPLETOS (ponderados por RR, con puntajes por edad).
// Computarlos desde un subconjunto de factores NO sería válido → se citan con su rango/
// estructura real y, para CogDrisk, se enlaza la calculadora oficial. No se fabrican puntajes.
export function anuAdri(_i: RiskInputs): RiskScore {
  return {
    id: 'anu',
    name: 'ANU-ADRI',
    computable: false,
    value: null,
    detail: '~10-15 factores, ponderado por RR (rango aprox. −13 a 64)',
    source: 'Anstey 2014 (PLOS One 9:e86141); comparado en Huque 2023 (JAMA Netw Open)',
    caveat: 'Requiere su cuestionario completo para un puntaje válido; no se computa desde un subconjunto.',
  }
}

export function cogdrisk(_i: RiskInputs): RiskScore {
  return {
    id: 'cogdrisk',
    name: 'CogDrisk',
    computable: false,
    value: null,
    detail: '17 factores / 91 ítems, ponderado por RR (rango ≈ 0–49 vida tardía)',
    source: 'Anstey 2022 (Alzheimers Dement DADM); comparado en Huque 2023 (JAMA Netw Open)',
    caveat: 'Computar en la herramienta oficial (cuestionario completo de 91 ítems).',
    url: 'https://www.cogdrisk.com',
  }
}

export function computeRiskScores(i: RiskInputs): RiskScore[] {
  return [libra(i), caide(i), anuAdri(i), cogdrisk(i)]
}

// Etiquetas legibles de las 21 features del MRCA (para mostrar contribuciones).
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
