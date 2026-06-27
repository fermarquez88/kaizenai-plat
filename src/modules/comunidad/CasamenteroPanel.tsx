import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, HandHeart, Radio, Sparkles, Users } from 'lucide-react'
import { useSettings } from '../../lib/store'
import { PerfilActivos, useActivos } from './activosStore'
import { IdeaConexion } from './match'
import { ConexionRed, PersonaActivos, tejerRed } from './casamentero'

// Panel del AGENTE SANITARIO: teje la red cruzando los activos de su gente. No reemplaza al
// agente: le muestra a quién juntar con quién y por qué. Él valida y acompaña el primer contacto.
const ICONO: Record<IdeaConexion, typeof Users> = { mesa: Users, aprendices: HandHeart, linea: Radio, radio: Radio, telar: Sparkles }

const p = (o: Partial<PerfilActivos>): PerfilActivos => ({ fecha: 0, saberes: [], quiereAprender: [], temas: [], ...o })
// Ejemplo (NO datos reales) para mostrar el tejido en la demo cuando aún no se cargaron activos.
const EJEMPLO: PersonaActivos[] = [
  { id: 'ej-rosa', alias: 'Rosa (ej.)', perfil: p({ saberes: ['costura', 'cocina'], destacado: 'costura', dispuestoEnsenar: true, temas: ['musica'], movilidad: 'sola', paraje: 'Pocito' }) },
  { id: 'ej-maria', alias: 'María (ej.)', perfil: p({ saberes: ['costura'], temas: ['musica', 'religion'], movilidad: 'noSale', oyeBienTel: true, paraje: 'Pocito' }) },
  { id: 'ej-juan', alias: 'Juan (ej.)', perfil: p({ quiereAprender: ['costura'], temas: ['futbol'], movilidad: 'noSale', oyeBienTel: true, sienteCarga: true }) },
  { id: 'ej-pedro', alias: 'Pedro (ej.)', perfil: p({ saberes: ['campo'], dispuestoEnsenar: true, temas: ['musica'], movilidad: 'noSale', oyeBienTel: true }) },
]

function Lista({ conexiones }: { conexiones: ConexionRed[] }) {
  if (!conexiones.length) return <p className="mt-4 rounded-2xl border border-line bg-surface p-5 text-muted">Todavía no hay suficientes activos cargados para sugerir conexiones.</p>
  return (
    <ul className="mt-4 space-y-2">
      {conexiones.map((c, i) => {
        const Icon = ICONO[c.tipo]
        return (
          <li key={`${c.tipo}-${i}`} className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-bg text-secondary"><Icon size={18} /></span>
              <div className="min-w-0">
                <p className="font-medium text-ink">{c.titulo}</p>
                <p className="text-sm text-muted">{c.detalle}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.aliases.map((a) => <span key={a} className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs text-secondary">{a}</span>)}
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function CasamenteroPanel() {
  const { profileId } = useParams()
  const pid = profileId ?? 'agente'
  const porPersona = useActivos((s) => s.porPersona)
  const personas = useSettings((s) => s.personas)
  const [verEjemplo, setVerEjemplo] = useState(false)

  const gente = useMemo<PersonaActivos[]>(
    () => Object.entries(porPersona).map(([id, perfil]) => ({ id, alias: personas[id]?.alias ?? 'Alguien', perfil })),
    [porPersona, personas],
  )
  const fuente = gente.length >= 2 ? gente : verEjemplo ? EJEMPLO : []
  const conexiones = useMemo(() => tejerRed(fuente), [fuente])

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link to={`/p/${pid}`} className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> Volver</Link>
      <h1 className="font-serif text-2xl text-ink sm:text-3xl">Tejer comunidad</h1>
      <p className="mt-1 text-muted">Conexiones con propósito entre tu gente, según lo que cada uno sabe y puede. Vos validás y acompañás el primer contacto.</p>

      {gente.length < 2 && (
        <div className="mt-5 rounded-2xl border border-line bg-surface p-5">
          <p className="text-ink">Cargá los activos de varias personas (botón <b>Conectar</b> en cada ficha) para ver a quién juntar con quién.</p>
          <button onClick={() => setVerEjemplo((v) => !v)} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-secondary bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary">
            <Sparkles size={16} /> {verEjemplo ? 'Ocultar ejemplo' : 'Ver con un ejemplo'}
          </button>
          {verEjemplo && <p className="mt-2 text-xs text-muted">Datos de ejemplo (no reales), solo para mostrar cómo se teje la red.</p>}
        </div>
      )}

      <Lista conexiones={conexiones} />
    </div>
  )
}
