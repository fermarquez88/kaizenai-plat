// Kaizen-MRCA REDUCIDO (opción A6, "7 preguntas") portado a TS desde el artefacto congelado
// `kaizen_mrca_reducedA6_v1.joblib` (paridad verificada vs Python en mrcaReducedModel.test.ts).
// 6 features autorreportables/por-agente: edad · sexo · educación · hipoacusia · tabaquismo · vive_solo.
// Pipeline lineal: ElasticNet sobre ACE crudo → riesgo = corte(educación, Bruno) − ACE_est → isotónica → umbral.
// ⚠️ NO diagnostica. Screener de PRIMER nivel, alta sensibilidad/VPN (tiende a derivar para no perder casos);
//    requiere recalibración local. El corte de SEXO (Mujer=1) replica la convención del FE_SAP — confirmar.
import model from './mrca_reducedA6.json'
import type { MrcaModelBand } from './mrcaModel'

interface ReducedModelJson {
  features: string[]
  coef: number[]
  mean: number[]
  scale: number[]
  intercept: number
  isotonic_x: number[]
  isotonic_y: number[]
  cut: { edu_ge_12: number; edu_lt_12: number }
  threshold: number
}

const M = model as unknown as ReducedModelJson

/** Inputs codificados como en el entrenamiento (sexo: Mujer=1, Hombre=0; flags 0/1). */
export interface MrcaReducedInputs {
  edad: number
  sexo: number
  edu_anios: number
  hipoacusia: number
  fumador: number
  vive_solo: number
}

export interface MrcaReducedPrediction {
  aceEst: number
  cut: number
  risk: number
  prob: number
  threshold: number
  decision: 'derivar' | 'descartar'
  band: MrcaModelBand
  preliminary: boolean
}

// Interpolación lineal monótona (= IsotonicRegression.predict con clip).
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

export function predictMrcaReduced(r: MrcaReducedInputs): MrcaReducedPrediction {
  const fmap: Record<string, number> = {
    edad: r.edad,
    sexo: r.sexo,
    edu_anios: r.edu_anios,
    hipoacusia: r.hipoacusia,
    fumador: r.fumador,
    vive_solo: r.vive_solo,
  }
  let ace = M.intercept
  let preliminary = false
  M.features.forEach((name, i) => {
    const x = fmap[name]
    if (x == null || Number.isNaN(x)) {
      preliminary = true
      return
    }
    ace += M.coef[i] * ((x - M.mean[i]) / M.scale[i])
  })
  const cut = r.edu_anios >= 12 ? M.cut.edu_ge_12 : M.cut.edu_lt_12
  const risk = cut - ace
  const prob = Math.min(1, Math.max(0, interp(M.isotonic_x, M.isotonic_y, risk)))
  const thr = M.threshold
  const decision: 'derivar' | 'descartar' = prob >= thr ? 'derivar' : 'descartar'
  const band: MrcaModelBand = prob >= thr ? 'alto' : prob >= thr * 0.6 ? 'moderado' : 'bajo'
  return {
    aceEst: Math.round(ace * 10) / 10,
    cut,
    risk: Math.round(risk * 10) / 10,
    prob: Math.round(prob * 1000) / 1000,
    threshold: Math.round(thr * 1000) / 1000,
    decision,
    band,
    preliminary,
  }
}
