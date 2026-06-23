import { createHashRouter } from 'react-router-dom'
import { App } from '../App'
import { ProfileSelect } from '../profiles/ProfileSelect'
import { DashboardShell } from '../profiles/DashboardShell'
import { PreconsultaFlow } from '../modules/pre/PreconsultaFlow'

// Hash routing keeps refreshes working on static hosts (GitHub Pages).
export const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <ProfileSelect /> },
      { path: 'p/:profileId', element: <DashboardShell /> },
      { path: 'p/:profileId/preconsulta', element: <PreconsultaFlow /> },
    ],
  },
])
