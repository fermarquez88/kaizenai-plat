// Catálogo de medicación + flags. ⚠️ ILUSTRATIVO / a validar clínicamente. No
// prescribe ni suspende: solo señala para revisión.
//   acb   = Anticholinergic Cognitive Burden (0–3)
//   bzd   = benzodiacepina o Z-drug
//   beers = potencialmente inapropiada en mayores SEGÚN USO (Beers/STOPP) — revisar indicación
//   tto   = 'antidemencia' (tratamiento en curso; informativo, no es un riesgo)
// Correcciones del panel: mirtazapina ACB→0; antipsicóticos = revisar indicación
// (no "inapropiado" a secas); + opioides, gabapentinoides, litio, relajantes,
// anticolinérgicos de vejiga/estómago; donepecilo/memantina = tratamiento en curso.

export interface DrugInfo {
  id: string
  name: string
  acb: 0 | 1 | 2 | 3
  bzd?: boolean
  beers?: boolean
  tto?: 'antidemencia'
}

export const DRUG_CATALOG: DrugInfo[] = [
  // Anticolinérgicos fuertes (ACB 3)
  { id: 'amitriptilina', name: 'Amitriptilina (Tryptanol)', acb: 3, beers: true },
  { id: 'clomipramina', name: 'Clomipramina (Anafranil)', acb: 3, beers: true },
  { id: 'imipramina', name: 'Imipramina', acb: 3, beers: true },
  { id: 'clorpromazina', name: 'Clorpromazina', acb: 3, beers: true },
  { id: 'difenhidramina', name: 'Difenhidramina (Benadryl)', acb: 3, beers: true },
  { id: 'dimenhidrinato', name: 'Dimenhidrinato (Dramamine)', acb: 3, beers: true },
  { id: 'hidroxizina', name: 'Hidroxizina', acb: 3, beers: true },
  { id: 'prometazina', name: 'Prometazina (Fenergan)', acb: 3, beers: true },
  { id: 'oxibutinina', name: 'Oxibutinina', acb: 3, beers: true },
  { id: 'tolterodina', name: 'Tolterodina', acb: 3, beers: true },
  { id: 'biperideno', name: 'Biperideno (Akineton)', acb: 3, beers: true },
  { id: 'clozapina', name: 'Clozapina', acb: 3 },
  { id: 'paroxetina', name: 'Paroxetina', acb: 3, beers: true },
  { id: 'meclizina', name: 'Meclizina', acb: 2, beers: true },
  // ACB 2
  { id: 'carbamazepina', name: 'Carbamazepina', acb: 2 },
  { id: 'ciproheptadina', name: 'Ciproheptadina', acb: 2, beers: true },
  { id: 'ciclobenzaprina', name: 'Ciclobenzaprina', acb: 2, beers: true }, // relajante muscular
  { id: 'amantadina', name: 'Amantadina', acb: 2 },
  // ACB 1
  { id: 'hioscina', name: 'Hioscina / Buscapina (uso seguido)', acb: 1 },
  { id: 'trazodona', name: 'Trazodona', acb: 1 },
  { id: 'digoxina', name: 'Digoxina', acb: 1, beers: true },
  { id: 'furosemida', name: 'Furosemida', acb: 1 },
  { id: 'codeina', name: 'Codeína', acb: 1 },
  { id: 'metoclopramida', name: 'Metoclopramida', acb: 1, beers: true },
  { id: 'ranitidina', name: 'Ranitidina', acb: 1 },
  { id: 'prednisona', name: 'Prednisona', acb: 1 },
  // Antipsicóticos: REVISAR INDICACIÓN (Beers en demencia, no "inapropiado" per se)
  { id: 'quetiapina', name: 'Quetiapina', acb: 0, beers: true },
  { id: 'risperidona', name: 'Risperidona', acb: 1, beers: true },
  { id: 'olanzapina', name: 'Olanzapina', acb: 1, beers: true },
  { id: 'haloperidol', name: 'Haloperidol', acb: 1, beers: true },
  // Mirtazapina: carga anticolinérgica ~0 (corrección del panel)
  { id: 'mirtazapina', name: 'Mirtazapina', acb: 0 },
  // Benzodiacepinas / Z-drugs (potencialmente inapropiadas en mayores)
  { id: 'diazepam', name: 'Diazepam (Valium)', acb: 0, bzd: true, beers: true },
  { id: 'clonazepam', name: 'Clonazepam (Rivotril)', acb: 0, bzd: true, beers: true },
  { id: 'lorazepam', name: 'Lorazepam (Trapax)', acb: 0, bzd: true, beers: true },
  { id: 'alprazolam', name: 'Alprazolam (Alplax)', acb: 0, bzd: true, beers: true },
  { id: 'bromazepam', name: 'Bromazepam (Lexotanil)', acb: 0, bzd: true, beers: true },
  { id: 'clobazam', name: 'Clobazam', acb: 0, bzd: true, beers: true },
  { id: 'zolpidem', name: 'Zolpidem', acb: 0, bzd: true, beers: true },
  { id: 'zopiclona', name: 'Zopiclona', acb: 0, bzd: true, beers: true },
  // Otros de alto impacto cognitivo (agregados por el panel)
  { id: 'tramadol', name: 'Tramadol', acb: 0, beers: true }, // opioide
  { id: 'oxicodona', name: 'Oxicodona', acb: 0, beers: true },
  { id: 'morfina', name: 'Morfina', acb: 1 },
  { id: 'gabapentina', name: 'Gabapentina', acb: 0, beers: true }, // gabapentinoide sedante
  { id: 'pregabalina', name: 'Pregabalina', acb: 0, beers: true },
  { id: 'litio', name: 'Litio', acb: 0, beers: true },
  { id: 'glibenclamida', name: 'Glibenclamida', acb: 0, beers: true },
  { id: 'ibuprofeno', name: 'Ibuprofeno (uso crónico)', acb: 0, beers: true },
  { id: 'ketorolaco', name: 'Ketorolaco', acb: 0, beers: true },
  // Tratamiento antidemencia EN CURSO (informativo, no es un riesgo)
  { id: 'donepecilo', name: 'Donepecilo', acb: 0, tto: 'antidemencia' },
  { id: 'memantina', name: 'Memantina', acb: 0, tto: 'antidemencia' },
  { id: 'rivastigmina', name: 'Rivastigmina', acb: 0, tto: 'antidemencia' },
  // Frecuentes sin flag
  { id: 'enalapril', name: 'Enalapril', acb: 0 },
  { id: 'losartan', name: 'Losartán', acb: 0 },
  { id: 'amlodipina', name: 'Amlodipina', acb: 0 },
  { id: 'metformina', name: 'Metformina', acb: 0 },
  { id: 'levotiroxina', name: 'Levotiroxina', acb: 0 },
  { id: 'atorvastatina', name: 'Atorvastatina', acb: 0 },
  { id: 'omeprazol', name: 'Omeprazol', acb: 0 },
  { id: 'aspirina', name: 'Aspirina', acb: 0 },
  { id: 'paracetamol', name: 'Paracetamol', acb: 0 },
  { id: 'sertralina', name: 'Sertralina', acb: 0 },
  { id: 'escitalopram', name: 'Escitalopram', acb: 0 },
  { id: 'levodopa', name: 'Levodopa', acb: 0 },
]

export interface MedFlags {
  count: number
  polypharmacy: boolean
  acbTotal: number
  acbHigh: boolean
  bzdCount: number
  beersCount: number
  antidementia: boolean
  /** hay algún motivo de revisión farmacológica */
  anyConcern: boolean
}

export const POLYPHARMACY_THRESHOLD = 5
export const ACB_HIGH_THRESHOLD = 3

export function computeMedFlags(meds: DrugInfo[]): MedFlags {
  const count = meds.length
  const acbTotal = meds.reduce((sum, m) => sum + m.acb, 0)
  const bzdCount = meds.filter((m) => m.bzd).length
  const beersCount = meds.filter((m) => m.beers).length
  const polypharmacy = count >= POLYPHARMACY_THRESHOLD
  const acbHigh = acbTotal >= ACB_HIGH_THRESHOLD
  return {
    count,
    polypharmacy,
    acbTotal,
    acbHigh,
    bzdCount,
    beersCount,
    antidementia: meds.some((m) => m.tto === 'antidemencia'),
    anyConcern: polypharmacy || acbHigh || bzdCount > 0 || beersCount > 0,
  }
}
