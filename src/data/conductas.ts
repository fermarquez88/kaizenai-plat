// Conductas frecuentes en demencia con el método DICE APLICADO (no genérico) +
// tips concretos. Manejo NO farmacológico, orientativo. Texto en español inline
// (igual criterio que harmonizedFactores). Lo que el cuidador necesita en crisis.
export interface Conducta {
  id: string
  titulo: string
  porque: string
  dice: string
  tips: string[]
}

export const CONDUCTAS: Conducta[] = [
  {
    id: 'bano',
    titulo: 'Se niega a bañarse',
    porque: 'Puede tener frío, miedo a resbalar, vergüenza, o no entender qué le pedís. El baño llega a asustar o abrumar.',
    dice: 'Describí cuándo se niega → Investigá si hay frío, dolor o miedo → Creá un plan (baño tibio, ambiente cálido, su mejor horario) → Evaluá si mejoró.',
    tips: [
      'Calentá el baño antes y tené todo a mano.',
      'Ofrecé en el horario en que está más tranquila/o.',
      'Cuidá el pudor: una toalla sobre los hombros ayuda.',
      'Si hoy no quiere, probá una esponja y reintentá luego — sin pelear.',
    ],
  },
  {
    id: 'atardecer',
    titulo: 'Se inquieta al caer la tarde',
    porque: 'Al atardecer, el cansancio, menos luz y los cambios de rutina aumentan la confusión y el nerviosismo (“sundowning”).',
    dice: 'Describí a qué hora empieza → Investigá cansancio/ruido/cafeína → Creá más luz y calma antes del atardecer → Evaluá.',
    tips: [
      'Prendé las luces antes de que oscurezca.',
      'Bajá ruidos y estímulos a la tarde.',
      'Una caminata o actividad suave temprano ayuda a dormir.',
      'Evitá café/mate fuerte y siestas largas.',
    ],
  },
  {
    id: 'deambula',
    titulo: 'Camina sin rumbo o quiere irse',
    porque: 'Puede buscar algo, tener energía de más, aburrirse, o creer que debe ir a un lugar de su pasado.',
    dice: 'Describí cuándo y hacia dónde → Investigá qué busca o siente → Creá salidas seguras y rutina → Evaluá.',
    tips: [
      'Asegurá puertas y avisá a vecinos de confianza.',
      'Que lleve una identificación con un teléfono.',
      'Ofrecé caminatas acompañadas para gastar energía.',
      'Validá la emoción (“te entiendo, vamos juntos”) en vez de discutir.',
    ],
  },
  {
    id: 'repite',
    titulo: 'Pregunta lo mismo muchas veces',
    porque: 'La memoria reciente falla: no recuerda que ya preguntó. Muchas veces hay ansiedad detrás de la pregunta.',
    dice: 'Describí qué repite → Investigá si hay preocupación → Creá apoyos a la vista (pizarra) → Evaluá.',
    tips: [
      'Respondé con calma, como si fuera la primera vez.',
      'Anotá la respuesta en un papel o pizarra a la vista.',
      'Atendé la emoción (“¿estás preocupada/o?”) más que el dato.',
      'Distraé con una actividad que le guste.',
    ],
  },
  {
    id: 'enojo',
    titulo: 'Se enoja o se pone agresiva/o',
    porque: 'Casi siempre comunica algo: dolor, miedo, hambre, demasiado ruido, o sentirse apurada/o o corregida/o.',
    dice: 'Describí qué pasó justo antes → Investigá la causa (dolor, baño, ruido) → Creá un entorno calmo y sin apuro → Evaluá.',
    tips: [
      'No discutas ni corrijas: bajá la voz y dale espacio.',
      'Buscá la causa concreta (dolor, hambre, ganas de ir al baño).',
      'Quitá el apuro: una cosa por vez, con tiempo.',
      'Si hay riesgo, alejate un momento y pedí ayuda.',
    ],
  },
  {
    id: 'desconfia',
    titulo: 'Desconfía o acusa (“me robaron”)',
    porque: 'Al no recordar dónde dejó las cosas, completa con una explicación. No es de mala fe: es la enfermedad.',
    dice: 'Describí la acusación → Investigá qué objeto y dónde suele guardarlo → Creá duplicados y rutina → Evaluá.',
    tips: [
      'No te defiendas ni discutas: validá (“te ayudo a buscarlo”).',
      'Tené duplicados de objetos clave (llaves, anteojos).',
      'Conocé sus “escondites” habituales.',
      'No lo tomes personal: es un síntoma, no es contra vos.',
    ],
  },
]
