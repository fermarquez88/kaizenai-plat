import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Activity, Brain, CalendarClock, ClipboardList, FileText, HeartHandshake, Inbox, ListChecks, Stethoscope, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Bienvenida "forma de comenzar" para el EQUIPO: cada perfil aterriza en SU tarea, no en la
// cola cruda. (decisión 2026-06-27: díada=Hilo, equipo=Cuaderno needs-first). Cada tarjeta
// lleva a un destino REAL ya funcional.
interface Card {
  icon: LucideIcon
  titulo: string
  sub: string
  seg: string // relativo a /p/:id
  primary?: boolean
}
interface Cfg {
  titulo: string
  sub: string
  cards: Card[]
}

const COLA: Card = { icon: ListChecks, titulo: 'Pendientes (cola)', sub: 'Lo que está esperando acción, priorizado', seg: 'alarmas' }
const GENTE: Card = { icon: Users, titulo: 'Mi gente', sub: 'Tu lista para seguimiento y recontacto', seg: 'seguimiento' }
const AGENDA: Card = { icon: CalendarClock, titulo: 'Agenda', sub: 'Turnos y visitas', seg: 'agenda' }

const CONFIG: Record<string, Cfg> = {
  enfermeria: {
    titulo: 'Enfermería',
    sub: 'Tomá signos vitales y acompañá en la sala de espera.',
    cards: [
      { icon: Activity, titulo: 'Tomar signos vitales', sub: 'Elegí a quién atender → cargá presión, peso, glucemia…', seg: 'seguimiento', primary: true },
      COLA,
      AGENDA,
    ],
  },
  unidad: {
    titulo: 'Consultorio',
    sub: 'Tu bandeja del día, la cola y los estudios/derivaciones a pedir.',
    cards: [
      { icon: Inbox, titulo: 'Bandeja del día', sub: 'Pacientes a ver hoy', seg: 'red/bandeja', primary: true },
      COLA,
      { icon: FileText, titulo: 'Informe / constancia', sub: 'Generar documento para el paciente', seg: 'informe-doc' },
      AGENDA,
    ],
  },
  neuropsico: {
    titulo: 'Neuropsicología',
    sub: 'Pacientes a evaluar → batería (normas El Castaño) → informe.',
    cards: [
      { icon: Brain, titulo: 'Pendientes de evaluación', sub: 'Abrí la ficha → batería → informe', seg: 'alarmas', primary: true },
      GENTE,
    ],
  },
  social: {
    titulo: 'Trabajo social',
    sub: 'Pedidos → evaluación social → gestión de derechos.',
    cards: [
      { icon: HeartHandshake, titulo: 'Pedidos de trabajo social', sub: 'Abrí la ficha → evaluación → gestiones', seg: 'alarmas', primary: true },
      GENTE,
    ],
  },
}

const ICONO_PERFIL: Record<string, LucideIcon> = { enfermeria: Activity, unidad: Stethoscope, neuropsico: Brain, social: HeartHandshake }

export function EquipoHome() {
  const { profileId } = useParams()
  const pid = profileId ?? 'agente'
  const cfg = CONFIG[pid] ?? { titulo: 'Equipo', sub: 'Tu trabajo de hoy.', cards: [COLA, GENTE, AGENDA] }
  const Icono = ICONO_PERFIL[pid] ?? ClipboardList

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <p className="flex items-center gap-2 text-sm font-medium text-secondary"><Icono size={18} /> {cfg.titulo}</p>
      <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">¿Qué necesita hacer hoy?</h1>
      <p className="mt-1 text-muted">{cfg.sub}</p>

      <div className="mt-5 space-y-3">
        {cfg.cards.map((c) => {
          const Icon = c.icon
          return (
            <Link
              key={c.seg + c.titulo}
              to={`/p/${pid}/${c.seg}`}
              className={
                'flex items-center gap-3 rounded-2xl border p-4 transition hover:-translate-y-0.5 ' +
                (c.primary ? 'border-transparent bg-primary text-white shadow-card' : 'border-line bg-surface hover:border-secondary')
              }
            >
              <span className={'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ' + (c.primary ? 'bg-white/20 text-white' : 'border border-line bg-bg text-secondary')}>
                <Icon size={22} />
              </span>
              <span>
                <span className={'block font-medium ' + (c.primary ? 'text-white' : 'text-ink')}>{c.titulo}</span>
                <span className={'block text-sm ' + (c.primary ? 'text-white/90' : 'text-muted')}>{c.sub}</span>
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
