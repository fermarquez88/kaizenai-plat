import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertOctagon, AlertTriangle, CheckCircle2, Download, FileJson, Printer } from 'lucide-react'
import { usePreconsulta } from '../preconsultaStore'
import { buildSummary, toFhirBundle, type PreconsultaSummary } from '../../../data/preconsultaSummary'
import { downloadJSON } from '../../../lib/download'
import { dexieRepo } from '../../../data/dexieRepo'
import type { TriageLevel } from '../../../scoring/triage'

const LEVEL_STYLE: Record<TriageLevel, string> = {
  verde: 'border-verde bg-verde/10 text-verde-text',
  amarillo: 'border-amarillo bg-amarillo/10 text-accent-text',
  rojo: 'border-rojo bg-rojo/10 text-rojo-text',
}

function LevelIcon({ level, size }: { level: TriageLevel; size: number }) {
  if (level === 'verde') return <CheckCircle2 size={size} aria-hidden />
  if (level === 'amarillo') return <AlertTriangle size={size} aria-hidden />
  return <AlertOctagon size={size} aria-hidden />
}

export function ResultadoStep() {
  const { t } = useTranslation()
  const { demo, lancet, instruments, meds, redFlags } = usePreconsulta()

  const summary = useMemo<PreconsultaSummary>(
    () => buildSummary({ demo, lancet, instruments, meds, redFlags }, new Date().toISOString()),
    [demo, lancet, instruments, meds, redFlags],
  )

  const saved = useRef(false)
  useEffect(() => {
    if (saved.current) return
    saved.current = true
    dexieRepo
      .savePreAssessment({
        id: crypto.randomUUID(),
        personId: 'anon',
        createdAt: Date.now(),
        modifiableRiskIndex: summary.modifiableRiskShare,
        mrcaBand: summary.mrcaBand,
        triage: summary.triageLevel,
      })
      .catch(() => {})
  }, [summary])

  const level = summary.triageLevel

  return (
    <div>
      <div className={`flex items-center gap-3 rounded-2xl border p-5 ${LEVEL_STYLE[level]}`}>
        <LevelIcon level={level} size={28} />
        <div>
          <p className="text-xs uppercase tracking-wide opacity-80">{t('triage.levelLabel')}</p>
          <p className="font-serif text-2xl">{t(`triage.level.${level}`)}</p>
        </div>
      </div>
      <p className="mt-3 rounded-xl border border-line bg-surface p-3 text-ink">
        {t(`triage.action.${level}`)}
      </p>

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          {t('triage.why')}
        </h2>
        <ul className="space-y-1 text-sm text-ink">
          {summary.triageReasons.map((r) => (
            <li key={r} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
              {t(`triage.reasons.${r}`)}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <Stat label={t('triage.stats.risk')} value={`~${summary.modifiableRiskPct}%`} />
        <Stat
          label={t('triage.stats.mrca')}
          value={`${t(`pre.mrca.band.${summary.mrcaBand}`)} · ${Math.round(summary.mrcaProb * 100)}%`}
        />
        <Stat label={t('triage.stats.meds')} value={String(summary.medFlags.count)} />
        <Stat label={t('triage.stats.redflags')} value={String(summary.redFlags.length)} />
      </section>

      {summary.instrumentScores.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            {t('triage.instruments')}
          </h2>
          <ul className="space-y-2">
            {summary.instrumentScores.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3 text-sm"
              >
                <span className="text-ink">{s.name}</span>
                <span className="text-muted">{s.text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 no-print">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          {t('triage.export.title')}
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => downloadJSON('preconsulta.json', summary)}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-ink hover:bg-bg"
          >
            <FileJson size={18} /> {t('triage.export.json')}
          </button>
          <button
            onClick={() => downloadJSON('preconsulta-fhir.json', toFhirBundle(summary))}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-ink hover:bg-bg"
          >
            <Download size={18} /> {t('triage.export.fhir')}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-ink hover:bg-bg"
          >
            <Printer size={18} /> {t('triage.export.print')}
          </button>
        </div>
      </section>

      <p className="mt-5 text-xs text-muted">
        {t('pre.mrca.modelNote')}
        {summary.mrcaPreliminary && (
          <span className="ml-1 rounded-full border border-line bg-bg px-2 py-0.5">
            {t('pre.mrca.preliminary')}
          </span>
        )}
      </p>
      <p className="mt-2 text-xs text-muted">{t('triage.disclaimer')}</p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 font-medium text-ink">{value}</p>
    </div>
  )
}
