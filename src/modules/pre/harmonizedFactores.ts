// Set de preguntas ARMONIZADO: cada pregunta alimenta el máximo de scores posibles.
// Contenido en español (validado); se traduce a EN aparte. Tipos en src/scoring/riskScores.ts.
import type { Factores } from '../../scoring/riskScores'

export interface FactorOption {
  label: string
  value: string
}
export interface FactorQ {
  id: keyof Factores
  text: string
  type: 'boolean' | 'choice' | 'number'
  options?: FactorOption[]
  unit?: string
  feeds: string
}

export const FACTOR_QUESTIONS: FactorQ[] = [
  { id: 'peso_kg', text: '¿Cuánto pesás, aproximadamente?', type: 'number', unit: 'kg', feeds: 'CAIDE · LIBRA' },
  { id: 'talla_cm', text: '¿Cuánto medís?', type: 'number', unit: 'cm', feeds: 'CAIDE · LIBRA' },
  {
    id: 'tabaquismo',
    text: 'Sobre el cigarrillo, ¿cuál es tu situación?',
    type: 'choice',
    feeds: 'LIBRA · ANU-ADRI · CogDrisk',
    options: [
      { label: 'Nunca fumé', value: 'never' },
      { label: 'Ex fumador/a', value: 'former' },
      { label: 'Fumo actualmente', value: 'current' },
    ],
  },
  {
    id: 'actividad_fisica',
    text: '¿Con qué frecuencia te movés o caminás a buen ritmo?',
    type: 'choice',
    feeds: 'LIBRA · CAIDE · ANU-ADRI',
    options: [
      { label: 'Casi nunca', value: 'low' },
      { label: 'Algo (1-2/sem)', value: 'medium' },
      { label: 'Regular (≥150 min/sem)', value: 'high' },
    ],
  },
  {
    id: 'actividad_cognitiva',
    text: '¿Con qué frecuencia hacés actividades que te exijan pensar (leer, juegos, cursos)?',
    type: 'choice',
    feeds: 'LIBRA · ANU-ADRI',
    options: [
      { label: 'Baja', value: 'low' },
      { label: 'Moderada', value: 'moderate' },
      { label: 'Alta', value: 'high' },
    ],
  },
  {
    id: 'dieta',
    text: '¿Comés habitualmente frutas, verduras, legumbres, aceite de oliva y pescado?',
    type: 'choice',
    feeds: 'LIBRA',
    options: [
      { label: 'Rara vez', value: 'low' },
      { label: 'A veces', value: 'some' },
      { label: 'Casi siempre', value: 'high' },
    ],
  },
  {
    id: 'pescado',
    text: '¿Cuántas porciones de pescado comés por semana?',
    type: 'choice',
    feeds: 'ANU-ADRI',
    options: [
      { label: 'Casi nunca', value: 'lt1' },
      { label: '1-2', value: '1to2' },
      { label: '3-4', value: '3to4' },
      { label: '5 o más', value: '5plus' },
    ],
  },
  {
    id: 'red_social',
    text: '¿Con qué frecuencia ves gente, familia o participás en grupos?',
    type: 'choice',
    feeds: 'ANU-ADRI',
    options: [
      { label: 'Bajo (me siento aislado/a)', value: 'low' },
      { label: 'Medio-bajo', value: 'medlow' },
      { label: 'Medio-alto', value: 'medhigh' },
      { label: 'Alto (contacto frecuente)', value: 'high' },
    ],
  },
  {
    id: 'alcohol_patron',
    text: 'Sobre el alcohol, ¿cuál te describe mejor?',
    type: 'choice',
    feeds: 'LIBRA · ANU-ADRI',
    options: [
      { label: 'No tomo', value: 'none' },
      { label: 'Bajo-moderado', value: 'lowmod' },
      { label: 'Excesivo', value: 'excess' },
    ],
  },
  { id: 'cardiopatia', text: '¿Tenés o tuviste enfermedad del corazón (infarto, angina, cardiopatía)?', type: 'boolean', feeds: 'LIBRA' },
  { id: 'enf_renal', text: '¿Te dijeron que tenés problemas en los riñones (filtrado bajo)?', type: 'boolean', feeds: 'LIBRA' },
  { id: 'ictus', text: '¿Tuviste alguna vez un ACV o derrame?', type: 'boolean', feeds: 'CogDrisk' },
  { id: 'fibrilacion', text: '¿Tenés fibrilación auricular u otra arritmia diagnosticada?', type: 'boolean', feeds: 'CogDrisk' },
  { id: 'insomnio', text: '¿Tenés insomnio o dificultad habitual para dormir?', type: 'boolean', feeds: 'CogDrisk' },
  { id: 'pas_mmhg', text: 'Si te tomaste la presión hace poco, ¿cuál fue la “de arriba” (sistólica)?', type: 'number', unit: 'mmHg', feeds: 'CAIDE (opcional)' },
  { id: 'colesterol_total', text: 'Colesterol total de un análisis reciente, si lo sabés', type: 'number', unit: 'mg/dL', feeds: 'CAIDE (opcional)' },
]
