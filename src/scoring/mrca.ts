// Ítems de queja cognitiva / cambio de memoria (7). Alimentan, como proxy de queja
// (cqc_total), el modelo real Kaizen-MRCA (ver src/scoring/mrcaModel.ts).
export const MRCA_ITEMS = [
  'recent',
  'repeat',
  'words',
  'orientation',
  'help',
  'slow',
  'informant',
] as const

export type MrcaItemId = (typeof MRCA_ITEMS)[number]
