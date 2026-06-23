import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { accentText, type ProfileDef } from '../profiles/profiles'

export function ProfileCard({ p }: { p: ProfileDef }) {
  const { t } = useTranslation()
  const Icon = p.icon
  return (
    <Link
      to={`/p/${p.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:-translate-y-0.5"
    >
      <span
        className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-bg ${accentText[p.accent]}`}
      >
        <Icon size={26} strokeWidth={1.8} aria-hidden />
      </span>
      <span className="font-serif text-xl text-ink">{t(`profiles.${p.id}.title`)}</span>
      <span className="text-sm leading-relaxed text-muted">{t(`profiles.${p.id}.desc`)}</span>
    </Link>
  )
}
