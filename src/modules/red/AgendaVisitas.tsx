import { useTranslation } from 'react-i18next'
import { CalendarCheck, CalendarDays, Clock, MapPin, X } from 'lucide-react'
import { useRedRecords } from './redRecords'
import { turnosProximos, useTurnos } from './turnosStore'

// Agenda DERIVADA de datos reales: a quién hay que ir a ver (seguimiento por vencer
// o que no volvió) + los TURNOS agendados por el equipo. Refleja el estado real de la red.
const hoyISO = () => new Date().toISOString().slice(0, 10)

export function AgendaVisitas() {
  const { t } = useTranslation()
  const { records } = useRedRecords()
  const turnos = useTurnos((s) => s.turnos)
  const cancelar = useTurnos((s) => s.cancelar)
  const proximos = turnosProximos(turnos, hoyISO())

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

      {proximos.length > 0 && (
        <section className="mt-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted"><CalendarCheck size={16} /> Turnos agendados</h2>
          <ul className="mt-2 space-y-2">
            {proximos.map((tr) => (
              <li key={tr.id} className="flex items-start justify-between gap-3 rounded-xl border border-secondary/40 bg-secondary/5 p-3">
                <div>
                  <p className="font-medium text-ink">{tr.alias}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-muted">
                    <span className="inline-flex items-center gap-1"><Clock size={13} /> {new Date(tr.fecha + 'T00:00').toLocaleDateString('es-AR')}{tr.hora ? ` · ${tr.hora}` : ''}</span>
                    {tr.lugar && <span className="inline-flex items-center gap-1"><MapPin size={13} /> {tr.lugar}</span>}
                  </p>
                  {tr.nota && <p className="mt-0.5 text-sm text-ink">{tr.nota}</p>}
                </div>
                <button onClick={() => cancelar(tr.id)} aria-label="Cancelar turno" className="shrink-0 rounded-lg border border-line p-1.5 text-muted hover:text-rojo-text"><X size={15} /></button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted">A quién ir a ver</h2>
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
