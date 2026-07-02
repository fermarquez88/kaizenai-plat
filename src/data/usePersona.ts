import { useEffect, useState } from 'react'
import { personaSeed } from '../seed/personas'
import { dexieRepo } from './dexieRepo'

export interface PersonaResuelta {
  alias: string
  edad?: number
  edu?: number
  dni?: string
  encontrada: boolean
}

// Resuelve una persona por id desde el SEED (sync) o el registro local dexie (async).
// Evita mostrar el id crudo (dni-123 / uuid) como nombre y recupera edad/educación reales
// de los pacientes cargados a mano. Fallback: el propio id, encontrada=false.
export function usePersona(personId?: string): PersonaResuelta {
  const seed = personId ? personaSeed(personId) : undefined
  const [dexie, setDexie] = useState<{ alias: string; edad?: number; edu?: number; dni?: string } | undefined>(undefined)

  useEffect(() => {
    if (seed || !personId) return
    let vivo = true
    dexieRepo
      .getPerson(personId)
      .then((p) => { if (vivo && p) setDexie({ alias: p.alias, edad: p.ageYears, edu: p.educationYears, dni: p.dni }) })
      .catch(() => {})
    return () => { vivo = false }
  }, [personId, seed])

  if (seed) return { alias: seed.alias, edad: seed.age, edu: seed.edu, encontrada: true }
  if (dexie) return { alias: dexie.alias, edad: dexie.edad, edu: dexie.edu, dni: dexie.dni, encontrada: true }
  return { alias: personId ?? '—', encontrada: false }
}
