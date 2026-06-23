import { Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getProfile } from './profiles'

export function DashboardShell() {
  const { profileId } = useParams()
  const { t } = useTranslation()
  const p = getProfile(profileId)

  if (!p) return <Navigate to="/" replace />

  const Icon = p.icon
  const modules = Array.from({ length: p.moduleCount }, (_, i) => i)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-2 flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-secondary">
          <Icon size={24} strokeWidth={1.8} aria-hidden />
        </span>
        <h1 className="font-serif text-2xl text-ink sm:text-3xl">{t(`profiles.${p.id}.title`)}</h1>
      </div>
      <p className="mb-6 text-muted">{t(`profiles.${p.id}.desc`)}</p>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        {t('dashboard.modules')}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {modules.map((i) => (
          <div key={i} className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-ink">{t(`modules.${p.id}.${i}.t`)}</p>
                <p className="mt-1 text-sm text-muted">{t(`modules.${p.id}.${i}.d`)}</p>
              </div>
              <span className="shrink-0 rounded-full border border-line bg-bg px-2 py-1 text-xs text-accent-text">
                {t('common.soon')}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm italic text-muted">{t('dashboard.phaseNote')}</p>
    </div>
  )
}
