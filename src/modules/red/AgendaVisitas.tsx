import { useTranslation } from 'react-i18next'
import { CalendarDays, MapPin } from 'lucide-react'
import { useRedRecords } from './redRecords'

// Agenda DERIVADA de datos reales: a quién hay que ir a ver (seguimiento por vencer
// o que no volvió). Deja de ser una lista fija: refleja el estado real de la red.
export function AgendaVisitas() {
  const { t } = useTranslation()
  const { records } = useRedRecords()

  const due = records
    .filter((p) => p.estado !== 'aldia')
    .sort(
      (a, b) =>
        (a.estado === 'novolvio' ? 0 : 1) - (b.estado === 'novolvio' ? 0 : 1) ||
        b.daysSinceContact - a.daysSinceContact,
    )

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="flex items-center gap-2 font-serif text-2xl text-ink sm:text-3xl">
        <CalendarDays className="text-secondary" aria-hidden /> {t('agenda.title')}
      </h1>
      <p className="mt-1 text-sm text-muted">{t('agenda.intro')}</p>

      {due.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-line bg-surface p-5 text-muted">{t('agenda.empty')}</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {due.map((p) => (
            <li
              key={p.id}
              className={
                'flex items-center justify-between gap-3 rounded-xl border bg-surface p-4 ' +
                (p.demo ? 'border-dashed border-line' : 'border-line')
              }
            >
              <div>
                <p className="flex items-center gap-1 font-medium text-ink">
                  <MapPin size={14} className="text-muted" aria-hidden /> {p.alias}
                  {p.demo && (
                    <span className="ml-1 rounded-full border border-line bg-bg px-2 py-0.5 text-[11px] text-muted">
                      {t('red.demoTag')}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-sm text-muted">{t('seguimiento.hace', { n: p.daysSinceContact })}</p>
              </div>
              <span
                className={
                  'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ' +
                  (p.estado === 'novolvio'
                    ? 'border border-rojo bg-rojo/10 text-rojo-text'
                    : 'border border-amarillo bg-amarillo/10 text-ink')
                }
              >
                {t(`seguimiento.estado.${p.estado}`)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
