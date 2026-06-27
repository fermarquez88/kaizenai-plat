import { useParams } from 'react-router-dom'
import { lenteDe } from '../app/lentes'
import { DashboardShell } from './DashboardShell'
import { PromotorHome } from './PromotorHome'
import { Hilo } from '../modules/profile/Hilo'
import { RedAlarmas } from '../modules/red/RedAlarmas'

// La PIEL la decide la matriz: modo 'hilo' (díada) = conversación cálida; modo 'cuaderno'
// (equipo) = home de tareas según homeKind.
export function RoleHome() {
  const { profileId } = useParams()
  const lente = lenteDe(profileId)
  if (lente.modo === 'hilo') return <Hilo />
  if (lente.homeKind === 'gente') return <PromotorHome />
  if (lente.homeKind === 'cola') return <RedAlarmas />
  return <DashboardShell />
}
