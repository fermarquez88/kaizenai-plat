import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, User } from 'lucide-react'
import { useSettings } from '../../lib/store'

// "Mi gente": el cuidador/promotor elige a CUÁL de sus personas le completa, o agrega otra.
// Cada persona tiene su ficha aislada (no se pisan datos).
export function SelectorPersona() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const cuidados = useSettings((s) => s.cuidados)
  const personas = useSettings((s) => s.personas)
  const setActivePerson = useSettings((s) => s.setActivePerson)
  const addPersona = useSettings((s) => s.addPersona)
  const [agregando, setAgregando] = useState(false)
  const [alias, setAlias] = useState('')
  const [relacion, setRelacion] = useState('familiar')

  const elegir = (id: string) => {
    setActivePerson(id)
    navigate(`/p/${profileId}`)
  }
  const crear = () => {
    if (!alias.trim()) return
    addPersona(alias.trim(), relacion) // crea y activa
    navigate(`/p/${profileId}`)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <button onClick={() => navigate(`/p/${profileId}`)} className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft size={16} /> Volver
      </button>
      <h1 className="font-serif text-2xl text-ink sm:text-3xl">Mi gente</h1>
      <p className="mt-1 text-sm text-muted">¿A quién vas a acompañar ahora?</p>

      <ul className="mt-5 space-y-2">
        {cuidados.map((id) => {
          const p = personas[id]
          if (!p) return null
          return (
            <li key={id}>
              <button
                onClick={() => elegir(id)}
                className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-left hover:border-secondary"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-bg text-secondary">
                  <User size={20} />
                </span>
                <span>
                  <span className="block text-lg font-medium text-ink">{p.alias}</span>
                  {p.relacion && <span className="block text-sm text-muted">{p.relacion}</span>}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {agregando ? (
        <div className="mt-5 rounded-2xl border border-line bg-surface p-4">
          <label className="block text-sm font-medium text-ink">Apodo o iniciales de la persona</label>
          <input value={alias} onChange={(e) => setAlias(e.target.value)} placeholder='Ej.: "mi tío", "J. L."' className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-ink focus:border-secondary" autoFocus />
          <div className="mt-3 flex flex-wrap gap-2">
            {[['familiar', 'Familiar'], ['pareja', 'Pareja'], ['vecino', 'Vecino/a'], ['otro', 'Otro']].map(([v, l]) => (
              <button key={v} onClick={() => setRelacion(v)} aria-pressed={relacion === v} className={'rounded-xl border px-3 py-1.5 text-sm ' + (relacion === v ? 'border-secondary bg-secondary/10 text-secondary-text' : 'border-line bg-bg text-ink')}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={crear} disabled={!alias.trim()} className="mt-4 w-full rounded-xl bg-primary px-5 py-2.5 font-medium text-white disabled:opacity-40">
            Agregar y acompañar
          </button>
        </div>
      ) : (
        <button onClick={() => setAgregando(true)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-secondary bg-secondary/10 px-5 py-3 font-medium text-secondary">
          <Plus size={18} /> Agregar otra persona
        </button>
      )}
    </div>
  )
}
