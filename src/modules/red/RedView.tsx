import { Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PRIORITY, SEED_PERSONAS } from '../../seed/personas'
import type { TriageLevel } from '../../scoring/triage'

type Mode = 'gente' | 'cola' | 'bandeja' | 'tablero'
const MODES: Mode[] = ['gente', 'cola', 'bandeja', 'tablero']

const CHIP: Record<TriageLevel, string> = {
  verde: 'border border-verde bg-verde/10 text-verde-text',
  amarillo: 'border border-amarillo bg-amarillo/10 text-accent-text',
  rojo: 'border border-rojo bg-rojo/10 text-rojo-text',
}

function LevelChip({ level }: { level: TriageLevel }) {
  const { t } = useTranslation()
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${CHIP[level]}`}>
      {t(`triage.level.${level}`).split(' — ')[0]}
    </span>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-bg p-2 text-center">
      <p className="text-[11px] text-muted">{label}</p>
      <p className="text-sm font-medium text-ink">{value}</p>
    </div>
  )
}

function Stat({ label, value, cls }: { label: string; value: string; cls?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-0.5 font-serif text-2xl ${cls ?? 'text-ink'}`}>{value}</p>
    </div>
  )
}

function Tablero() {
  const { t } = useTranslation()
  const total = SEED_PERSONAS.length
  const by = (lvl: TriageLevel) => SEED_PERSONAS.filter((p) => p.level === lvl).length
  const avg = Math.round(SEED_PERSONAS.reduce((s, p) => s + p.riskPct, 0) / total)
  return (
    <div className="mt-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t('red.tablero.total')} value={String(total)} />
        <Stat label={t('red.tablero.rojo')} value={String(by('rojo'))} cls="text-rojo-text" />
        <Stat label={t('red.tablero.amarillo')} value={String(by('amarillo'))} cls="text-accent-text" />
        <Stat label={t('red.tablero.verde')} value={String(by('verde'))} cls="text-verde-text" />
      </div>
      <div className="mt-3">
        <Stat label={t('red.tablero.avgRisk')} value={`~${avg}%`} />
      </div>
      <p className="mt-3 text-xs text-muted">{t('red.tablero.anon')}</p>
    </div>
  )
}

export function RedView() {
  const { mode } = useParams()
  const { t } = useTranslation()

  if (!mode || !MODES.includes(mode as Mode)) return <Navigate to="/" replace />
  const m = mode as Mode

  const people =
    m === 'cola'
      ? [...SEED_PERSONAS].sort(
          (a, b) => PRIORITY[a.level] - PRIORITY[b.level] || b.riskPct - a.riskPct,
        )
      : SEED_PERSONAS

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-serif text-2xl text-ink sm:text-3xl">{t(`red.titles.${m}`)}</h1>
      <p className="mt-1 text-sm text-muted">{t('red.seedNote')}</p>

      {m === 'tablero' ? (
        <Tablero />
      ) : (
        <ul className="mt-5 space-y-3">
          {people.map((p) => (
            <li key={p.id} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{p.alias}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {p.age} {t('red.labels.years')} · {t('red.labels.eduYears', { n: p.edu })}
                  </p>
                </div>
                <LevelChip level={p.level} />
              </div>
              <p className="mt-2 text-sm text-muted">{p.note}</p>
              {(m === 'bandeja' || m === 'cola') && (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Mini label={t('red.labels.risk')} value={`~${p.riskPct}%`} />
                  <Mini label={t('red.labels.mrca')} value={`${p.mrca}/7`} />
                  <Mini label={t('red.labels.meds')} value={String(p.meds)} />
                  <Mini label={t('red.labels.redflags')} value={String(p.redFlags)} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
