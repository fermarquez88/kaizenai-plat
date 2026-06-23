import { createHashRouter } from 'react-router-dom'
import { App } from '../App'
import { ProfileSelect } from '../profiles/ProfileSelect'
import { DashboardShell } from '../profiles/DashboardShell'
import { PreconsultaFlow } from '../modules/pre/PreconsultaFlow'
import { MiResultado } from '../modules/pre/MiResultado'
import { CasoEjemplo } from '../modules/pre/CasoEjemplo'
import { CuidadorGuia } from '../modules/post/CuidadorGuia'
import { PacienteGuia } from '../modules/post/PacienteGuia'
import { Comunidad } from '../modules/gov/Comunidad'
import { MisDatos } from '../modules/gov/MisDatos'
import { RedView } from '../modules/red/RedView'
import { AgendaVisitas } from '../modules/red/AgendaVisitas'
import { CoberturaTiempos } from '../modules/red/CoberturaTiempos'
import { EquipoUnidad } from '../modules/red/EquipoUnidad'

// Hash routing keeps refreshes working on static hosts (GitHub Pages).
export const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <ProfileSelect /> },
      { path: 'ejemplo', element: <CasoEjemplo /> },
      { path: 'p/:profileId', element: <DashboardShell /> },
      { path: 'p/:profileId/preconsulta', element: <PreconsultaFlow /> },
      { path: 'p/:profileId/mi-resultado', element: <MiResultado /> },
      { path: 'p/:profileId/post/cuidador', element: <CuidadorGuia /> },
      { path: 'p/:profileId/post/paciente', element: <PacienteGuia /> },
      { path: 'p/:profileId/red/:mode', element: <RedView /> },
      { path: 'p/:profileId/agenda', element: <AgendaVisitas /> },
      { path: 'p/:profileId/metricas', element: <CoberturaTiempos /> },
      { path: 'p/:profileId/equipo', element: <EquipoUnidad /> },
      { path: 'gobernanza', element: <Comunidad /> },
      { path: 'datos', element: <MisDatos /> },
    ],
  },
])
