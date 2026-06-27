import { labelDe, PerfilActivos, SABERES, TEMAS } from './activosStore'

// El "casamentero" del agente: de un perfil de activos saca conexiones concretas con PROPÓSITO
// (nunca al azar ni por lástima — la evidencia marca el match genérico como fallido). Cada idea
// está respaldada: reminiscencia (SMD -1,52), grupo estructurado (-0,27), enlace humano, voz.
export type IdeaConexion = 'radio' | 'aprendices' | 'mesa' | 'linea' | 'telar'

export interface Sugerencia {
  idea: IdeaConexion
  titulo: string
  motivo: string
  prioridad: number // mayor = primero
}

export interface ResultadoMatch {
  // Cognición social desadaptativa ("soy una carga"): el componente individual más potente
  // (~76%). El agente normaliza/deriva y prioriza un match que devuelva ROL.
  reencuadre: boolean
  sugerencias: Sugerencia[]
}

const primerSaber = (p: PerfilActivos) => p.destacado ?? p.saberes[0]

export function sugerirConexiones(p: PerfilActivos): ResultadoMatch {
  const out: Sugerencia[] = []
  const saber = primerSaber(p)
  const saberTxt = labelDe(SABERES, saber).toLowerCase()
  const tema = p.temas[0]
  const temaTxt = labelDe(TEMAS, tema).toLowerCase()
  const reencuadre = p.sienteCarga === true

  // Radio Sabiduría — el mayor como EMISOR/maestro (reminiscencia, sin movilidad ni alfabetización).
  if (saber) {
    out.push({
      idea: 'radio',
      titulo: 'Radio Sabiduría',
      motivo: `Grabá una cápsula de voz enseñando ${saberTxt}. La escuchan vecinos y te devuelven las gracias.`,
      prioridad: 9 + (p.dispuestoEnsenar ? 2 : 0) + (reencuadre ? 2 : 0),
    })
  }

  // Aprendices a domicilio — rol legítimo + el aprendiz va a su casa (resuelve movilidad).
  if (saber && p.dispuestoEnsenar) {
    out.push({
      idea: 'aprendices',
      titulo: 'Aprendices a domicilio',
      motivo: `Te conectamos con alguien que quiere aprender ${saberTxt}. Va a tu casa.`,
      prioridad: 8 + (reencuadre ? 1 : 0),
    })
  }
  if (p.quiereAprender.length) {
    out.push({
      idea: 'aprendices',
      titulo: 'Aprender un oficio',
      motivo: `Te buscamos un maestro de ${p.quiereAprender[0]} cerca tuyo.`,
      prioridad: 6,
    })
  }

  // Mesa de Saberes — grupo estructurado; el inmóvil es anfitrión (su casa = nodo de la red).
  const zona = p.paraje ? ` (en ${p.paraje})` : ''
  out.push(
    p.movilidad === 'noSale'
      ? { idea: 'mesa', titulo: 'Mesa de Saberes en tu casa', motivo: `Que la ronda de vecinos se haga en tu casa${zona}. Vos sos anfitrión/a.`, prioridad: 7 }
      : { idea: 'mesa', titulo: 'Mesa de Saberes', motivo: `Sumate a una ronda de vecinos cerca${zona} a hacer algo juntos.`, prioridad: 6 },
  )

  // Línea Cálida — voz, único canal para la movilidad nula (si oye/conversa por teléfono).
  if (p.movilidad === 'noSale' && p.oyeBienTel !== false) {
    out.push({
      idea: 'linea',
      titulo: 'Línea Cálida',
      motivo: tema ? `Una llamada por semana con alguien para hablar de ${temaTxt}.` : 'Una llamada de compañía por semana, día y hora fijos.',
      prioridad: 7,
    })
  }

  // El telar del pueblo — pertenencia al colectivo ("mi receta está en el libro = existo").
  if (saber || tema) {
    out.push({
      idea: 'telar',
      titulo: 'El telar del pueblo',
      motivo: `Tu aporte (${saberTxt || temaTxt}) en la obra de todo el pueblo.`,
      prioridad: 4 + (reencuadre ? 1 : 0),
    })
  }

  out.sort((a, b) => b.prioridad - a.prioridad)
  return { reencuadre, sugerencias: out }
}
