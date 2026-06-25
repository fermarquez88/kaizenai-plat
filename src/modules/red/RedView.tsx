import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { dexieRepo } from '../../data/dexieRepo'
import type { DerivationStatus, TriageLevel } from '../../data/types'
import { PRIORITY } from '../../seed/personas'
import { useRedRecords, type RedRecord } from './redRecords'
import { ImportButton } from './ImportButton'

type Mode = 'gente' | 'cola' | 'bandeja' | 'tablero'
const MODES: Mode[] = ['gente', 'cola', 'bandeja', 'tablero']
const DERIV_STATES: DerivationStatus[] = ['emitida', 'agendada', 'atendida', 'noVino', 'cerrada']

const CHIP: Record<TriageLevel, string> = {
  verde: 'border border-verde bg-verde/10 text-verde-text',
  amarillo: 'border border-amarillo bg-amarillo/10 text-ink',
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
      <p className="text-xs text-muted">{label}</p>
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

// Lazo CERRADO de derivación: editable para registros reales; chip estático en demo.
function DerivControl({ r, onChange }: { r: RedRecord; onChange: () => void }) {
  const { t } = useTranslation()
  if (r.demo) {
    return r.derivationStatus ? (
      <span className="rounded-full border border-line bg-bg px-2.5 py-1 text-xs text-muted">
        {t(`triage.deriv.${r.derivationStatus}`)}
      </span>
    ) : null
  }
  return (
    <label className="inline-flex items-center gap-2">
      <span className="text-xs text-muted">{t('triage.derivLabel')}</span>
      <select
        value={r.derivationStatus ?? 'emitida'}
        aria-label={t('triage.derivLabel')}
        onChange={(e) => dexieRepo.updateDerivation(r.id, e.target.value as DerivationStatus).then(onChange)}
        className="rounded-lg border border-line bg-bg px-2 py-1.5 text-sm text-ink focus:border-secondary"
      >
        {DERIV_STATES.map((s) => (
          <option key={s} value={s}>
            {t(`triage.deriv.${s}`)}
          </option>
        ))}
      </select>
    </label>
  )
}

function Tablero({ records }: { records: RedRecord[] }) {
  const { t } = useTranslation()
  const total = records.length
  const by = (lvl: TriageLevel) => records.filter((p) => p.level === lvl).length
  const avg = total ? Math.round(records.reduce((s, p) => s + p.riskPct, 0) / total) : 0
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
  const { profileId, mode } = useParams()
  const { t } = useTranslation()
  const { records, realCount, reload } = useRedRecords()

  if (!mode || !MODES.includes(mode as Mode)) return <Navigate to="/" replace />
  const m = mode as Mode

  const people =
    m === 'cola'
      ? [...records].sort((a, b) => PRIORITY[a.level] - PRIORITY[b.level] || b.riskPct - a.riskPct)
      : records

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-serif text-2xl text-ink sm:text-3xl">{t(`red.titles.${m}`)}</h1>
      <p className="mt-1 text-sm text-muted">{t('red.realNote', { real: realCount, demo: records.length - realCount })}</p>

      {(m === 'bandeja' || m === 'cola') && (
        <div className="mt-3">
          <ImportButton onDone={reload} />
        </div>
      )}

      {m === 'tablero' ? (
        <Tablero records={records} />
      ) : (
        <ul className="mt-5 space-y-3">
          {people.map((p) => (
            <li
              key={p.id}
              className={'rounded-xl border bg-surface p-4 ' + (p.demo ? 'border-dashed border-line' : 'border-line')}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">
                    {p.alias}
                    {p.demo && (
                      <span className="ml-2 rounded-full border border-line bg-bg px-2 py-0.5 text-[11px] text-muted">
                        {t('red.demoTag')}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {p.ageYears ? `${p.ageYears} ${t('red.labels.years')}` : ''}
                    {p.educationYears != null ? ` · ${t('red.labels.eduYears', { n: p.educationYears })}` : ''}
                  </p>
                </div>
                <LevelChip level={p.level} />
              </div>
              <Link
                to={`/p/${profileId}/ficha/${p.id}`}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-secondary-text hover:underline"
              >
                {t('ficha.verInforme')}
              </Link>
              {p.note && <p className="mt-2 text-sm text-muted">{p.note}</p>}
              {(m === 'bandeja' || m === 'cola') && (
                <>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Mini label={t('red.labels.risk')} value={`~${p.riskPct}%`} />
                    <Mini label={t('red.labels.mrca')} value={t(`pre.mrca.band.${p.mrcaBand}`)} />
                    <Mini label={t('red.labels.meds')} value={String(p.meds)} />
                    <Mini label={t('red.labels.redflags')} value={String(p.redFlags)} />
                  </div>
                  <div className="mt-3">
                    <DerivControl r={p} onChange={reload} />
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
