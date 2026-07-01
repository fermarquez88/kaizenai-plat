import { useParams } from 'react-router-dom'
import { Brain, CalendarClock, ClipboardList, HeartHandshake, ListChecks, Stethoscope, UserPlus, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Tarjeta } from '../components/Tarjeta'

// Bienvenida "forma de comenzar" para el EQUIPO: cada perfil aterriza en SU tarea, no en la
// cola cruda. (decisión 2026-06-27: díada=Hilo, equipo=Cuaderno needs-first). Cada tarjeta
// lleva a un destino REAL ya funcional.
interface Card {
  icon: LucideIcon
  titulo: string
  sub: string
  seg: string // relativo a /p/:id
}
interface Cfg {
  titulo: string
  icon: LucideIcon
  /** verbo de la acción principal (mandar a evaluar directo). */
  accion: string
  /** qué carga este perfil al abrir el panel del paciente. */
  carga: string
  secundarios: Card[]
}

const COLA: Card = { icon: ListChecks, titulo: 'Cola de pendientes', sub: 'Señales que esperan acción', seg: 'alarmas' }
const GENTE: Card = { icon: Users, titulo: 'Mi gente', sub: 'Seguimiento y recontacto', seg: 'seguimiento' }
const AGENDA: Card = { icon: CalendarClock, titulo: 'Agenda', sub: 'Turnos y visitas', seg: 'agenda' }

const CONFIG: Record<string, Cfg> = {
  enfermeria: { titulo: 'Enfermería', icon: HeartHandshake, accion: 'Tomar signos vitales', carga: 'presión, peso, glucemia…', secundarios: [COLA, GENTE, AGENDA] },
  unidad: { titulo: 'Consultorio', icon: Stethoscope, accion: 'Atender a un paciente', carga: 'diagnóstico, informe, estudios', secundarios: [COLA, AGENDA] },
  neuropsico: { titulo: 'Neuropsicología', icon: Brain, accion: 'Evaluar a un paciente', carga: 'batería (normas El Castaño) → informe', secundarios: [COLA, GENTE] },
  social: { titulo: 'Trabajo social', icon: HeartHandshake, accion: 'Evaluación social', carga: 'situación social → gestiones', secundarios: [COLA, GENTE] },
}

export function EquipoHome() {
  const { profileId } = useParams()
  const pid = profileId ?? 'agente'
  const cfg = CONFIG[pid] ?? { titulo: 'Equipo', icon: ClipboardList, accion: 'Completar un paciente', carga: 'sus datos', secundarios: [COLA, GENTE, AGENDA] }
  const Icono = cfg.icon

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <p className="flex items-center gap-2 text-sm font-medium text-secondary"><Icono size={18} /> {cfg.titulo}</p>
      <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">¿Qué necesita hacer hoy?</h1>

      {/* Acción PRINCIPAL: completar a mano el bus del paciente */}
      <div className="mt-5">
        <Tarjeta icon={UserPlus} titulo={cfg.accion} sub={`Buscá por nombre o DNI (o cargá nueva) → ${cfg.carga}.`} to={`/p/${pid}/paciente`} variant="primary" flecha />
      </div>

      <p className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Otras vistas</p>
      <div className="space-y-2">
        {cfg.secundarios.map((c) => (
          <Tarjeta key={c.seg} icon={c.icon} titulo={c.titulo} sub={c.sub} to={`/p/${pid}/${c.seg}`} />
        ))}
      </div>
    </div>
  )
}
