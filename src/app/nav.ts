// Migas de pan + "back anclado". Regla de oro: subir un nivel, NUNCA al limbo (jamás
// navigate(-1) ciego). El back del header = la miga anterior. Deriva del path + la matriz
// de lentes; las etiquetas son claves i18n.
import { LENTES, type LenteId } from './lentes'

export interface Crumb {
  label: string // clave i18n
  to: string
}

// Segmento de módulo → etiqueta i18n + padre lógico (para la cadena de migas).
const SEG_META: Record<string, { label: string; parent?: string }> = {
  preconsulta: { label: 'nav.crumb.chequeo' },
  'mi-resultado': { label: 'nav.crumb.resultado' },
  alarmas: { label: 'nav.crumb.alarmas' },
  seguimiento: { label: 'nav.crumb.seguimiento' },
  promotor: { label: 'nav.crumb.gente' },
  ficha: { label: 'nav.crumb.ficha', parent: 'promotor' },
  pedir: { label: 'nav.crumb.pedir', parent: 'alarmas' },
  neuropsico: { label: 'nav.crumb.neuropsico', parent: 'alarmas' },
  'informe-doc': { label: 'nav.crumb.informe' },
  agenda: { label: 'nav.crumb.agenda' },
  metricas: { label: 'nav.crumb.metricas' },
  equipo: { label: 'nav.crumb.equipo' },
  red: { label: 'nav.crumb.red' },
  post: { label: 'nav.crumb.guia' },
}

const GLOBAL: Record<string, string> = {
  perfil: 'nav.crumb.perfil',
  datos: 'nav.crumb.datos',
  gobernanza: 'nav.crumb.gobernanza',
  'aviso-legal': 'nav.crumb.aviso',
  demo: 'nav.crumb.demo',
  ejemplo: 'nav.crumb.ejemplo',
}

export function breadcrumbs(pathname: string): Crumb[] {
  const crumbs: Crumb[] = [{ label: 'nav.crumb.inicio', to: '/inicio' }]
  const m = pathname.match(/^\/p\/([^/]+)(?:\/(.*))?$/)
  if (!m) {
    const seg = pathname.replace(/^\//, '').split('/')[0]
    if (seg && seg !== 'inicio' && GLOBAL[seg]) crumbs.push({ label: GLOBAL[seg], to: `/${seg}` })
    return crumbs
  }
  const lid = m[1] as LenteId
  const rest = m[2] ?? ''
  const lenteLabel = LENTES[lid] ? `nav.lente.${lid}` : 'nav.crumb.area'
  crumbs.push({ label: lenteLabel, to: `/p/${lid}` })
  if (!rest) return crumbs
  const seg = rest.split('/')[0]
  const meta = SEG_META[seg]
  if (meta?.parent && meta.parent !== seg) {
    const pLabel = SEG_META[meta.parent]?.label ?? `nav.crumb.${meta.parent}`
    crumbs.push({ label: pLabel, to: `/p/${lid}/${meta.parent}` })
  }
  crumbs.push({ label: meta?.label ?? `nav.crumb.${seg}`, to: pathname })
  return crumbs
}

/** A dónde lleva el "volver": la miga anterior (un nivel arriba), nunca al limbo. */
export function backTo(pathname: string): string {
  const c = breadcrumbs(pathname)
  return c.length >= 2 ? c[c.length - 2].to : '/inicio'
}
