import { createHashRouter } from 'react-router-dom'
import { App } from '../App'
import { ProfileSelect } from '../profiles/ProfileSelect'
import { Inicio } from '../profiles/Inicio'
import { PromotorHome } from '../profiles/PromotorHome'
import { RoleHome } from '../profiles/RoleHome'
import { PreconsultaFlow } from '../modules/pre/PreconsultaFlow'
import { MiResultado } from '../modules/pre/MiResultado'
import { CasoEjemplo } from '../modules/pre/CasoEjemplo'
import { CuidadorGuia } from '../modules/post/CuidadorGuia'
import { PacienteGuia } from '../modules/post/PacienteGuia'
import { InformeDocumento } from '../modules/post/InformeDocumento'
import { Comunidad } from '../modules/gov/Comunidad'
import { MisDatos } from '../modules/gov/MisDatos'
import { AvisoLegal } from '../modules/gov/AvisoLegal'
import { PerfilHub } from '../modules/profile/PerfilHub'
import { SelectorPersona } from '../modules/profile/SelectorPersona'
import { RedView } from '../modules/red/RedView'
import { RedAlarmas } from '../modules/red/RedAlarmas'
import { PanelPedidos } from '../modules/red/PanelPedidos'
import { NeuropsicEvalStep } from '../modules/red/NeuropsicEvalStep'
import { SocialStep } from '../modules/red/SocialStep'
import { Seguimiento } from '../modules/red/Seguimiento'
import { FichaPaciente } from '../modules/red/FichaPaciente'
import { AgendaVisitas } from '../modules/red/AgendaVisitas'
import { CoberturaTiempos } from '../modules/red/CoberturaTiempos'
import { EquipoUnidad } from '../modules/red/EquipoUnidad'

// Hash routing keeps refreshes working on static hosts (GitHub Pages).
export const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Inicio /> },
      { path: 'inicio', element: <Inicio /> },
      { path: 'demo', element: <ProfileSelect /> },
      { path: 'ejemplo', element: <CasoEjemplo /> },
      { path: 'p/:profileId', element: <RoleHome /> },
      { path: 'p/:profileId/promotor', element: <PromotorHome /> },
      { path: 'p/:profileId/preconsulta', element: <PreconsultaFlow /> },
      { path: 'p/:profileId/mi-resultado', element: <MiResultado /> },
      { path: 'p/:profileId/post/cuidador', element: <CuidadorGuia /> },
      { path: 'p/:profileId/post/paciente', element: <PacienteGuia /> },
      { path: 'p/:profileId/informe-doc', element: <InformeDocumento /> },
      { path: 'p/:profileId/red/:mode', element: <RedView /> },
      { path: 'p/:profileId/alarmas', element: <RedAlarmas /> },
      { path: 'p/:profileId/pedir/:personId', element: <PanelPedidos /> },
      { path: 'p/:profileId/neuropsico/:personId', element: <NeuropsicEvalStep /> },
      { path: 'p/:profileId/social/:personId', element: <SocialStep /> },
      { path: 'p/:profileId/seguimiento', element: <Seguimiento /> },
      { path: 'p/:profileId/ficha/:recordId', element: <FichaPaciente /> },
      { path: 'p/:profileId/agenda', element: <AgendaVisitas /> },
      { path: 'p/:profileId/metricas', element: <CoberturaTiempos /> },
      { path: 'p/:profileId/equipo', element: <EquipoUnidad /> },
      { path: 'gobernanza', element: <Comunidad /> },
      { path: 'datos', element: <MisDatos /> },
      { path: 'aviso-legal', element: <AvisoLegal /> },
      { path: 'perfil', element: <PerfilHub /> },
      { path: 'p/:profileId/personas', element: <SelectorPersona /> },
    ],
  },
])
