import { useParams } from 'react-router-dom'
import { DashboardShell } from './DashboardShell'
import { MiSaludCerebral } from '../modules/profile/MiSaludCerebral'

// La persona y el cuidador entran a SU espacio "Mi salud cerebral" (puerta cálida con
// avance del perfil); los demás roles, a su tablero de módulos.
export function RoleHome() {
  const { profileId } = useParams()
  if (profileId === 'paciente' || profileId === 'cuidador') return <MiSaludCerebral />
  return <DashboardShell />
}
