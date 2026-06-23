// Inferencia del modelo congelado Kaizen-MRCA v1 portada a TS (offline, sin backend).
// El pipeline real es lineal: ColumnTransformer(IterativeImputer + StandardScaler) → ElasticNet
// sobre ACE-III crudo → riesgo = corte(educación) − ACE_est → IsotonicRegression → umbral.
// Para inputs observados, ACE_est = intercept + Σ coef_i·(x_i − mean_i)/scale_i  → paridad exacta.
// Inputs faltantes (modo preliminar/Rápido): se tratan como la media (z=0, contribución 0).
// ⚠️ NO diagnostica. Cribado de primer nivel; requiere recalibración local.
import model from './mrca_model.json'

export interface MrcaRawInputs {
  edad: number
  sexo: 'Mujer' | 'Hombre'
  edu_anios: number
  cqc_total?: number // queja cognitiva 0-96
  adlq_pct?: number // función 0-100
  adlq_mean03?: number // función promedio 0-3 (alternativa)
  gds_total?: number // ánimo 0-15
  chsc_fisica?: number
  chsc_nutri?: number
  chsc_social?: number
  chsc_sueno?: number
  chsc_mental?: number
  diabetes?: boolean
  colesterol?: boolean
  obesidad?: boolean
  hipoacusia?: boolean
  fumador?: boolean
  vive_solo?: boolean
  sin_cloacas?: boolean
  sin_agua_red?: boolean
  deficit_visual?: boolean
}

export type MrcaModelBand = 'bajo' | 'moderado' | 'alto'

export interface MrcaPrediction {
  aceEst: number
  cut: number
  risk: number
  prob: number
  threshold: number
  decision: 'derivar' | 'descartar'
  band: MrcaModelBand
  contribs: { feature: string; value: number }[]
  preliminary: boolean
}

interface ModelJson {
  features: string[]
  coef: number[]
  mean: number[]
  scale: number[]
  intercept: number
  isotonic_x: number[]
  isotonic_y: number[]
  cut: { edu_ge_12: number; edu_lt_12: number }
  threshold: number
  fe_means: Record<string, number>
  reserva_affine: number[]
  rxe_affine: number[]
  edad_center: number
}

const M = model as unknown as ModelJson

function buildFeatures(r: MrcaRawInputs): Record<string, number> {
  const f: Record<string, number> = {}
  const edad = r.edad
  const edu = r.edu_anios
  f.edad = edad
  f.edad2 = (edad - M.edad_center) ** 2
  f.sexo = r.sexo === 'Mujer' ? 1 : 0
  f.edu_anios = edu
  f.cqc_total = r.cqc_total ?? Number.NaN
  f.adlq_pct = r.adlq_pct ?? (r.adlq_mean03 != null ? (r.adlq_mean03 / 3) * 100 : Number.NaN)
  f.gds_total = r.gds_total ?? Number.NaN
  const chf = r.chsc_fisica ?? M.fe_means.fisica
  const chn = r.chsc_nutri ?? M.fe_means.nutri
  const chs = r.chsc_social ?? M.fe_means.social
  const chsu = r.chsc_sueno ?? M.fe_means.sueno
  const chm = r.chsc_mental ?? M.fe_means.mental
  f.chsc_fisica = chf
  f.chsc_nutri = chn
  f.chsc_social = chs
  f.chsc_sueno = chsu
  f.chsc_mental = chm
  const [A, B, C, D] = M.reserva_affine
  const reserva = A * edu + B * chm + C * chs + D
  f.reserva_cognitiva = reserva
  const [Pc, Qc] = M.rxe_affine
  f.res_x_edad = Pc * (reserva * edad) + Qc * reserva
  const dia = r.diabetes ? 1 : 0
  const col = r.colesterol ? 1 : 0
  const obe = r.obesidad ? 1 : 0
  f.carga_cardiometabolica = dia + col + obe
  f.obesidad = obe
  f.hipoacusia = r.hipoacusia ? 1 : 0
  f.fumador = r.fumador ? 1 : 0
  f.vive_solo = r.vive_solo ? 1 : 0
  f.saneamiento_deficit = (r.sin_cloacas ? 1 : 0) + (r.sin_agua_red ? 1 : 0)
  f.deficit_visual = r.deficit_visual ? 1 : 0
  return f
}

// Interpolación lineal monótona (equivalente a IsotonicRegression.predict con clip).
function interp(xs: number[], ys: number[], x: number): number {
  const n = xs.length
  if (x <= xs[0]) return ys[0]
  if (x >= xs[n - 1]) return ys[n - 1]
  let lo = 0
  let hi = n - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (xs[mid] <= x) lo = mid
    else hi = mid
  }
  const t = (x - xs[lo]) / (xs[hi] - xs[lo])
  return ys[lo] + t * (ys[hi] - ys[lo])
}

export function predictMrca(r: MrcaRawInputs): MrcaPrediction {
  const f = buildFeatures(r)
  let ace = M.intercept
  let preliminary = false
  const contribs: { feature: string; value: number }[] = []
  M.features.forEach((name, i) => {
    const x = f[name]
    if (Number.isNaN(x)) {
      preliminary = true
      return
    }
    const z = (x - M.mean[i]) / M.scale[i]
    const c = M.coef[i] * z
    ace += c
    if (c !== 0) contribs.push({ feature: name, value: Math.round(c * 1000) / 1000 })
  })
  const cut = r.edu_anios >= 12 ? M.cut.edu_ge_12 : M.cut.edu_lt_12
  const risk = cut - ace
  const prob = Math.min(1, Math.max(0, interp(M.isotonic_x, M.isotonic_y, risk)))
  const thr = M.threshold
  const decision: 'derivar' | 'descartar' = prob >= thr ? 'derivar' : 'descartar'
  const band: MrcaModelBand = prob >= thr ? 'alto' : prob >= thr * 0.6 ? 'moderado' : 'bajo'
  contribs.sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
  return {
    aceEst: Math.round(ace * 10) / 10,
    cut,
    risk: Math.round(risk * 10) / 10,
    prob: Math.round(prob * 1000) / 1000,
    threshold: Math.round(thr * 1000) / 1000,
    decision,
    band,
    contribs,
    preliminary,
  }
}
