// Catálogo de medicación + flags de polifarmacia. ⚠️ ILUSTRATIVO / PLACEHOLDER:
// los puntajes ACB y las marcas Beers son orientativos y requieren validación
// clínica. No prescribe ni sustituye criterio profesional; solo señala para revisión.
//
// acb  = Anticholinergic Cognitive Burden (0–3)
// bzd  = benzodiacepina o Z-drug
// beers = potencialmente inapropiada en adultos mayores (criterios Beers/STOPP)

export interface DrugInfo {
  id: string
  name: string
  acb: 0 | 1 | 2 | 3
  bzd?: boolean
  beers?: boolean
}

export const DRUG_CATALOG: DrugInfo[] = [
  // Anticolinérgicos fuertes (ACB 3)
  { id: 'amitriptilina', name: 'Amitriptilina', acb: 3, beers: true },
  { id: 'clomipramina', name: 'Clomipramina', acb: 3, beers: true },
  { id: 'imipramina', name: 'Imipramina', acb: 3, beers: true },
  { id: 'clorpromazina', name: 'Clorpromazina', acb: 3, beers: true },
  { id: 'difenhidramina', name: 'Difenhidramina', acb: 3, beers: true },
  { id: 'dimenhidrinato', name: 'Dimenhidrinato', acb: 3, beers: true },
  { id: 'hidroxizina', name: 'Hidroxizina', acb: 3, beers: true },
  { id: 'prometazina', name: 'Prometazina', acb: 3, beers: true },
  { id: 'oxibutinina', name: 'Oxibutinina', acb: 3, beers: true },
  { id: 'clozapina', name: 'Clozapina', acb: 3 },
  { id: 'paroxetina', name: 'Paroxetina', acb: 3, beers: true },
  { id: 'biperideno', name: 'Biperideno', acb: 3, beers: true },
  // ACB 2
  { id: 'carbamazepina', name: 'Carbamazepina', acb: 2 },
  { id: 'ciproheptadina', name: 'Ciproheptadina', acb: 2, beers: true },
  { id: 'amantadina', name: 'Amantadina', acb: 2 },
  // ACB 1
  { id: 'trazodona', name: 'Trazodona', acb: 1 },
  { id: 'risperidona', name: 'Risperidona', acb: 1, beers: true },
  { id: 'haloperidol', name: 'Haloperidol', acb: 1, beers: true },
  { id: 'quetiapina', name: 'Quetiapina', acb: 1, beers: true },
  { id: 'olanzapina', name: 'Olanzapina', acb: 1, beers: true },
  { id: 'digoxina', name: 'Digoxina', acb: 1, beers: true },
  { id: 'furosemida', name: 'Furosemida', acb: 1 },
  { id: 'codeina', name: 'Codeína', acb: 1 },
  { id: 'metoclopramida', name: 'Metoclopramida', acb: 1, beers: true },
  { id: 'ranitidina', name: 'Ranitidina', acb: 1 },
  { id: 'mirtazapina', name: 'Mirtazapina', acb: 1 },
  { id: 'prednisona', name: 'Prednisona', acb: 1 },
  // Benzodiacepinas / Z-drugs (potencialmente inapropiadas en mayores)
  { id: 'diazepam', name: 'Diazepam', acb: 0, bzd: true, beers: true },
  { id: 'clonazepam', name: 'Clonazepam', acb: 0, bzd: true, beers: true },
  { id: 'lorazepam', name: 'Lorazepam', acb: 0, bzd: true, beers: true },
  { id: 'alprazolam', name: 'Alprazolam', acb: 0, bzd: true, beers: true },
  { id: 'bromazepam', name: 'Bromazepam', acb: 0, bzd: true, beers: true },
  { id: 'clobazam', name: 'Clobazam', acb: 0, bzd: true, beers: true },
  { id: 'zolpidem', name: 'Zolpidem', acb: 0, bzd: true, beers: true },
  { id: 'zopiclona', name: 'Zopiclona', acb: 0, bzd: true, beers: true },
  // Otras potencialmente inapropiadas
  { id: 'glibenclamida', name: 'Glibenclamida', acb: 0, beers: true },
  { id: 'ibuprofeno', name: 'Ibuprofeno', acb: 0, beers: true },
  { id: 'ketorolaco', name: 'Ketorolaco', acb: 0, beers: true },
  // Frecuentes sin flag anticolinérgico/BZD
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
  { id: 'donepecilo', name: 'Donepecilo', acb: 0 },
  { id: 'memantina', name: 'Memantina', acb: 0 },
]

export interface MedFlags {
  count: number
  polypharmacy: boolean
  acbTotal: number
  acbHigh: boolean
  bzdCount: number
  beersCount: number
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
    anyConcern: polypharmacy || acbHigh || bzdCount > 0 || beersCount > 0,
  }
}
