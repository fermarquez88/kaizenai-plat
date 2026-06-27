import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Activity, ArrowLeft, Check, ClipboardList, FileText, MessageCircle, Stethoscope, TriangleAlert } from 'lucide-react'
import { useRedRecords } from './redRecords'
import { waMeLink } from '../../channel/ChannelAdapter'
import { dexieRepo } from '../../data/dexieRepo'
import { lenteDe } from '../../app/lentes'
import { cdrLabel, dxLabel, ultimoDiagnostico, useDiagnostico } from './diagnosticoStore'
import type { TriageLevel } from '../../data/types'

const LEVEL_STYLE: Record<TriageLevel, string> = {
  verde: 'border-verde bg-verde/10 text-verde-text',
  amarillo: 'border-amarillo bg-amarillo/10 text-ink',
  rojo: 'border-rojo bg-rojo/10 text-rojo-text',
}

function Stat({ label, value, cls }: { label: string; value: string; cls?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-0.5 font-medium ${cls ?? 'text-ink'}`}>{value}</p>
    </div>
  )
}

// Informe de un paciente (vista clínica) accesible por agente/profesional desde las listas.
// v1: resumen desde el registro guardado (PreAssessmentSummary). El detalle completo
// (instrumentos/contribuciones) vive en el informe en vivo; acá va la HOJA de resumen + acciones.
export function FichaPaciente() {
  const { t } = useTranslation()
  const { profileId, recordId } = useParams()
  const navigate = useNavigate()
  const { records, reload } = useRedRecords()
  // La cola enlaza con el id crudo de la persona seed (p7); los registros lo guardan como
  // seed-p7. Resolvemos ambas formas para que "Ver ficha" nunca quede en la nada.
  const r = records.find((x) => x.id === recordId) ?? records.find((x) => x.id === `seed-${recordId}`)
  const acciones = lenteDe(profileId).acciones
  const dxPorPersona = useDiagnostico((s) => s.porPersona)
  const dxPrev = recordId ? ultimoDiagnostico(dxPorPersona, recordId) : undefined

  const back = (
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-1 text-sm text-secondary-text hover:underline"
    >
      <ArrowLeft size={16} /> {t('ficha.volver')}
    </button>
  )

  if (!r) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        {back}
        <p className="mt-4 text-muted">{t('ficha.noEncontrado')}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {back}

      {/* Cabecera */}
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-ink">{r.alias}</h1>
          <p className="mt-0.5 text-sm text-muted">
            {r.ageYears ? `${r.ageYears} ${t('red.labels.years')}` : ''}
            {r.educationYears != null ? ` · ${t('red.labels.eduYears', { n: r.educationYears })}` : ''}
            {r.demo ? ` · ${t('red.demoTag')}` : ''}
          </p>
        </div>
      </div>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">{t('ficha.subtitulo')}</p>

      {dxPrev && (
        <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-secondary bg-secondary/10 px-3 py-1 text-sm text-secondary-text">
          <Stethoscope size={14} /> {dxLabel(dxPrev.dx)}{dxPrev.cdr ? ` · ${cdrLabel(dxPrev.cdr)}` : ''}
        </p>
      )}

      {/* Triage */}
      <div className={`mt-3 rounded-2xl border p-4 ${LEVEL_STYLE[r.level]}`} role="status">
        <p className="text-xs uppercase tracking-wide opacity-80">{t('triage.levelLabel')}</p>
        <p className="font-serif text-xl">{t(`triage.level.${r.level}`).split(' — ')[0]}</p>
      </div>

      {/* Números clínicos */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label={t('red.labels.risk')} value={`~${r.riskPct}%`} />
        <Stat label={t('red.labels.mrca')} value={t(`pre.mrca.band.${r.mrcaBand}`)} />
        <Stat label={t('red.labels.meds')} value={String(r.meds)} />
        <Stat
          label={t('red.labels.redflags')}
          value={String(r.redFlags)}
          cls={r.redFlags > 0 ? 'text-rojo-text' : 'text-ink'}
        />
      </div>

      {/* Derivación + seguimiento */}
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Stat
          label={t('triage.derivLabel')}
          value={r.derivationStatus ? t(`triage.deriv.${r.derivationStatus}`) : '—'}
        />
        <Stat label={t('ficha.estadoLabel')} value={t(`seguimiento.estado.${r.estado}`)} />
      </div>
      <p className="mt-2 text-sm text-muted">{t('seguimiento.hace', { n: r.daysSinceContact })}</p>

      {/* Díada + discordancia (señal clínica) */}
      {(r.cuidadorAlias || r.discrepancia) && (
        <div className="mt-3 rounded-2xl border border-line bg-surface p-4">
          {r.cuidadorAlias && <p className="text-sm text-ink">{t('seguimiento.cuidador', { c: r.cuidadorAlias })}</p>}
          {r.discrepancia && (
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-accent-text">
              <TriangleAlert size={14} /> {t('seguimiento.discrepancia')}
            </p>
          )}
        </div>
      )}

      {/* Nota clínica */}
      {r.note && (
        <div className="mt-3 rounded-2xl border border-line bg-surface p-4">
          <p className="text-sm text-ink">{r.note}</p>
        </div>
      )}

      {/* Acciones */}
      <div className="mt-4 flex flex-wrap gap-2 no-print">
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
            onClick={() => dexieRepo.logContact(r.id, { at: Date.now(), channel: 'whatsapp' }).then(reload)}
            className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink hover:bg-bg"
          >
            <Check size={16} /> {t('seguimiento.registrar')}
          </button>
        )}
      </div>

      {/* Acciones del equipo (heredan el id de ESTA ficha; sin hardcodes) — según la lente */}
      {acciones.length > 0 && (
        <div className="mt-4 no-print">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t('ficha.accionesEquipo')}</p>
          <div className="flex flex-wrap gap-2">
            {acciones.includes('pedir') && (
              <Link to={`/p/${profileId}/pedir/${r.id}`} className="inline-flex items-center gap-1 rounded-xl border border-secondary bg-secondary/10 px-3 py-2 text-sm font-medium text-secondary">
                <ClipboardList size={16} /> {t('alarmas.pedirCompletar')}
              </Link>
            )}
            {acciones.includes('neuropsico') && (
              <Link to={`/p/${profileId}/neuropsico/${r.id}`} className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink">
                <Stethoscope size={16} /> {t('alarmas.cargarBateria')}
              </Link>
            )}
            {acciones.includes('social') && (
              <Link to={`/p/${profileId}/social/${r.id}`} className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink">
                <ClipboardList size={16} /> {t('ficha.evalSocial')}
              </Link>
            )}
            {acciones.includes('medir') && (
              <Link to={`/p/${profileId}/vitales/${r.id}`} className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink">
                <Activity size={16} /> Signos vitales
              </Link>
            )}
            {acciones.includes('diagnostico') && (
              <Link to={`/p/${profileId}/diagnostico/${r.id}`} className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink">
                <Stethoscope size={16} /> Diagnóstico
              </Link>
            )}
            {acciones.includes('informe') && (
              <Link to={`/p/${profileId}/informe-doc`} className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink">
                <FileText size={16} /> {t('puerta.informe')}
              </Link>
            )}
          </div>
        </div>
      )}

      <p className="mt-5 text-xs text-muted">{t('triage.disclaimerShort')}</p>
    </div>
  )
}
