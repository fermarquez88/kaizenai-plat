// Protocolos de administración INTERACTIVA (estilo NeuroMentia / El Castaño): en vez de
// tipear el bruto final, la neuropsicóloga puntúa ítem por ítem (steppers / tally / número /
// cronómetro) y el/los bruto(s) se calculan solos. Cada protocolo puede producir VARIAS
// salidas (bateriaId → bruto) desde una sola administración; luego el motor de normas las
// normaliza por edad/educación/sexo. Salidas especiales: 'ace' y 'mmse' (cribado global).
export type ItemTipo = 'stepper' | 'tally' | 'timer' | 'num'

export interface ProtocoloItem {
  key: string
  label: string
  tipo: ItemTipo
  max?: number // stepper: cantidad de botones 0..max; num: tope sugerido
  ayuda?: string
}

export interface Protocolo {
  id: string
  nombre: string
  dominio: string
  intro?: string
  items: ProtocoloItem[]
  /** salidas que produce (bateriaId, o 'ace'/'mmse'), para mostrar qué completa. */
  salidas: string[]
  /** calcula los bruto(s) a partir de los valores por ítem: bateriaId → bruto. */
  bruto: (v: Record<string, number>) => Record<string, number>
}

const sum = (v: Record<string, number>, keys: string[]) => keys.reduce((a, k) => a + (v[k] ?? 0), 0)

