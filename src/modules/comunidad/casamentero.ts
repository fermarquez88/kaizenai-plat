import { labelDe, PerfilActivos, SABERES, TEMAS } from './activosStore'
import { IdeaConexion } from './match'

// El casamentero a ESCALA DE RED: cruza los activos de varias personas de la zona y propone
// conexiones concretas (oferta↔demanda + saber/tema compartido + cercanía). Es lo que vuelve
// esto una red y no fichas sueltas. El agente sanitario valida y acompaña el primer contacto.
export interface PersonaActivos {
  id: string
  alias: string
  perfil: PerfilActivos
}

export interface ConexionRed {
  tipo: IdeaConexion
  titulo: string
  detalle: string
  aliases: string[]
}

const claveSaber = (saberId?: string) => labelDe(SABERES, saberId).toLowerCase().split(/[ /]/)[0]

export function tejerRed(gente: PersonaActivos[]): ConexionRed[] {
  const out: ConexionRed[] = []

  // 1. Mesa de Saberes — un saber compartido por ≥2 vecinos arma una ronda.
  for (const { id, label } of SABERES) {
    const quienes = gente.filter((g) => g.perfil.saberes.includes(id))
    if (quienes.length >= 2) {
      out.push({ tipo: 'mesa', titulo: `Mesa de ${label}`, detalle: `${quienes.length} vecinos comparten este saber: armá una ronda (rotá la sede a quien no sale).`, aliases: quienes.map((q) => q.alias) })
    }
  }

  // 2. Aprendices a domicilio — quien OFRECE un saber ↔ quien QUIERE aprenderlo.
  const maestros = gente.filter((g) => g.perfil.dispuestoEnsenar && (g.perfil.destacado ?? g.perfil.saberes[0]))
  for (const m of maestros) {
    const saberId = m.perfil.destacado ?? m.perfil.saberes[0]
    const label = labelDe(SABERES, saberId)
    const key = claveSaber(saberId)
    const aprendices = gente.filter((a) => a.id !== m.id && a.perfil.quiereAprender.some((q) => q.toLowerCase().includes(key) || key.includes(q.toLowerCase())))
    for (const a of aprendices) {
      out.push({ tipo: 'aprendices', titulo: `Aprendices: ${label}`, detalle: `${m.alias} enseña ${label.toLowerCase()} → ${a.alias} quiere aprender. El aprendiz va a la casa.`, aliases: [m.alias, a.alias] })
    }
  }

  // 3. Línea Cálida — quienes no salen y comparten un tema: emparejá llamadas de voz.
  const aislados = gente.filter((g) => g.perfil.movilidad === 'noSale' && g.perfil.oyeBienTel !== false)
  for (const { id, label } of TEMAS) {
    const quienes = aislados.filter((g) => g.perfil.temas.includes(id))
    if (quienes.length >= 2) {
      out.push({ tipo: 'linea', titulo: `Línea Cálida: ${label}`, detalle: `${quienes.map((q) => q.alias).join(' y ')} no salen y comparten este interés: emparejá una llamada por semana.`, aliases: quienes.map((q) => q.alias) })
    }
  }

  // 4. Radio Sabiduría — todos los dispuestos a enseñar pueden grabar cápsulas.
  const emisores = gente.filter((g) => g.perfil.dispuestoEnsenar && g.perfil.saberes.length)
  if (emisores.length >= 1) {
    out.push({ tipo: 'radio', titulo: 'Radio Sabiduría', detalle: `${emisores.length} ${emisores.length === 1 ? 'persona puede' : 'personas pueden'} grabar cápsulas enseñando lo suyo.`, aliases: emisores.map((e) => e.alias) })
  }

  return out
}
