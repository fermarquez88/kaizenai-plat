import { useTranslation } from 'react-i18next'
import { ShieldCheck } from 'lucide-react'
import { PROFILES } from './profiles'
import { ProfileCard } from '../components/ProfileCard'

export function ProfileSelect() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <header className="mb-8 text-center">
        <h1 className="font-serif text-3xl text-ink sm:text-4xl">{t('home.title')}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted">{t('home.subtitle')}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROFILES.map((p) => (
          <ProfileCard key={p.id} p={p} />
        ))}
      </div>

      <p className="mt-8 flex items-center justify-center gap-2 text-sm text-secondary-text">
        <ShieldCheck size={18} aria-hidden />
        {t('home.privacy')}
      </p>
    </div>
  )
}
