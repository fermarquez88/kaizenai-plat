import { useTranslation } from 'react-i18next'
import { MessageCircle, TriangleAlert, Users } from 'lucide-react'
import { PRIORITY, SEED_PERSONAS } from '../../seed/personas'
import { ESTADO_ORDEN, estadoSeguimiento, type SeguimientoEstado } from '../../scoring/retention'
import { waMeLink } from '../../channel/ChannelAdapter'
import type { TriageLevel } from '../../scoring/triage'

const ESTADO_CHIP: Record<SeguimientoEstado, string> = {
  novolvio: 'border border-rojo bg-rojo/10 text-rojo-text',
  porvencer: 'border border-amarillo bg-amarillo/10 text-accent-text',
  aldia: 'border border-verde bg-verde/10 text-verde-text',
}
const LEVEL_TXT: Record<TriageLevel, string> = {
  verde: 'text-verde-text',
  amarillo: 'text-accent-text',
  rojo: 'text-rojo-text',
}

function Kpi({ label, value, cls }: { label: string; value: string; cls?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-0.5 font-serif text-2xl ${cls ?? 'text-ink'}`}>{value}</p>
    </div>
  )
}

export function Seguimiento() {
  const { t } = useTranslation()

  const people = [...SEED_PERSONAS].sort((a, b) => {
    const ea = estadoSeguimiento(a.lastSeenDays)
    const eb = estadoSeguimiento(b.lastSeenDays)
    return ESTADO_ORDEN[ea] - ESTADO_ORDEN[eb] || PRIORITY[a.level] - PRIORITY[b.level]
  })
  const total = people.length
  const novolvio = people.filter((p) => estadoSeguimiento(p.lastSeenDays) === 'novolvio').length
  const pctSeguimiento = Math.round(((total - novolvio) / total) * 100)
  const conCuidador = people.filter((p) => p.cuidador).length

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-serif text-2xl text-ink sm:text-3xl">{t('seguimiento.title')}</h1>
      <p className="mt-1 text-sm text-muted">{t('seguimiento.intro')}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label={t('seguimiento.kpi.total')} value={String(total)} />
        <Kpi label={t('seguimiento.kpi.seguimiento')} value={`${pctSeguimiento}%`} cls="text-verde-text" />
        <Kpi label={t('seguimiento.kpi.novolvio')} value={String(novolvio)} cls="text-rojo-text" />
        <Kpi label={t('seguimiento.kpi.diada')} value={String(conCuidador)} />
      </div>
      <p className="mt-2 text-xs text-muted">{t('red.seedNote')}</p>

      <ul className="mt-5 space-y-3">
        {people.map((p) => {
          const est = estadoSeguimiento(p.lastSeenDays)
          return (
            <li key={p.id} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">
                    {p.alias}{' '}
                    <span className={`text-xs ${LEVEL_TXT[p.level]}`}>
                      · {t(`triage.level.${p.level}`).split(' — ')[0]}
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {t('seguimiento.hace', { n: p.lastSeenDays })}
                    {p.cuidador ? ` · ${t('seguimiento.cuidador', { c: p.cuidador })}` : ''}
                  </p>
                  {p.discrepancia && (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-accent-text">
                      <TriangleAlert size={12} /> {t('seguimiento.discrepancia')}
                    </p>
                  )}
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${ESTADO_CHIP[est]}`}>
                  {t(`seguimiento.estado.${est}`)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={waMeLink(p.phone, t('seguimiento.msg', { alias: p.alias }))}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-white"
                >
                  <MessageCircle size={16} /> {t('seguimiento.recontact')}
                </a>
                {p.cuidador && (
                  <a
                    href={waMeLink(p.phone, t('seguimiento.msgCuidador'))}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink"
                  >
                    <Users size={16} /> {t('seguimiento.contactCuidador')}
                  </a>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
