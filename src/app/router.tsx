import { createHashRouter } from 'react-router-dom'
import { App } from '../App'
import { ProfileSelect } from '../profiles/ProfileSelect'
import { DashboardShell } from '../profiles/DashboardShell'
import { PreconsultaFlow } from '../modules/pre/PreconsultaFlow'
import { CuidadorGuia } from '../modules/post/CuidadorGuia'
import { PacienteGuia } from '../modules/post/PacienteGuia'
import { Comunidad } from '../modules/gov/Comunidad'
import { MisDatos } from '../modules/gov/MisDatos'
import { RedView } from '../modules/red/RedView'

// Hash routing keeps refreshes working on static hosts (GitHub Pages).
export const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <ProfileSelect /> },
      { path: 'p/:profileId', element: <DashboardShell /> },
      { path: 'p/:profileId/preconsulta', element: <PreconsultaFlow /> },
      { path: 'p/:profileId/post/cuidador', element: <CuidadorGuia /> },
      { path: 'p/:profileId/post/paciente', element: <PacienteGuia /> },
      { path: 'p/:profileId/red/:mode', element: <RedView /> },
      { path: 'gobernanza', element: <Comunidad /> },
      { path: 'datos', element: <MisDatos /> },
    ],
  },
])
