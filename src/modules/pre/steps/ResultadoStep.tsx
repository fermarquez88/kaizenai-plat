import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertOctagon,
  AlertTriangle,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  FileJson,
  MessageCircle,
  Phone,
  Printer,
  Users,
} from 'lucide-react'
import { usePreconsulta } from '../preconsultaStore'
import { buildSummary, toFhirBundle, type PreconsultaSummary } from '../../../data/preconsultaSummary'
import { downloadJSON } from '../../../lib/download'
import { dexieRepo } from '../../../data/dexieRepo'
import { useSettings } from '../../../lib/store'
import { cidiTurnoLink, guardiaDe } from '../../../data/sanjuan'
import { waMeLink } from '../../../channel/ChannelAdapter'
import type { TriageLevel } from '../../../scoring/triage'
import { computeDomainCompleteness } from '../../../scoring/domainCompleteness'
import { CompletitudPorDominio } from '../../profile/CompletitudPorDominio'

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

  const ensureSelfPersonId = useSettings((s) => s.ensureSelfPersonId)
  const simpleMode = useSettings((s) => s.simpleMode)
  const [copied, setCopied] = useState(false)

  const summary = useMemo<PreconsultaSummary>(
    () => buildSummary({ demo, lancet, instruments, factores, meds, redFlags }, new Date().toISOString()),
    [demo, lancet, instruments, factores, meds, redFlags],
  )
  const completitud = useMemo(
    () => computeDomainCompleteness({ demo, lancet, instruments }),
    [demo, lancet, instruments],
  )

  const saved = useRef(false)
  useEffect(() => {
    if (saved.current) return
    saved.current = true
    const now = Date.now()
    // Persona = id estable (re-evaluaciones enlazadas); agente/cuidador = nuevo registro.
    const personId = summary.modo === 'persona' ? ensureSelfPersonId() : crypto.randomUUID()
    // Lazo de derivación: si es rojo / hay banderas / el modelo deriva, se EMITE.
    const derivar =
      summary.triageLevel === 'rojo' || summary.mrcaDecision === 'derivar' || summary.redFlags.length > 0
    // Cada cribado tiene su Person → referencias FHIR resueltas y el sobre lleva a la persona.
    dexieRepo
      .upsertPerson({
        id: personId,
        alias: demo.alias ?? '—',
        ageYears: demo.edad,
        educationYears: demo.edu_anios,
        depto: summary.depto,
        phone: demo.phone,
        lang: 'es',
        createdAt: now,
        cuidadorAlias: demo.cuidadorAlias,
      })
      .catch(() => {})
    dexieRepo
      .savePreAssessment({
        id: crypto.randomUUID(),
        personId,
        createdAt: now,
        modifiableRiskIndex: summary.modifiableRiskShare,
        riskPct: summary.modifiableRiskPct,
        mrcaBand: summary.mrcaBand,
        mrcaProb: summary.mrcaProb,
        triage: summary.triageLevel,
        medsCount: summary.medFlags.count,
        redFlagsCount: summary.redFlags.length,
        alias: demo.alias,
        ageYears: demo.edad,
        educationYears: demo.edu_anios,
        depto: summary.depto,
        phone: demo.phone,
        modo: summary.modo,
        source: summary.modo,
        cuidadorAlias: demo.cuidadorAlias,
        derivationStatus: derivar ? 'emitida' : undefined,
        derivationUpdatedAt: derivar ? now : undefined,
      })
      .catch(() => {})
  }, [summary, demo, ensureSelfPersonId])

  const level = summary.triageLevel
  // Audiencia del informe: "persona" (Tu chequeo, lego) | "clinico" (Hoja clínica).
  // Todos acceden al MISMO informe; el toggle cambia el formato. Reemplaza el binario `simple`.
  const [audience, setAudience] = useState<'persona' | 'clinico'>(
    simpleMode || summary.modo === 'persona' ? 'persona' : 'clinico',
  )
  const simple = audience === 'persona'
  const shareText = [
    `KaizenAI — cribado de salud cerebral${demo.alias ? ` · ${demo.alias}` : ''}`,
    `Prioridad sugerida: ${t(`triage.level.${level}`)}`,
    `Memoria: ${t(`triage.mrcaAction.${summary.mrcaBand}`)}`,
    `Factores para mejorar: ${summary.presentFactors.length} de 14`,
    `(Estimación orientativa, no diagnóstico — KaizenAI.)`,
  ].join('\n')
  const copyResumen = () => {
    navigator.clipboard?.writeText(shareText).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      },
      () => {},
    )
  }
  // Invitación del cuidador (activación = palanca de retención). Link a la app real.
  const appBase = window.location.origin + window.location.pathname
  const inviteText = `${t('triage.invite.msg')} ${appBase}#/inicio?ref=invite`
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

      {/* Toggle de audiencia: todos acceden, distinto formato */}
      <div className="mt-3 inline-flex rounded-xl border border-line bg-surface p-1 text-sm no-print" role="group" aria-label={t('informe.verComo')}>
        <button
          type="button"
          onClick={() => setAudience('persona')}
          aria-pressed={audience === 'persona'}
          className={`rounded-lg px-3 py-1.5 ${audience === 'persona' ? 'bg-primary text-white' : 'text-muted'}`}
        >
          {t('informe.persona')}
        </button>
        <button
          type="button"
          onClick={() => setAudience('clinico')}
          aria-pressed={audience === 'clinico'}
          className={`rounded-lg px-3 py-1.5 ${audience === 'clinico' ? 'bg-primary text-white' : 'text-muted'}`}
        >
          {t('informe.profesional')}
        </button>
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

      {/* 4b · Invitar a un familiar (activación del cuidador = palanca de retención) */}
      <section className="mt-3 rounded-2xl border border-line bg-surface p-5 no-print">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t('triage.invite.title')}</h2>
        <p className="mt-2 text-ink">{t('triage.invite.desc')}</p>
        <a
          href={waMeLink('', inviteText)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-xl border border-secondary bg-surface px-4 py-2.5 font-medium text-secondary-text hover:bg-bg"
        >
          <Users size={18} /> {t('triage.invite.btn')}
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
          {simple ? (
            <IconArray14 n={nFactores} />
          ) : (
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-line" aria-hidden>
              <div className="h-full rounded-full bg-secondary/60" style={{ width: `${(nFactores / 14) * 100}%` }} />
            </div>
          )}
          <p className="mt-2 text-sm text-ink">
            {nFactores > 0 ? t('triage.factorsExplain', { n: nFactores, ejemplos }) : t('triage.factorsExplainNone')}
          </p>
        </div>

        {/* Riesgo estimado de memoria (palabra, no porcentaje) */}
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-ink">
              {simple ? t('triage.mrcaActionTitle') : t('triage.stats.mrca')}
            </p>
            <p className={'font-serif text-xl text-ink' + (simple ? '' : ' capitalize')}>
              {simple ? t(`triage.mrcaAction.${summary.mrcaBand}`) : t(`pre.mrca.band.${summary.mrcaBand}`)}
            </p>
          </div>
          <p className="mt-2 text-sm text-ink">{t(`triage.mrcaBandExplain.${summary.mrcaBand}`)}</p>
        </div>

        {/* Medicación + señales */}
        <div className="grid grid-cols-2 gap-3">
          <Stat label={t('triage.stats.meds')} value={String(summary.medFlags.count)} />
          <Stat label={t('triage.stats.redflags')} value={String(summary.redFlags.length)} />
        </div>
      </section>

      {/* 7b · Completitud del perfil por dominio de salud cerebral */}
      <section className="mt-5">
        <CompletitudPorDominio result={completitud} />
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

      {/* 9 · Para el profesional (oculto en lectura fácil / para la persona) */}
      {!simple && (
      <details open className="mt-6 rounded-2xl border border-line bg-surface p-4">
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
      )}

      {/* 10 · Compartir */}
      <section className="mt-6 no-print">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{t('triage.export.title')}</h2>
        <div className="flex flex-wrap gap-2">
          <a
            href={waMeLink('', shareText)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 font-medium text-white"
          >
            <MessageCircle size={18} /> {t('triage.export.whatsapp')}
          </a>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-ink hover:bg-bg"
          >
            <Printer size={18} /> {t('triage.export.print')}
          </button>
        </div>
        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-secondary-text">{t('triage.export.more')}</summary>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={copyResumen}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-ink hover:bg-bg"
            >
              {copied ? <Check size={18} /> : <FileJson size={18} />}{' '}
              {copied ? t('triage.export.copied') : t('triage.export.copy')}
            </button>
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
          </div>
          <p className="mt-2 text-xs text-muted">{t('triage.export.privacyNote')}</p>
        </details>
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

// Icon array (frecuencia natural): 14 factores, los presentes resaltados. Comunica
// "X de 14 que podés mejorar" de forma visual/intuitiva (vista persona).
function IconArray14({ n }: { n: number }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5" aria-hidden>
      {Array.from({ length: 14 }, (_, i) => (
        <span key={i} className={`h-4 w-4 rounded-sm ${i < n ? 'bg-secondary' : 'bg-line'}`} />
      ))}
    </div>
  )
}
