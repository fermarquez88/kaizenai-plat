import { BarChart3, Building2, HeartHandshake, MapPin, User, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type ProfileId =
  | 'paciente'
  | 'cuidador'
  | 'agente'
  | 'gestor'
  | 'unidad'
  | 'comunidad'

export type Accent = 'primary' | 'secondary' | 'accent'

export interface ProfileDef {
  id: ProfileId
  icon: LucideIcon
  accent: Accent
  /** number of module cards shown in the dashboard shell */
  moduleCount: number
}

export const PROFILES: ProfileDef[] = [
  { id: 'paciente', icon: User, accent: 'secondary', moduleCount: 3 },
  { id: 'cuidador', icon: HeartHandshake, accent: 'primary', moduleCount: 4 },
  { id: 'agente', icon: MapPin, accent: 'secondary', moduleCount: 4 },
  { id: 'gestor', icon: BarChart3, accent: 'accent', moduleCount: 3 },
  { id: 'unidad', icon: Building2, accent: 'secondary', moduleCount: 3 },
  { id: 'comunidad', icon: Users, accent: 'primary', moduleCount: 4 },
]

export const getProfile = (id?: string): ProfileDef | undefined =>
  PROFILES.find((p) => p.id === id)

export const accentText: Record<Accent, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  accent: 'text-accent',
}

// Módulos ya implementados: enlazan a una ruta relativa a /p/:profileId.
// Se va completando a medida que avanzan las fases.
export const MODULE_LINKS: Partial<Record<ProfileId, Record<number, string>>> = {
  paciente: { 0: 'preconsulta' },
  agente: { 1: 'preconsulta' },
}
