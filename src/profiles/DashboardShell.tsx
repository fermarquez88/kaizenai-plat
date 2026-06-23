import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ExternalLink } from 'lucide-react'
import { getProfile, MODULE_LINKS } from './profiles'

export function DashboardShell() {
  const { profileId } = useParams()
  const { t } = useTranslation()
  const p = getProfile(profileId)

  if (!p) return <Navigate to="/" replace />

  const Icon = p.icon
  const links = MODULE_LINKS[p.id] ?? {}
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
        {modules.map((i) => {
          const rel = links[i]
          const external = !!rel && rel.startsWith('http')
          const to = rel ? (rel.startsWith('/') ? rel : `/p/${p.id}/${rel}`) : ''
          const body = (
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-ink">{t(`modules.${p.id}.${i}.t`)}</p>
                <p className="mt-1 text-sm text-muted">{t(`modules.${p.id}.${i}.d`)}</p>
              </div>
              <span
                className={
                  'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs ' +
                  (rel ? 'bg-primary text-white' : 'border border-line bg-bg text-accent-text')
                }
              >
                {external && <ExternalLink size={12} />}
                {rel ? t('common.start') : t('common.soon')}
              </span>
            </div>
          )
          const cls =
            'block rounded-xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:shadow-card'
          if (!rel) {
            return (
              <div key={i} className="rounded-xl border border-line bg-surface p-4">
                {body}
              </div>
            )
          }
          return external ? (
            <a key={i} href={rel} target="_blank" rel="noreferrer" className={cls}>
              {body}
            </a>
          ) : (
            <Link key={i} to={to} className={cls}>
              {body}
            </Link>
          )
        })}
      </div>

      <p className="mt-6 text-sm italic text-muted">{t('dashboard.phaseNote')}</p>
    </div>
  )
}
