import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertOctagon, AlertTriangle, CalendarCheck, CheckCircle2 } from 'lucide-react'
import { dexieRepo } from '../../data/dexieRepo'
import { cidiTurnoLink } from '../../data/sanjuan'
import type { PreAssessmentSummary, TriageLevel } from '../../data/types'

const STYLE: Record<TriageLevel, string> = {
  verde: 'border-verde bg-verde/10 text-verde-text',
  amarillo: 'border-amarillo bg-amarillo/10 text-accent-text',
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

  const load = () =>
    dexieRepo.listPreAssessments().then((list) => setA(list.length ? list[list.length - 1] : null))

  useEffect(() => {
    void load()
  }, [])

  const verEjemplo = async () => {
    await dexieRepo.savePreAssessment({
      id: crypto.randomUUID(),
      personId: 'demo',
      createdAt: Date.now(),
      modifiableRiskIndex: 0.4,
      mrcaBand: 'moderado',
      triage: 'amarillo',
    })
    await load()
  }

  if (a === undefined) {
    return <div className="mx-auto max-w-2xl px-4 py-8 text-muted">…</div>
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
          <div className={`mt-5 flex items-center gap-3 rounded-2xl border p-5 ${STYLE[a.triage]}`}>
            <LevelIcon level={a.triage} />
            <div>
              <p className="text-xs uppercase tracking-wide opacity-80">{t('triage.levelLabel')}</p>
              <p className="font-serif text-2xl">{t(`triage.level.${a.triage}`)}</p>
            </div>
          </div>
          <p className="mt-3 rounded-xl border border-line bg-surface p-3 text-ink">
            {t(`triage.action.${a.triage}`)}
          </p>
          <a
            href={cidiTurnoLink(t(`triage.level.${a.triage}`))}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-medium text-white"
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
        </>
      )}

      <p className="mt-6 text-xs text-muted">{t('triage.disclaimer')}</p>
    </div>
  )
}
