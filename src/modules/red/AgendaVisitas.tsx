import { useTranslation } from 'react-i18next'
import { CalendarDays, MapPin } from 'lucide-react'
import { SEED_PERSONAS } from '../../seed/personas'

const VISITS = [
  { personaId: 'p1', day: 'hoy', kind: 'control' },
  { personaId: 'p2', day: 'hoy', kind: 'primera' },
  { personaId: 'p3', day: 'manana', kind: 'seguimiento' },
  { personaId: 'p4', day: 'manana', kind: 'control' },
  { personaId: 'p6', day: 'semana', kind: 'seguimiento' },
]

export function AgendaVisitas() {
  const { t } = useTranslation()
  const find = (id: string) => SEED_PERSONAS.find((p) => p.id === id)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="flex items-center gap-2 font-serif text-2xl text-ink sm:text-3xl">
        <CalendarDays className="text-secondary" aria-hidden /> {t('agenda.title')}
      </h1>
      <p className="mt-1 text-sm text-muted">{t('red.seedNote')}</p>
      <ul className="mt-5 space-y-3">
        {VISITS.map((v, i) => {
          const p = find(v.personaId)
          if (!p) return null
          return (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4"
            >
              <div>
                <p className="flex items-center gap-1 font-medium text-ink">
                  <MapPin size={14} className="text-muted" aria-hidden /> {p.alias}
                </p>
                <p className="mt-0.5 text-sm text-muted">{t(`agenda.kind.${v.kind}`)}</p>
              </div>
              <span className="shrink-0 rounded-full border border-line bg-bg px-2.5 py-1 text-xs text-secondary-text">
                {t(`agenda.day.${v.day}`)}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
