import { useParams } from 'react-router-dom'
import { lenteDe } from '../app/lentes'
import { DashboardShell } from './DashboardShell'
import { PromotorHome } from './PromotorHome'
import { MiSaludCerebral } from '../modules/profile/MiSaludCerebral'
import { RedAlarmas } from '../modules/red/RedAlarmas'

// El home de cada lente sale de la MATRIZ: persona = su ficha cálida; agente = mi gente;
// enfermería/médico/neuropsico/trabajo social = su cola; gestión/comunidad = tablero.
export function RoleHome() {
  const { profileId } = useParams()
  const kind = lenteDe(profileId).homeKind
  if (kind === 'persona') return <MiSaludCerebral />
  if (kind === 'gente') return <PromotorHome />
  if (kind === 'cola') return <RedAlarmas />
  return <DashboardShell />
}
