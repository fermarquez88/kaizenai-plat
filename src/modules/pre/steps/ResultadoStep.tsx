import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertOctagon,
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Download,
  FileJson,
  Phone,
  Printer,
} from 'lucide-react'
import { usePreconsulta } from '../preconsultaStore'
import { buildSummary, toFhirBundle, type PreconsultaSummary } from '../../../data/preconsultaSummary'
import { downloadJSON } from '../../../lib/download'
import { dexieRepo } from '../../../data/dexieRepo'
import { cidiTurnoLink, guardiaDe } from '../../../data/sanjuan'
import type { TriageLevel } from '../../../scoring/triage'

// Amarillo usa text-ink (no text-accent-text) por contraste WCAG sobre bg-amarillo/10.
const LEVEL_STYLE: Record<TriageLevel, string> = {
  verde: 'border-verde bg-verde/10 text-verde-text',
  amarillo: 'border-amarillo bg-amarillo/10 text-ink',
  rojo: 'border-rojo bg-rojo/10 text-rojo-text',
}

function LevelIcon({ level, size }: { level: TriageLevel; size: number }) {
  if (level === 'verde') return <CheckCircle2 size={size} aria-hidden />
  if (level === 'amarillo') return <AlertTriangle size={size} aria-hidden />
  return <AlertOctagon size={size} aria-hidden />
}