export const PROTOCOLOS: Record<string, Protocolo> = {
  // IFS — INECO Frontal Screening: 8 subtests → /30 (el más administrado en El Castaño).
  ifs: {
    id: 'ifs',
    nombre: 'IFS — INECO Frontal Screening',
    dominio: 'Funciones ejecutivas',
    intro: 'Puntuá cada subtest; el total /30 se calcula solo.',
    salidas: ['ifs'],
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
    bruto: (v) => ({ ifs: sum(v, ['series', 'instr', 'gonogo', 'diginv', 'wmverbal', 'wmvisual', 'refranes', 'inhverbal']) }),
  },

  // Lista de Rey (RAVLT) — 5 ensayos + distractora + diferido + reconocimiento (aciertos y FP).
  ravlt: {
    id: 'ravlt',
    nombre: 'Lista de Rey (RAVLT)',
    dominio: 'Memoria verbal',
    intro: 'Contá las palabras recordadas en cada ensayo (0–15). El total y el reconocimiento corregido se calculan solos.',
    salidas: ['ravlt_inm', 'ravlt_dif', 'ravlt_rec'],
    items: [
      { key: 't1', label: 'Ensayo 1', tipo: 'tally' },
      { key: 't2', label: 'Ensayo 2', tipo: 'tally' },
      { key: 't3', label: 'Ensayo 3', tipo: 'tally' },
      { key: 't4', label: 'Ensayo 4', tipo: 'tally' },
      { key: 't5', label: 'Ensayo 5', tipo: 'tally' },
      { key: 'dif', label: 'Recuerdo diferido', tipo: 'tally', ayuda: '0–15' },
      { key: 'recHits', label: 'Reconocimiento — aciertos', tipo: 'tally', ayuda: '0–15' },
      { key: 'recFp', label: 'Reconocimiento — falsos positivos', tipo: 'tally' },
    ],
    bruto: (v) => ({
      ravlt_inm: sum(v, ['t1', 't2', 't3', 't4', 't5']),
      ravlt_dif: v.dif ?? 0,
      ravlt_rec: Math.max(0, (v.recHits ?? 0) - (v.recFp ?? 0)),
    }),
  },

  // Dígitos — amplitud (span) directo e inverso.
  digitos: {
    id: 'digitos',
    nombre: 'Dígitos (amplitud)',
    dominio: 'Atención y memoria de trabajo',
    intro: 'Marcá la amplitud máxima correcta en cada dirección.',
    salidas: ['dig_dir', 'dig_inv'],
    items: [
      { key: 'directo', label: 'Directo (adelante) — amplitud', tipo: 'stepper', max: 9 },
      { key: 'inverso', label: 'Inverso (atrás) — amplitud', tipo: 'stepper', max: 8 },
    ],
    bruto: (v) => ({ dig_dir: v.directo ?? 0, dig_inv: v.inverso ?? 0 }),
  },

  // TMT — tiempo en segundos (cronómetro) para A y B.
  tmt: {
    id: 'tmt',
    nombre: 'Trail Making Test (A y B)',
    dominio: 'Funciones ejecutivas / velocidad',
    intro: 'Cronometrá cada parte (en segundos).',
    salidas: ['tmt_a', 'tmt_b'],
    items: [
      { key: 'a', label: 'TMT-A', tipo: 'timer' },
      { key: 'b', label: 'TMT-B', tipo: 'timer' },
    ],
    bruto: (v) => ({ tmt_a: v.a ?? 0, tmt_b: v.b ?? 0 }),
  },

  // Fluencia semántica (animales) — cronómetro 60 s + contador.
  flu_sem: {
    id: 'flu_sem',
    nombre: 'Fluencia semántica (animales)',
    dominio: 'Lenguaje',
    intro: 'Cronómetro 60 s; sumá una por cada palabra válida.',
    salidas: ['flu_sem'],
    items: [
      { key: 'tiempo', label: 'Cronómetro', tipo: 'timer', ayuda: '60 s' },
      { key: 'palabras', label: 'Palabras válidas', tipo: 'tally' },
    ],
    bruto: (v) => ({ flu_sem: v.palabras ?? 0 }),
  },

  // Fluencia fonológica (letra) — ídem.
  flu_fon: {
    id: 'flu_fon',
    nombre: 'Fluencia fonológica (letra)',
    dominio: 'Funciones ejecutivas',
    intro: 'Cronómetro 60 s; sumá una por palabra válida (sin nombres propios ni repeticiones).',
    salidas: ['flu_fon'],
    items: [
      { key: 'tiempo', label: 'Cronómetro', tipo: 'timer', ayuda: '60 s' },
      { key: 'palabras', label: 'Palabras válidas', tipo: 'tally' },
    ],
    bruto: (v) => ({ flu_fon: v.palabras ?? 0 }),
  },

  // Memoria de Relatos — inmediato y diferido (unidades recordadas).
  relatos: {
    id: 'relatos',
    nombre: 'Memoria de Relatos',
    dominio: 'Memoria verbal',
    intro: 'Cargá las unidades recordadas.',
    salidas: ['relatos_inm', 'relatos_dif'],
    items: [
      { key: 'inm', label: 'Inmediato', tipo: 'num', max: 25 },
      { key: 'dif', label: 'Diferido', tipo: 'num', max: 25 },
    ],
    bruto: (v) => ({ relatos_inm: v.inm ?? 0, relatos_dif: v.dif ?? 0 }),
  },

  // Figura de Rey (ROCF) — copia, inmediato, diferido, reconocimiento (0–36).
  rocf: {
    id: 'rocf',
    nombre: 'Figura de Rey (ROCF)',
    dominio: 'Memoria visual / visuoespacial',
    intro: 'Cargá el puntaje de cada condición (0–36).',
    salidas: ['rocf_copia', 'rocf_inm', 'rocf_dif', 'rocf_rec'],
    items: [
      { key: 'copia', label: 'Copia', tipo: 'num', max: 36 },
      { key: 'inm', label: 'Inmediato (recuerdo)', tipo: 'num', max: 36 },
      { key: 'dif', label: 'Diferido (recuerdo)', tipo: 'num', max: 36 },
      { key: 'rec', label: 'Reconocimiento', tipo: 'num', max: 24 },
    ],
    bruto: (v) => ({ rocf_copia: v.copia ?? 0, rocf_inm: v.inm ?? 0, rocf_dif: v.dif ?? 0, rocf_rec: v.rec ?? 0 }),
  },

  // ACE-III — 5 subdominios → /100 (cribado global).
  ace: {
    id: 'ace',
    nombre: 'ACE-III',
    dominio: 'Cribado global',
    intro: 'Cargá cada subdominio; el total /100 se calcula solo.',
    salidas: ['ace'],
    items: [
      { key: 'atencion', label: 'Atención', tipo: 'num', max: 18 },
      { key: 'memoria', label: 'Memoria', tipo: 'num', max: 26 },
      { key: 'fluencia', label: 'Fluencias', tipo: 'num', max: 14 },
      { key: 'lenguaje', label: 'Lenguaje', tipo: 'num', max: 26 },
      { key: 'visuoespacial', label: 'Visuoespacial', tipo: 'num', max: 16 },
    ],
    bruto: (v) => ({ ace: sum(v, ['atencion', 'memoria', 'fluencia', 'lenguaje', 'visuoespacial']) }),
  },

  // MMSE — subtotales → /30 (cribado global).
  mmse: {
    id: 'mmse',
    nombre: 'Mini-Mental (MMSE)',
    dominio: 'Cribado global',
    intro: 'Cargá cada bloque; el total /30 se calcula solo.',
    salidas: ['mmse'],
    items: [
      { key: 'orientacion', label: 'Orientación', tipo: 'num', max: 10 },
      { key: 'registro', label: 'Registro / fijación', tipo: 'num', max: 3 },
      { key: 'atencion', label: 'Atención y cálculo', tipo: 'num', max: 5 },
      { key: 'recuerdo', label: 'Recuerdo diferido', tipo: 'num', max: 3 },
      { key: 'lenguaje', label: 'Lenguaje y praxias', tipo: 'num', max: 9 },
    ],
    bruto: (v) => ({ mmse: sum(v, ['orientacion', 'registro', 'atencion', 'recuerdo', 'lenguaje']) }),
  },
}

export const PROTOCOLO_IDS = Object.keys(PROTOCOLOS)
