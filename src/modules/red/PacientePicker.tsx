import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Search, UserPlus } from 'lucide-react'
import { dexieRepo } from '../../data/dexieRepo'
import { SEED_PERSONAS } from '../../seed/personas'
import type { Person } from '../../data/types'

// Completar un paciente A MANO (acción principal del equipo): buscar a alguien ya cargado
// o dar de alta uno nuevo (DNI = clave de vinculación) → abre su ficha para cargar datos.
export function PacientePicker() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const pid = profileId ?? 'agente'
  const [people, setPeople] = useState<Person[]>([])
  const [q, setQ] = useState('')
  const [nuevo, setNuevo] = useState(false)
  const [dni, setDni] = useState('')
  const [alias, setAlias] = useState('')

  useEffect(() => { dexieRepo.listPeople().then(setPeople).catch(() => {}) }, [])

  const seedAsPeople: Person[] = SEED_PERSONAS.map((p) => ({ id: `seed-${p.id}`, alias: p.alias, ageYears: p.age, lang: 'es', createdAt: 0 }))
  const todos = [...people, ...seedAsPeople]
  const filtro = q.trim().toLowerCase()
  const lista = filtro ? todos.filter((p) => p.alias.toLowerCase().includes(filtro) || (p.dni ?? '').includes(filtro)) : todos.slice(0, 12)

  // Cada perfil va DIRECTO a su panel de evaluación; el resto (médico/agente) al hub-ficha.
  const DEST: Record<string, string> = { enfermeria: 'vitales', neuropsico: 'neuropsico', social: 'social', unidad: 'diagnostico' }
  const abrir = (id: string) => navigate(`/p/${pid}/${DEST[pid] ?? 'ficha'}/${id}`)

  const crear = () => {
    if (!alias.trim() && !dni.trim()) return
    const id = dni.trim() ? `dni-${dni.trim()}` : crypto.randomUUID()
    dexieRepo.upsertPerson({ id, alias: alias.trim() || `DNI ${dni.trim()}`, dni: dni.trim() || undefined, lang: 'es', createdAt: Date.now() }).finally(() => abrir(id))
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Link to={`/p/${pid}`} className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> Volver</Link>
      <h1 className="flex items-center gap-2 font-serif text-2xl text-ink"><UserPlus className="text-secondary" /> Completar un paciente</h1>
      <p className="mt-1 text-sm text-muted">Buscá a la persona o cargá una nueva. Después abrís su ficha y completás lo que te toca.</p>

      {!nuevo ? (
        <>
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-line bg-bg px-3 py-2.5 focus-within:border-secondary">
            <Search size={18} className="text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por apodo o DNI" className="w-full bg-transparent text-ink outline-none" autoFocus />
          </div>
          <button onClick={() => setNuevo(true)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-white">
            <UserPlus size={18} /> Cargar paciente nuevo
          </button>
          <ul className="mt-4 space-y-2">
            {lista.map((p) => (
              <li key={p.id}>
                <button onClick={() => abrir(p.id)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3 text-left hover:border-secondary">
                  <span><span className="block text-ink">{p.alias}</span>{p.dni && <span className="block text-xs text-muted">DNI {p.dni}</span>}</span>
                  <ArrowRight size={18} className="text-muted" />
                </button>
              </li>
            ))}
            {lista.length === 0 && <li className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">Nadie con ese dato. Cargá un paciente nuevo.</li>}
          </ul>
        </>
      ) : (
        <div className="mt-5 space-y-4">
          <label className="block"><span className="text-sm text-ink">DNI <span className="text-muted">(clave de vinculación)</span></span>
            <input value={dni} onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Sin puntos" className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-ink" />
          </label>
          <label className="block"><span className="text-sm text-ink">Apodo o iniciales</span>
            <input value={alias} onChange={(e) => setAlias(e.target.value)} placeholder='Ej.: "M. R."' className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-ink" />
          </label>
          <p className="text-xs text-muted">No usamos el nombre completo. El DNI queda en este dispositivo y permite vincular sus registros entre actores.</p>
          <div className="flex gap-2">
            <button onClick={() => setNuevo(false)} className="rounded-xl border border-line px-4 py-2.5 text-sm text-muted">Volver</button>
            <button onClick={crear} disabled={!alias.trim() && !dni.trim()} className="flex-1 rounded-xl bg-primary py-2.5 font-medium text-white disabled:opacity-40">Crear y abrir ficha</button>
          </div>
        </div>
      )}
    </div>
  )
}
