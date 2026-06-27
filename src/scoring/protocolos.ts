// Protocolos de administración INTERACTIVA: en vez de tipear el puntaje, el evaluador
// puntúa ítem por ítem (steppers / tally / cronómetro) y el bruto se calcula solo. Se mapean
// al catálogo de batería (mismo id → mismo testId/subtest → normas El Castaño).
export type ItemTipo = 'stepper' | 'tally' | 'timer'

export interface ProtocoloItem {
  key: string
  label: string
  tipo: ItemTipo
  max?: number // para stepper
  ayuda?: string
}

export interface Protocolo {
  bateriaId: string // coincide con BATERIA_NPS.id
  nombre: string
  intro?: string
  items: ProtocoloItem[]
  /** calcula el puntaje bruto que va al motor de normas a partir de los valores por ítem. */
  bruto: (v: Record<string, number>) => number
}

const sum = (v: Record<string, number>, keys: string[]) => keys.reduce((a, k) => a + (v[k] ?? 0), 0)

export const PROTOCOLOS: Record<string, Protocolo> = {
  // IFS — INECO Frontal Screening: 8 subtests → /30 (el test más administrado en El Castaño).
  ifs: {
    bateriaId: 'ifs',
    nombre: 'IFS — INECO Frontal Screening',
    intro: 'Puntuá cada subtest; el total /30 se calcula solo.',
    items: [
      { key: 'series', label: 'Series motoras (Luria)', tipo: 'stepper', max: 3 },
      { key: 'instr', label: 'Instrucciones conflictivas', tipo: 'stepper', max: 3 },
      { key: 'gonogo', label: 'Control inhibitorio motor (go/no-go)', tipo: 'stepper', max: 3 },
      { key: 'diginv', label: 'Dígitos inversos', tipo: 'stepper', max: 6 },
      { key: 'wmverbal', label: 'Memoria de trabajo verbal (meses al revés)', tipo: 'stepper', max: 2 },
      { key: 'wmvisual', label: 'Memoria de trabajo visual (Corsi inverso)', tipo: 'stepper', max: 4 },
      { key: 'refranes', label: 'Refranes', tipo: 'stepper', max: 3 },
      { key: 'inhverbal', label: 'Control inhibitorio verbal (Hayling)', tipo: 'stepper', max: 6 },
    ],
    bruto: (v) => sum(v, ['series', 'instr', 'gonogo', 'diginv', 'wmverbal', 'wmvisual', 'refranes', 'inhverbal']),
  },
  // Fluencia semántica (animales) — cronómetro 60 s + contador de palabras válidas.
  flu_sem: {
    bateriaId: 'flu_sem',
    nombre: 'Fluencia semántica (animales)',
    intro: 'Iniciá el cronómetro (60 s) y sumá una por cada palabra válida.',
    items: [
      { key: 'tiempo', label: 'Cronómetro', tipo: 'timer', ayuda: '60 segundos' },
      { key: 'palabras', label: 'Palabras válidas', tipo: 'tally' },
    ],
    bruto: (v) => v.palabras ?? 0,
  },
  // Fluencia fonológica (letra) — ídem.
  flu_fon: {
    bateriaId: 'flu_fon',
    nombre: 'Fluencia fonológica (letra)',
    intro: 'Iniciá el cronómetro (60 s) y sumá una por cada palabra válida (sin nombres propios ni repeticiones).',
    items: [
      { key: 'tiempo', label: 'Cronómetro', tipo: 'timer', ayuda: '60 segundos' },
      { key: 'palabras', label: 'Palabras válidas', tipo: 'tally' },
    ],
    bruto: (v) => v.palabras ?? 0,
  },
}
