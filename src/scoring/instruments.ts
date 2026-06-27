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
  /** opciones POR ÍTEM (override de `options`) para instrumentos heterogéneos (p.ej. MIND:
   * cada alimento tiene su propio umbral de frecuencia → 0 / 0,5 / 1). */
  itemOptions?: InstrumentOption[][]
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
  // Sueño (M11). ISI-7 = Insomnia Severity Index (Morin/Bastien): 7 ítems 0-4, total 0-28.
  // Cortes estándar: 0-7 sin insomnio · 8-14 subclínico · 15-21 moderado · 22-28 grave.
  isi: {
    id: 'isi',
    name: 'Insomnio (ISI-7)',
    why: 'El sueño afecta y empeora la memoria y el ánimo; el insomnio es modificable y tratable.',
    options: [
      { label: 'Ninguno', value: 0 },
      { label: 'Leve', value: 1 },
      { label: 'Moderado', value: 2 },
      { label: 'Grave', value: 3 },
      { label: 'Muy grave', value: 4 },
    ],
    max: 28,
    items: [
      'Dificultad para quedarse dormido/a',
      'Dificultad para mantenerse dormido/a (se despierta durante la noche)',
      'Despertarse demasiado temprano',
      'Insatisfacción con su sueño actual',
      'Cuánto interfiere su sueño con su vida diaria (energía, ánimo, tareas)',
      'Cuánto nota un deterioro en su calidad de vida por el sueño',
      'Cuánta preocupación le genera su problema de sueño',
    ],
    interpret: (s) =>
      s >= 22
        ? `${s}/28 — insomnio grave`
        : s >= 15
          ? `${s}/28 — insomnio moderado`
          : s >= 8
            ? `${s}/28 — insomnio subclínico`
            : `${s}/28 — sin insomnio clínico`,
  },

  // Dieta MIND (Morris 2015) — 15 componentes, 0 / 0,5 / 1 → total 0-15. Mayor = más protector.
  // Umbrales de frecuencia estándar de la fuente; opciones POR ÍTEM (cada alimento su corte).
  // ⚠️ Umbrales a VALIDAR contra la fuente antes de uso clínico (SPEC: scoring = placeholder).
  mind: {
    id: 'mind',
    name: 'Alimentación (MIND)',
    why: 'El patrón de alimentación MIND se asocia a mejor salud cerebral; es modificable.',
    options: [],
    items: [
      'Verduras de hoja verde (espinaca, acelga, lechuga)',
      'Otras verduras',
      'Frutos rojos (arándanos, frutillas)',
      'Frutos secos (nueces, almendras)',
      'Aceite de oliva como aceite principal',
      'Cereales integrales',
      'Pescado (no frito)',
      'Legumbres (porotos, lentejas, garbanzos)',
      'Aves (pollo, pavo)',
      'Vino',
      'Carnes rojas y embutidos',
      'Manteca / margarina',
      'Quesos',
      'Frituras / comida rápida',
      'Dulces y pasteles',
    ],
    itemOptions: [
      [{ label: '≤2 por semana', value: 0 }, { label: '3-5 por semana', value: 0.5 }, { label: '≥6 por semana', value: 1 }],
      [{ label: '<5 por semana', value: 0 }, { label: '5-6 por semana', value: 0.5 }, { label: '≥1 por día', value: 1 }],
      [{ label: '<1 por semana', value: 0 }, { label: '1 por semana', value: 0.5 }, { label: '≥2 por semana', value: 1 }],
      [{ label: '<1 por mes', value: 0 }, { label: '1/mes a 4/semana', value: 0.5 }, { label: '≥5 por semana', value: 1 }],
      [{ label: 'No', value: 0 }, { label: 'Sí, es el principal', value: 1 }],
      [{ label: '<1 por día', value: 0 }, { label: '1-2 por día', value: 0.5 }, { label: '≥3 por día', value: 1 }],
      [{ label: 'Casi nunca', value: 0 }, { label: '1-3 por mes', value: 0.5 }, { label: '≥1 por semana', value: 1 }],
      [{ label: '<1 por semana', value: 0 }, { label: '1-3 por semana', value: 0.5 }, { label: '>3 por semana', value: 1 }],
      [{ label: '<1 por semana', value: 0 }, { label: '1 por semana', value: 0.5 }, { label: '≥2 por semana', value: 1 }],
      [{ label: 'Nada o más de 1 copa/día', value: 0 }, { label: '1 copa por día', value: 1 }],
      [{ label: '≥7 por semana', value: 0 }, { label: '4-6 por semana', value: 0.5 }, { label: '<4 por semana', value: 1 }],
      [{ label: '>2 cdas por día', value: 0 }, { label: '1-2 cdas por día', value: 0.5 }, { label: '<1 cda por día', value: 1 }],
      [{ label: '≥7 por semana', value: 0 }, { label: '1-6 por semana', value: 0.5 }, { label: '<1 por semana', value: 1 }],
      [{ label: '≥4 por semana', value: 0 }, { label: '1-3 por semana', value: 0.5 }, { label: '<1 por semana', value: 1 }],
      [{ label: '≥7 por semana', value: 0 }, { label: '5-6 por semana', value: 0.5 }, { label: '<5 por semana', value: 1 }],
    ],
    max: 15,
    interpret: (s) =>
      s >= 9
        ? `${s}/15 — patrón MIND alto (protector)`
        : s >= 6.5
          ? `${s}/15 — patrón MIND intermedio`
          : `${s}/15 — patrón MIND bajo (a mejorar)`,
  },

  // Alcohol — AUDIT-C (3 ítems, 0-12). Opciones por ítem. Corte de riesgo ≥4 (≥3 en mujeres).
  // Factor modificable Lancet 2024; en San Juan rural el consumo es culturalmente alto.
  auditc: {
    id: 'auditc',
    name: 'Consumo de alcohol (AUDIT-C)',
    why: 'El alcohol es un factor de riesgo modificable de deterioro; detectarlo cambia el consejo.',
    options: [],
    items: [
      '¿Con qué frecuencia tomás alguna bebida con alcohol?',
      'Un día típico que tomás, ¿cuántos tragos tomás?',
      '¿Con qué frecuencia tomás 6 o más tragos en una misma ocasión?',
    ],
    itemOptions: [
      [{ label: 'Nunca', value: 0 }, { label: 'Una vez al mes o menos', value: 1 }, { label: '2-4 veces al mes', value: 2 }, { label: '2-3 veces por semana', value: 3 }, { label: '4 o más por semana', value: 4 }],
      [{ label: '1 o 2', value: 0 }, { label: '3 o 4', value: 1 }, { label: '5 o 6', value: 2 }, { label: '7 a 9', value: 3 }, { label: '10 o más', value: 4 }],
      [{ label: 'Nunca', value: 0 }, { label: 'Menos de 1 vez al mes', value: 1 }, { label: 'Mensualmente', value: 2 }, { label: 'Semanalmente', value: 3 }, { label: 'A diario o casi', value: 4 }],
    ],
    max: 12,
    interpret: (s) => (s >= 4 ? `${s}/12 — consumo de riesgo` : `${s}/12 — bajo riesgo`),
  },

  // Fragilidad — FRAIL (Morley, 5 ítems sí/no, 0-5). ≥3 fragilidad · 1-2 prefragilidad.
  frail: {
    id: 'frail',
    name: 'Fragilidad (FRAIL)',
    why: 'La fragilidad predice caídas, hospitalización y deterioro; es prevenible y reversible.',
    options: [
      { label: 'Sí', value: 1 },
      { label: 'No', value: 0 },
    ],
    max: 5,
    items: [
      '¿Se siente cansado/a la mayor parte del tiempo?',
      '¿Le cuesta subir un piso por escalera?',
      '¿Le cuesta caminar una cuadra?',
      '¿Tiene más de 5 enfermedades?',
      '¿Perdió peso sin querer (más del 5%) en el último año?',
    ],
    interpret: (s) => (s >= 3 ? `${s}/5 — fragilidad` : s >= 1 ? `${s}/5 — prefragilidad` : `${s}/5 — robusto/a`),
  },

  // Nutrición — MNA-SF (6 ítems, 0-14). ≥12 normal · 8-11 riesgo · ≤7 malnutrición. Opciones por ítem.
  mnasf: {
    id: 'mnasf',
    name: 'Estado nutricional (MNA-SF)',
    why: 'La desnutrición acelera el deterioro y es frecuente y tratable en personas mayores.',
    options: [],
    items: [
      'En los últimos 3 meses, ¿comió menos por falta de apetito, problemas para masticar o tragar?',
      '¿Perdió peso en los últimos 3 meses?',
      '¿Cómo es su movilidad?',
      '¿Tuvo estrés fuerte o una enfermedad aguda en los últimos 3 meses?',
      '¿Tiene problemas de memoria o de ánimo?',
      'Su contextura / peso para la altura es…',
    ],
    itemOptions: [
      [{ label: 'Comió mucho menos', value: 0 }, { label: 'Comió algo menos', value: 1 }, { label: 'Sin cambios', value: 2 }],
      [{ label: 'Más de 3 kg', value: 0 }, { label: 'No sabe', value: 1 }, { label: 'Entre 1 y 3 kg', value: 2 }, { label: 'Sin pérdida', value: 3 }],
      [{ label: 'En cama o silla', value: 0 }, { label: 'Se levanta pero no sale', value: 1 }, { label: 'Sale normalmente', value: 2 }],
      [{ label: 'Sí', value: 0 }, { label: 'No', value: 2 }],
      [{ label: 'Problemas importantes', value: 0 }, { label: 'Problemas leves', value: 1 }, { label: 'Sin problemas', value: 2 }],
      [{ label: 'Muy delgado/a', value: 0 }, { label: 'Algo delgado/a', value: 1 }, { label: 'Normal', value: 2 }, { label: 'Contextura grande', value: 3 }],
    ],
    max: 14,
    interpret: (s) => (s >= 12 ? `${s}/14 — estado normal` : s >= 8 ? `${s}/14 — riesgo nutricional` : `${s}/14 — malnutrición`),
  },

  // ── Escalas del CUIDADOR (portadas fielmente de kaizen-cuidadores / guia-cuidadores-web) ──
  // Ánimo del cuidador — PHQ-9 (9 ítems, 0-3, máx 27). Cortes 5/10/15/20.
  phq9: {
    id: 'phq9',
    name: 'Ánimo del cuidador (PHQ-9)',
    why: 'La depresión del cuidador es frecuente, imita el agotamiento y es tratable; detectarla cambia el cuidado.',
    options: [
      { label: 'Ningún día', value: 0 },
      { label: 'Varios días', value: 1 },
      { label: 'Más de la mitad', value: 2 },
      { label: 'Casi todos los días', value: 3 },
    ],
    max: 27,
    items: [
      'Poco interés o placer en hacer cosas',
      'Se ha sentido decaído/a, deprimido/a o sin esperanzas',
      'Dificultad para dormir, o ha dormido demasiado',
      'Se ha sentido cansado/a o con poca energía',
      'Sin apetito o ha comido en exceso',
      'Se ha sentido mal con usted mismo/a (un fracaso o que ha quedado mal con su familia)',
      'Dificultad para concentrarse (leer, ver televisión)',
      'Se ha movido o hablado muy lento, o al revés, muy inquieto/a',
      'Pensamientos de que estaría mejor muerto/a o de lastimarse de alguna manera',
    ],
    interpret: (s) =>
      s >= 20 ? `${s}/27 — depresión grave` : s >= 15 ? `${s}/27 — moderada-grave` : s >= 10 ? `${s}/27 — moderada` : s >= 5 ? `${s}/27 — leve` : `${s}/27 — mínima`,
  },

  // Autoeficacia del cuidador (10 ítems, 0/25/50/75/100). Mayor = más confianza → menos sobrecarga.
  autoeficacia: {
    id: 'autoeficacia',
    name: 'Autoeficacia del cuidador',
    why: 'La confianza para pedir ayuda y manejar la situación predice (y protege de) la sobrecarga.',
    options: [
      { label: 'Nada', value: 0 },
      { label: 'Poco', value: 25 },
      { label: 'Más o menos', value: 50 },
      { label: 'Bastante', value: 75 },
      { label: 'Seguro/a', value: 100 },
    ],
    max: 1000,
    items: [
      'Pedir a alguien que se quede con su familiar mientras usted descansa',
      'Pedir a alguien que le haga un trámite o mandado',
      'Pedir a alguien que se quede todo un día con su familiar',
      'Pedir ayuda para tomarse una semana para usted',
      'Responder a una pregunta repetida sin levantar la voz',
      'Calmarse cuando su familiar repite lo mismo una y otra vez',
      'Responder a las quejas sin discutir',
      'Controlar el pensamiento de tristeza por el cuidado',
      'Controlar el pensamiento de que la situación es injusta',
      'Controlar la preocupación por el futuro',
    ],
    interpret: (s) => {
      const m = Math.round(s / 10)
      return m >= 75 ? `${m}/100 — autoeficacia alta` : m >= 50 ? `${m}/100 — media` : `${m}/100 — baja (más riesgo de sobrecarga)`
    },
  },

  // Apoyo social percibido — Duke-UNC (11 ítems, 1-5, máx 55). <32 = apoyo bajo.
  apoyoSocial: {
    id: 'apoyoSocial',
    name: 'Apoyo social del cuidador (Duke-UNC)',
    why: 'El aislamiento del cuidador aumenta la sobrecarga; el apoyo social protege.',
    options: [
      { label: 'Mucho menos de lo que deseo', value: 1 },
      { label: 'Menos de lo que deseo', value: 2 },
      { label: 'Ni mucho ni poco', value: 3 },
      { label: 'Casi como deseo', value: 4 },
      { label: 'Tanto como deseo', value: 5 },
    ],
    max: 55,
    items: [
      'Recibo visitas de mis amigos y familiares',
      'Recibo ayuda en asuntos relacionados con mi casa',
      'Recibo elogios y reconocimientos cuando hago bien las cosas',
      'Cuento con personas que se preocupan de lo que me sucede',
      'Recibo amor y afecto',
      'Puedo hablar con alguien de mis problemas del trabajo o de la casa',
      'Puedo hablar con alguien de mis problemas personales y familiares',
      'Puedo hablar con alguien de mis problemas económicos',
      'Recibo invitaciones para distraerme y salir',
      'Recibo consejos útiles cuando me pasa algo importante',
      'Recibo ayuda cuando estoy enfermo/a en la cama',
    ],
    interpret: (s) => (s < 32 ? `${s}/55 — apoyo social bajo` : `${s}/55 — apoyo social adecuado`),
  },

  // Aspectos positivos del cuidar — PAC (9 ítems, 1-5, máx 45). Mayor = más sentido/protección.
  pac: {
    id: 'pac',
    name: 'Aspectos positivos del cuidar (PAC)',
    why: 'Reconocer lo que el cuidar también aporta protege frente a la sobrecarga y la depresión.',
    options: [
      { label: 'Muy en desacuerdo', value: 1 },
      { label: 'Algo en desacuerdo', value: 2 },
      { label: 'Ni de acuerdo ni en desacuerdo', value: 3 },
      { label: 'Algo de acuerdo', value: 4 },
      { label: 'Muy de acuerdo', value: 5 },
    ],
    max: 45,
    items: [
      'Cuidar a mi familiar me ha hecho sentir más útil',
      'Cuidar a mi familiar me ha hecho sentir bien conmigo mismo/a',
      'Cuidar a mi familiar me ha hecho sentir necesitado/a',
      'Cuidar a mi familiar me ha hecho sentir valorado/a',
      'Cuidar a mi familiar me ha hecho sentir importante',
      'Cuidar a mi familiar me ha hecho sentir fuerte y con confianza',
      'Cuidar a mi familiar me ha permitido apreciar más la vida',
      'Cuidar a mi familiar me ha permitido tener una actitud más positiva ante la vida',
      'Cuidar a mi familiar ha fortalecido mi relación con otras personas',
    ],
    interpret: (s) => `${s}/45 (a más puntaje, más aspectos positivos del cuidar)`,
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
