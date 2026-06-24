import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { Check, ClipboardCheck, ListChecks, MessageCircle, Users } from 'lucide-react'
import { useRedRecords } from '../modules/red/redRecords'
import { dexieRepo } from '../data/dexieRepo'
import { waMeLink } from '../channel/ChannelAdapter'
import type { SeguimientoEstado } from '../scoring/retention'

// WORKSPACE DEL PROMOTOR (producción, task-first / registry-first à la OpenSRP/CHT):
// no es un menú de módulos, es "qué hacés hoy" + "tu gente". El rol no se elige:
// el promotor ya ESTÁ en su espacio.
const ESTADO_CHIP: Record<SeguimientoEstado, string> = {
  novolvio: 'border border-rojo bg-rojo/10 text-rojo-text',
  porvencer: 'border border-amarillo bg-amarillo/10 text-ink',
  aldia: 'border border-verde bg-verde/10 text-verde-text',
}

function Kpi({ label, value, cls }: { label: string; value: string; cls?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3 text-center">
      <p className={`font-serif text-2xl ${cls ?? 'text-ink'}`}>{value}</p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  )
}

export function PromotorHome() {
  const { t } = useTranslation()
  const { profileId } = useParams()
  const pid = profileId ?? 'agente'
  const { records, reload } = useRedRecords()

  const tareas = [...records]
    .filter((r) => r.estado !== 'aldia')
    .sort(
      (a, b) =>
        (a.estado === 'novolvio' ? 0 : 1) - (b.estado === 'novolvio' ? 0 : 1) ||
        b.daysSinceContact - a.daysSinceContact,
    )
  const total = records.length
  const porvencer = records.filter((r) => r.estado === 'porvencer').length
  const novolvio = records.filter((r) => r.estado === 'novolvio').length

  const registrar = (id: string) => dexieRepo.logContact(id, { at: Date.now(), channel: 'whatsapp' }).then(reload)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-serif text-2xl text-ink sm:text-3xl">{t('promotor.title')}</h1>
      <p className="mt-1 text-muted">{t('promotor.subtitle')}</p>

      {/* Acción principal: cribar en terreno */}
      <Link
        to={`/p/${pid}/preconsulta`}
        className="mt-5 flex items-center gap-3 rounded-2xl bg-primary p-5 font-medium text-white shadow-card"
      >
        <ClipboardCheck size={24} aria-hidden />
        <span>
          <span className="block text-lg">{t('promotor.cribar')}</span>
          <span className="block text-sm opacity-90">{t('promotor.cribarSub')}</span>
        </span>
      </Link>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Kpi label={t('seguimiento.kpi.total')} value={String(total)} />
        <Kpi label={t('seguimiento.estado.porvencer')} value={String(porvencer)} cls="text-accent-text" />
        <Kpi label={t('seguimiento.kpi.novolvio')} value={String(novolvio)} cls="text-rojo-text" />
      </div>

      <h2 className="mt-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
        <ListChecks size={16} aria-hidden /> {t('promotor.paraHoy')}
      </h2>

      {tareas.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-line bg-surface p-5 text-muted">{t('promotor.empty')}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {tareas.map((r) => (
            <li
              key={r.id}
              className={'rounded-xl border bg-surface p-4 ' + (r.demo ? 'border-dashed border-line' : 'border-line')}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">
                    {r.alias}
                    {r.demo && (
                      <span className="ml-2 rounded-full border border-line bg-bg px-2 py-0.5 text-[11px] text-muted">
                        {t('red.demoTag')}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">{t('seguimiento.hace', { n: r.daysSinceContact })}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${ESTADO_CHIP[r.estado]}`}>
                  {t(`seguimiento.estado.${r.estado}`)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {r.phone && (
                  <a
                    href={waMeLink(r.phone, t('seguimiento.msg', { alias: r.alias }))}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-white"
                  >
                    <MessageCircle size={16} /> {t('seguimiento.recontact')}
                  </a>
                )}
                {!r.demo && (
                  <button
                    onClick={() => registrar(r.id)}
                    className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink hover:bg-bg"
                  >
                    <Check size={16} /> {t('seguimiento.registrar')}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link to={`/p/${pid}/seguimiento`} className="inline-flex items-center gap-2 text-secondary-text hover:underline">
          <Users size={16} aria-hidden /> {t('promotor.todaMiGente')}
        </Link>
        <Link to={`/p/${pid}/red/cola`} className="inline-flex items-center gap-2 text-secondary-text hover:underline">
          <ListChecks size={16} aria-hidden /> {t('promotor.cola')}
        </Link>
      </div>
    </div>
  )
}
