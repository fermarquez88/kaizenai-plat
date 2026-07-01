import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertOctagon, AlertTriangle, CalendarCheck, CheckCircle2 } from 'lucide-react'
import { dexieRepo } from '../../data/dexieRepo'
import { useSettings } from '../../lib/store'
import { cidiTurnoLink } from '../../data/sanjuan'
import { LeerVoz } from '../../components/LeerVoz'
import type { PreAssessmentSummary, TriageLevel } from '../../data/types'

const STYLE: Record<TriageLevel, string> = {
  verde: 'border-verde bg-verde/10 text-verde-text',
  amarillo: 'border-amarillo bg-amarillo/10 text-ink',
  rojo: 'border-rojo bg-rojo/10 text-rojo-text',
}

function LevelIcon({ level }: { level: TriageLevel }) {
  if (level === 'verde') return <CheckCircle2 size={28} aria-hidden />
  if (level === 'amarillo') return <AlertTriangle size={28} aria-hidden />
  return <AlertOctagon size={28} aria-hidden />
}

export function MiResultado() {
  const { t } = useTranslation()
  const [a, setA] = useState<PreAssessmentSummary | null | undefined>(undefined)
  const [history, setHistory] = useState<PreAssessmentSummary[]>([])
  const selfPersonId = useSettings((s) => s.selfPersonId)
  const ensureSelfPersonId = useSettings((s) => s.ensureSelfPersonId)

  const load = useCallback(
    () =>
      dexieRepo.listPreAssessments().then((list) => {
        const mine = selfPersonId ? list.filter((x) => x.personId === selfPersonId) : list
        const sorted = [...mine].sort((x, y) => x.createdAt - y.createdAt)
        setHistory(sorted)
        setA(sorted.length ? sorted[sorted.length - 1] : null)
      }),
    [selfPersonId],
  )

  useEffect(() => {
    void load()
  }, [load])

  const verEjemplo = async () => {
    await dexieRepo.savePreAssessment({
      id: crypto.randomUUID(),
      personId: ensureSelfPersonId(),
      createdAt: Date.now(),
      modifiableRiskIndex: 0.4,
      riskPct: 22,
      mrcaBand: 'moderado',
      triage: 'amarillo',
    })
    await load()
  }

  if (a === undefined) {
    return (
      <div role="status" className="mx-auto max-w-2xl px-4 py-8 text-muted">
        {t('common.loading')}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-serif text-2xl text-ink sm:text-3xl">{t('mi.title')}</h1>

      {!a || !a.triage ? (
        <div className="mt-5 rounded-2xl border border-line bg-surface p-5">
          <p className="text-ink">{t('mi.empty')}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to="/p/paciente/preconsulta"
              className="inline-block rounded-xl bg-primary px-4 py-2.5 font-medium text-white"
            >
              {t('mi.start')}
            </Link>
            <button
              onClick={verEjemplo}
              className="inline-block rounded-xl border border-line bg-surface px-4 py-2.5 text-ink hover:bg-bg"
            >
              {t('mi.example')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            role="status"
            aria-label={`${t('triage.levelLabel')}: ${t(`triage.level.${a.triage}`)}`}
            className={`mt-5 flex items-center gap-3 rounded-2xl border p-5 ${STYLE[a.triage]}`}
          >
            <LevelIcon level={a.triage} />
            <div>
              <p className="text-xs uppercase tracking-wide opacity-80">{t('triage.levelLabel')}</p>
              <p className="font-serif text-2xl">{t(`triage.level.${a.triage}`)}</p>
            </div>
          </div>
          <section className="mt-3 rounded-2xl border border-line bg-surface p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t('triage.meaningTitle')}</h2>
              <LeerVoz texto={`${t(`triage.meaning.${a.triage}`)}. ${t(`triage.action.${a.triage}`)}`} className="shrink-0" />
            </div>
            <p className="mt-2 text-lg text-ink">{t(`triage.meaning.${a.triage}`)}</p>
            <p className="mt-3 text-sm text-muted">{t('triage.disclaimerShort')}</p>
          </section>
          <p className="mt-3 rounded-xl border border-line bg-surface p-3 text-ink">
            {t(`triage.action.${a.triage}`)}
          </p>
          <a
            href={cidiTurnoLink(t(`triage.level.${a.triage}`))}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-white sm:w-auto"
          >
            <CalendarCheck size={18} /> {t('triage.turno')}
          </a>
          <p className="mt-3 text-sm text-muted">
            {t('mi.savedAt', { date: new Date(a.createdAt).toLocaleDateString('es-AR') })}
          </p>
          <Link
            to="/p/paciente/preconsulta"
            className="mt-4 inline-block rounded-xl border border-line bg-surface px-4 py-2 text-ink hover:bg-bg"
          >
            {t('mi.again')}
          </Link>

          {history.length > 1 && (
            <section className="mt-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                {t('mi.historyTitle')}
              </h2>
              <ul className="space-y-2">
                {[...history].reverse().map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center justify-between rounded-xl border border-line bg-surface p-3 text-sm"
                  >
                    <span className="text-muted">{new Date(h.createdAt).toLocaleDateString('es-AR')}</span>
                    <span className="text-ink">
                      {h.triage ? t(`triage.level.${h.triage}`).split(' — ')[0] : '—'}
                      {h.mrcaBand ? ` · ${t(`pre.mrca.band.${h.mrcaBand}`)}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted">{t('mi.historyNote')}</p>
            </section>
          )}
        </>
      )}

      <p className="mt-6 text-xs text-muted">{t('triage.disclaimer')}</p>
    </div>
  )
}