// Barra de posición SÓLO para índices con rango publicado (LIBRA, CAIDE).
function ScoreBar({ min, max, value }: { min: number; max: number; value: number }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  return (
    <div className="mt-2" aria-hidden>
      <div className="relative h-2 rounded-full bg-line">
        <div className="absolute inset-y-0 left-0 rounded-full bg-secondary/40" style={{ width: `${pct}%` }} />
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-secondary bg-surface"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

export function ResultadoStep() {
  const { t } = useTranslation()
  const { demo, lancet, instruments, factores, meds, redFlags } = usePreconsulta()

  const summary = useMemo<PreconsultaSummary>(
    () => buildSummary({ demo, lancet, instruments, factores, meds, redFlags }, new Date().toISOString()),
    [demo, lancet, instruments, factores, meds, redFlags],
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
  const nFactores = summary.presentFactors.length
  const ejemplos = summary.presentFactors
    .slice(0, 3)
    .map((id) => t(`factors.${id}.label`))
    .join(', ')

  return (
    <div>
      {/* 1 · Resultado (color + palabra) */}
      <div
        role="status"
        aria-label={`${t('triage.levelLabel')}: ${t(`triage.level.${level}`)}`}
        className={`flex items-center gap-3 rounded-2xl border p-5 ${LEVEL_STYLE[level]}`}
      >
        <LevelIcon level={level} size={28} />
        <div>
          <p className="text-xs uppercase tracking-wide opacity-80">{t('triage.levelLabel')}</p>
          <p className="font-serif text-2xl">{t(`triage.level.${level}`)}</p>
        </div>
      </div>

      {/* 2 · Qué significa (lenguaje claro) */}
      <section className="mt-3 rounded-2xl border border-line bg-surface p-5 shadow-card">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t('triage.meaningTitle')}</h2>
        <p className="mt-2 text-lg text-ink">{t(`triage.meaning.${level}`)}</p>
        <p className="mt-3 text-sm text-muted">{t('triage.disclaimerShort')}</p>
      </section>

      {/* 3 · Señales urgentes (si hay) */}
      {summary.redFlags.length > 0 && (
        <div className="mt-3 rounded-2xl border border-rojo bg-rojo/10 p-4 text-rojo-text">
          <p className="flex items-center gap-2 font-medium">
            <AlertOctagon size={18} /> {t('triage.urgent.title')}
          </p>
          <p className="mt-1 text-sm">{t('triage.urgent.donde', { guardia: guardiaDe(summary.depto) })}</p>
          <a
            href="tel:107"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-rojo px-4 py-3 font-medium text-white"
          >
            <Phone size={18} /> {t('triage.urgent.call')}
          </a>
        </div>
      )}

      {/* 4 · Qué hago ahora */}
      <section className="mt-3 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t('triage.nextStepTitle')}</h2>
        <p className="mt-2 text-ink">{t(`triage.action.${level}`)}</p>
        <a
          href={cidiTurnoLink(t(`triage.level.${level}`))}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-white sm:w-auto no-print"
        >
          <CalendarCheck size={18} /> {t('triage.turno')}
        </a>
      </section>

      {/* 5 · Por qué */}
      <section className="mt-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{t('triage.why')}</h2>
        <ul className="space-y-1 text-sm text-ink">
          {summary.triageReasons.map((r) => (
            <li key={r} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
              {t(`triage.reasons.${r}`)}
            </li>
          ))}
        </ul>
      </section>

      {/* 6 · Contexto del acompañamiento (equidad) */}
      {summary.equityFactors.length > 0 && (
        <section className="mt-5 rounded-2xl border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t('equity.title')}</h2>
          <p className="mt-2 text-sm text-ink">{t('equity.intro')}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {summary.equityFactors.map((f) => (
              <span key={f} className="rounded-full border border-line bg-bg px-2.5 py-1 text-xs text-ink">
                {t(`equity.factors.${f}`)}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">{t('equity.note')}</p>
        </section>
      )}

      {/* 7 · Tus números, en claro */}
      <section className="mt-5 space-y-3">
        {/* Cosas que podés mejorar */}
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-ink">{t('triage.stats.risk')}</p>
            <p className="font-serif text-xl text-ink">{t('triage.stats.riskValue', { n: nFactores })}</p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-line" aria-hidden>
            <div className="h-full rounded-full bg-secondary/60" style={{ width: `${(nFactores / 14) * 100}%` }} />
          </div>
          <p className="mt-2 text-sm text-ink">
            {nFactores > 0 ? t('triage.factorsExplain', { n: nFactores, ejemplos }) : t('triage.factorsExplainNone')}
          </p>
        </div>

        {/* Riesgo estimado de memoria (palabra, no porcentaje) */}
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-ink">{t('triage.stats.mrca')}</p>
            <p className="font-serif text-xl capitalize text-ink">{t(`pre.mrca.band.${summary.mrcaBand}`)}</p>
          </div>
          <p className="mt-2 text-sm text-ink">{t(`triage.mrcaBandExplain.${summary.mrcaBand}`)}</p>
        </div>

        {/* Medicación + señales */}
        <div className="grid grid-cols-2 gap-3">
          <Stat label={t('triage.stats.meds')} value={String(summary.medFlags.count)} />
          <Stat label={t('triage.stats.redflags')} value={String(summary.redFlags.length)} />
        </div>
      </section>

      {/* 8 · Tus respuestas en detalle */}
      {summary.instrumentScores.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{t('triage.instruments')}</h2>
          <ul className="space-y-2">
            {summary.instrumentScores.map((s) => (
              <li key={s.id} className="rounded-xl border border-line bg-surface p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink">{t(`triage.instrumentsPlain.${s.id}`, s.name)}</span>
                  <span className="text-[11px] text-muted" title={s.name}>
                    {s.name}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted">{s.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">{t('triage.instrumentsSkipped')}</p>
        </section>
      )}

      {/* 9 · Para el profesional */}
      <details className="mt-6 rounded-2xl border border-line bg-surface p-4">
        <summary className="flex cursor-pointer items-center justify-between gap-2 font-semibold text-ink">
          {t('pro.title')}
          <ChevronDown size={18} className="text-muted" aria-hidden />
        </summary>

        {/* 9a · Resumen ejecutivo */}
        <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted">{t('pro.secResumen')}</h3>
        <p className="mt-2 text-sm text-ink">
          {t(`triage.level.${level}`)} · {t('pre.mrca.band.' + summary.mrcaBand)} ·{' '}
          {t('triage.stats.riskValue', { n: nFactores })}
        </p>
        <p className="mt-1 text-xs text-muted">{t('pro.mrcaValidation')}</p>

        {/* 9b · Modelo MRCA (detalle técnico) */}
        <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted">{t('pro.secMrca')}</h3>
        <p className="mt-2 rounded-xl bg-bg p-3 text-xs text-muted">{t('pro.mrcaTitle')}</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Stat label="ACE est." value={String(summary.mrcaAceEst)} />
          <Stat label={t('pro.cut')} value={String(summary.mrcaCut)} />
          <Stat
            label={t('pro.margin')}
            value={String(Math.round((summary.mrcaAceEst - summary.mrcaCut) * 10) / 10)}
          />
          <Stat
            label={t('pro.prob')}
            value={`${Math.round(summary.mrcaProb * 100)}% / ${Math.round(summary.mrcaThreshold * 100)}%`}
          />
          <Stat label={t('pro.decision')} value={summary.mrcaDecision} />
          <Stat label="MRCA" value={t(`pre.mrca.band.${summary.mrcaBand}`)} />
        </div>

        {summary.mrcaContribs.length > 0 && (
          <>
            <h4 className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">{t('pro.contribs')}</h4>
            <ul className="mt-2 space-y-1 text-sm">
              {summary.mrcaContribs.map((c) => (
                <li key={c.feature} className="flex items-center justify-between gap-3">
                  <span className="text-ink">{c.label}</span>
                  <span className={c.value < 0 ? 'text-rojo-text' : 'text-verde-text'}>
                    {c.value > 0 ? '+' : ''}
                    {c.value}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-1 text-xs text-muted">{t('pro.contribsNote')}</p>
          </>
        )}

        {/* 9c · Comparadores validados */}
        <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted">{t('pro.secComparadores')}</h3>
        <p className="mt-2 rounded-xl bg-bg p-3 text-xs text-muted">{t('pro.lancetNote')}</p>
        <p className="mt-2 text-xs text-muted">{t('triage.comparadoresIntro')}</p>
        <ul className="mt-2 space-y-2">
          {summary.riskScores.map((sc) => (
            <li key={sc.id} className="rounded-xl border border-line bg-bg p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">{sc.name}</span>
                <span className="text-sm text-secondary-text">
                  {sc.computable && sc.value != null ? sc.value : '—'}
                </span>
              </div>
              {sc.interpret && <p className="mt-1 text-sm text-ink">{sc.interpret}</p>}
              {sc.computable && sc.barMin != null && sc.barMax != null && sc.value != null && (
                <ScoreBar min={sc.barMin} max={sc.barMax} value={sc.value} />
              )}
              <p className="mt-1 text-[11px] text-muted">
                {sc.detail} · {sc.source} · {sc.caveat}
              </p>
              {sc.url && (
                <a
                  href={sc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-xs text-secondary-text underline underline-offset-2"
                >
                  {t('pro.openTool')}
                </a>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">{t('pro.disclaimer')}</p>
      </details>

      {/* 10 · Compartir */}
      <section className="mt-6 no-print">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{t('triage.export.title')}</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => downloadJSON('preconsulta.json', summary)}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-ink hover:bg-bg"
          >
            <FileJson size={18} /> {t('triage.export.json')}
          </button>
          <button
            onClick={() => downloadJSON('preconsulta-fhir.json', toFhirBundle(summary))}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-ink hover:bg-bg"
          >
            <Download size={18} /> {t('triage.export.fhir')}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-ink hover:bg-bg"
          >
            <Printer size={18} /> {t('triage.export.print')}
          </button>
        </div>
      </section>

      {summary.modo && (
        <p className="mt-5 text-xs text-muted">
          {t('triage.completedBy', { modo: t(`pre.modo.short.${summary.modo}`) })}
        </p>
      )}
      <p className="mt-2 text-xs text-muted">
        {t('pre.mrca.modelNoteLay')}
        {summary.mrcaPreliminary && (
          <span className="ml-1 rounded-full border border-line bg-bg px-2 py-0.5">{t('pre.mrca.preliminary')}</span>
        )}
      </p>
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
