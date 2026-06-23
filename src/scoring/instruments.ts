// Instrumentos validados, portados de "Acompañar v0.5" (saludcerebral_mvp/app.html).
// Contenido clínico en español (validado); se traduce a EN por separado tras validar.
// CQC-24 → cqc_total, GDS-15 → gds_total, T-ADLQ-12 → adlq alimentan el modelo MRCA real.
//
// Corrección clínica vs Acompañar: el reverse-scoring del GDS-15 estaba en [1,5,7,11,13]
// (parecía 1-indexado en contexto 0-indexado). Los ítems POSITIVOS reales (satisfecho,
// buen ánimo, feliz, maravilloso estar vivo, lleno de energía) son [0,4,6,10,12].

export interface InstrumentOption {
  label: string
  value: number
}

export interface Instrument {
  id: string
  name: string
  why: string
  options: InstrumentOption[]
  items: string[]
  /** índices (0-based) con puntaje invertido (binario): 1↔0 */
  invert?: number[]
  max: number
  interpret: (score: number) => string
}

export const INSTRUMENTS: Record<string, Instrument> = {
  cqc: {
    id: 'cqc',
    name: 'Quejas cognitivas (CQC-24)',
    why: 'Detalla las quejas de memoria y atención — alimenta el modelo y orienta al especialista.',
    options: [
      { label: 'Nunca', value: 0 },
      { label: 'Casi nunca', value: 1 },
      { label: 'A veces', value: 2 },
      { label: 'Con frecuencia', value: 3 },
      { label: 'Siempre', value: 4 },
    ],
    max: 96,
    items: [
      'Se distrae con facilidad (al leer, mirar TV o conversar).',
      'Necesita más atención o esfuerzo que antes para las tareas.',
      'Pierde el hilo del pensamiento o salta de tema.',
      'Le cuesta hacer más de una cosa a la vez.',
      'Se desorienta en lugares conocidos (su barrio).',
      'Le cuesta encontrar una habitación en su propia casa (ej. el baño).',
      'Se equivoca o duda de la fecha (día, mes, año).',
      'Le cuesta decir con precisión su edad.',
      'Le cuesta tomar decisiones.',
      'Le cuesta organizar planes (ej. una salida).',
      'Le cuesta cambiar de plan cuando hace falta.',
      'Le cuesta seguir los pasos de una tarea (cocinar, vestirse) o deja cosas sin terminar.',
      'Olvida o confunde nombres de personas conocidas.',
      'Olvida citas o planes pautados.',
      'Olvida dónde dejó objetos cotidianos (llaves, anteojos).',
      'No recuerda hechos recientes (qué almorzó, quién llamó).',
      'Le cuesta vestirse (no por lo motriz; ej. botones).',
      'Le cuesta dibujar o copiar dibujos.',
      'Le cuesta reconocer objetos o personas conocidas.',
      'Le cuesta encontrar objetos fuera de su lugar habitual.',
      'Le cuesta encontrar la palabra correcta.',
      'Le cuesta escribir o empeoró su letra.',
      'Le cuesta entender lo que otros dicen.',
      'Le cuesta entender lo que lee.',
    ],
    interpret: (s) => `${s}/96 (a más puntaje, más quejas)`,
  },
  gds: {
    id: 'gds',
    name: 'Ánimo (GDS-15)',
    why: 'La depresión imita y empeora la memoria, y es tratable: detectarla cambia el plan.',
    options: [
      { label: 'Sí', value: 1 },
      { label: 'No', value: 0 },
    ],
    invert: [0, 4, 6, 10, 12],
    max: 15,
    items: [
      '¿Está básicamente satisfecho/a con su vida?',
      '¿Dejó muchas actividades e intereses?',
      '¿Siente que su vida está vacía?',
      '¿Se aburre seguido?',
      '¿Está de buen ánimo la mayor parte del tiempo?',
      '¿Teme que algo malo le va a pasar?',
      '¿Se siente feliz la mayor parte del tiempo?',
      '¿Se siente con frecuencia desamparado/a?',
      '¿Prefiere quedarse en casa antes que salir?',
      '¿Siente más problemas de memoria que la mayoría?',
      '¿Cree que es maravilloso estar vivo/a?',
      '¿Se siente inútil tal como está ahora?',
      '¿Se siente lleno/a de energía?',
      '¿Siente que su situación es desesperada?',
      '¿Cree que la mayoría está mejor que usted?',
    ],
    interpret: (s) => (s >= 5 ? `${s}/15 — ≥5: posible depresión` : `${s}/15 — sin indicios`),
  },
  gad: {
    id: 'gad',
    name: 'Ansiedad (GAD-7)',
    why: 'La ansiedad confunde el cuadro y también es tratable.',
    options: [
      { label: 'Nunca', value: 0 },
      { label: 'Varios días', value: 1 },
      { label: 'Más de la mitad', value: 2 },
      { label: 'Casi todos los días', value: 3 },
    ],
    max: 21,
    items: [
      'Sentirse nervioso/a, ansioso/a o al límite',
      'No poder dejar de preocuparse',
      'Preocuparse demasiado por distintas cosas',
      'Dificultad para relajarse',
      'Estar tan inquieto/a que cuesta quedarse quieto/a',
      'Irritarse o enojarse con facilidad',
      'Sentir miedo como si algo terrible fuera a pasar',
    ],
    interpret: (s) => (s >= 10 ? `${s}/21 — ≥10: ansiedad probable` : s >= 5 ? `${s}/21 — leve` : `${s}/21 — mínima`),
  },
  ucla: {
    id: 'ucla',
    name: 'Soledad (UCLA-3)',
    why: 'La soledad es factor de riesgo modificable de deterioro.',
    options: [
      { label: 'Casi nunca', value: 1 },
      { label: 'A veces', value: 2 },
      { label: 'A menudo', value: 3 },
    ],
    max: 9,
    items: [
      '¿Con qué frecuencia siente que le falta compañía?',
      '¿Con qué frecuencia se siente excluido/a o dejado/a de lado?',
      '¿Con qué frecuencia se siente aislado/a de los demás?',
    ],
    interpret: (s) => (s >= 6 ? `${s}/9 — soledad alta` : `${s}/9 — baja`),
  },
  ad8: {
    id: 'ad8',
    name: 'AD8 (informante)',
    why: '8 preguntas al familiar sobre cambios — corrige el sub-reporte de la persona.',
    options: [
      { label: 'Sí, hubo un cambio', value: 1 },
      { label: 'No / no sé', value: 0 },
    ],
    max: 8,
    items: [
      'Problemas de juicio (decisiones, cae en estafas, regalos inapropiados).',
      'Menos interés en pasatiempos o actividades.',
      'Repite las mismas preguntas, historias o frases.',
      'Le cuesta aprender a usar algo nuevo (un aparato, electrodoméstico).',
      'Olvida el mes o el año en curso.',
      'Le cuesta manejar el dinero (cuentas, pagos).',
      'Le cuesta recordar citas o compromisos.',
      'Problemas de memoria o pensamiento todos los días.',
    ],
    interpret: (s) => (s >= 2 ? `${s}/8 — ≥2: sugiere evaluar` : `${s}/8 — sin indicios`),
  },
  tadlq: {
    id: 'tadlq',
    name: 'Funcionalidad (T-ADLQ-12)',
    why: 'Cuánto afecta el día a día — lo que separa una queja de un deterioro que importa.',
    options: [
      { label: 'Sin problema', value: 0 },
      { label: 'Le cuesta / lento', value: 1 },
      { label: 'Necesita ayuda', value: 2 },
      { label: 'No puede / depende', value: 3 },
    ],
    max: 36,
    items: [
      'Comer',
      'Vestirse',
      'Bañarse / higiene',
      'Tomar la medicación a tiempo',
      'Cocinar / preparar comidas',
      'Tareas del hogar',
      'Manejar el dinero / pagar cuentas',
      'Hacer las compras',
      'Usar transporte / salir del barrio',
      'Usar el teléfono',
      'Leer o escribir',
      'Recordar y cumplir citas',
    ],
    interpret: (s) => `${s}/36 (a más puntaje, más dependencia)`,
  },
  iqcode: {
    id: 'iqcode',
    name: 'IQCODE (informante)',
    why: 'El familiar compara cómo está la persona AHORA respecto a hace 10 años. Corrige el sub-reporte.',
    options: [
      { label: 'Mucho mejor', value: 1 },
      { label: 'Un poco mejor', value: 2 },
      { label: 'Sin cambios', value: 3 },
      { label: 'Un poco peor', value: 4 },
      { label: 'Mucho peor', value: 5 },
    ],
    max: 80,
    items: [
      'Reconocer las caras de familiares y amigos',
      'Recordar los nombres de familiares y amigos',
      'Recordar cosas de familiares y amigos (ocupación, cumpleaños, dirección)',
      'Recordar cosas que pasaron hace poco',
      'Recordar conversaciones de unos días atrás',
      'Recordar su dirección y su teléfono',
      'Recordar en qué día y mes estamos',
      'Recordar dónde se guardan habitualmente las cosas',
      'Encontrar las cosas en el lugar donde las dejó',
      'Adaptarse a cambios en la rutina diaria',
      'Manejar aparatos de la casa',
      'Aprender a usar un aparato o máquina nueva',
      'Recordar cosas que aprendió hace poco',
      'Comprender artículos del diario o revistas',
      'Manejar el dinero para las compras',
      'Manejar asuntos de plata (jubilación, banco, cuentas)',
    ],
    interpret: (s) => {
      const m = s / 16
      return `${m.toFixed(2)} de 5 — ${m >= 3.4 ? '≥3,4: sugiere declive' : 'sin indicios'}`
    },
  },
  faq: {
    id: 'faq',
    name: 'Funcionalidad — FAQ (informante)',
    why: 'El familiar indica cuánto puede hacer la persona sola en la vida diaria. Lo que separa una queja de un deterioro que importa.',
    options: [
      { label: 'Sin dificultad', value: 0 },
      { label: 'Con dificultad, solo/a', value: 1 },
      { label: 'Necesita ayuda', value: 2 },
      { label: 'No puede / depende', value: 3 },
    ],
    max: 30,
    items: [
      'Manejar dinero, cuentas o chequera',
      'Hacer las compras solo/a (comida, ropa)',
      'Calentar agua o comida y apagar la hornalla',
      'Preparar una comida',
      'Estar al tanto de las noticias o lo que pasa',
      'Prestar atención y entender un programa, libro o revista',
      'Recordar citas, fechas, medicación o eventos familiares',
      'Manejar su medicación (dosis correcta y a horario)',
      'Salir del barrio o usar transporte',
      'Quedarse solo/a en casa de forma segura',
    ],
    interpret: (s) => `${s}/30 — ${s >= 9 ? '≥9: sugiere deterioro funcional' : 'sin indicios'}`,
  },
}

export interface InstrumentScore {
  score: number
  answered: number
  text: string
}

export function scoreInstrument(inst: Instrument, answers: Record<number, number>): InstrumentScore {
  let score = 0
  let answered = 0
  inst.items.forEach((_, i) => {
    const v = answers[i]
    if (v != null) {
      answered++
      const val = inst.invert?.includes(i) ? (v ? 0 : 1) : v
      score += val
    }
  })
  return { score, answered, text: inst.interpret(score) }
}
