import { useParams } from 'react-router-dom'
import { lenteDe } from '../app/lentes'
import { DashboardShell } from './DashboardShell'
import { PromotorHome } from './PromotorHome'
import { Hilo } from '../modules/profile/Hilo'
import { CuidadorEspacio } from '../modules/cuidador/CuidadorEspacio'
import { EquipoHome } from './EquipoHome'

// La PIEL la decide la matriz: modo 'hilo' (díada) = conversación cálida; modo 'cuaderno'
// (equipo) = bienvenida needs-first ("¿qué necesita hacer hoy?") según el perfil.
const EQUIPO_NEEDS_FIRST = new Set(['enfermeria', 'unidad', 'neuropsico', 'social'])

export function RoleHome() {
  const { profileId } = useParams()
  const lente = lenteDe(profileId)
  // El cuidador tiene su propio espacio (estilo kaizen-cuidadores): "¿qué necesita hoy?".
  if (profileId === 'cuidador') return <CuidadorEspacio />
  if (lente.modo === 'hilo') return <Hilo />
  // Equipo: aterriza en SU tarea, no en la cola cruda.
  if (profileId && EQUIPO_NEEDS_FIRST.has(profileId)) return <EquipoHome />
  if (lente.homeKind === 'gente') return <PromotorHome />
  return <DashboardShell />
}
