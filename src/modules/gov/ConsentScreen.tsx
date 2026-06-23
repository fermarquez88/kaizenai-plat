import { useTranslation } from 'react-i18next'
import { ShieldCheck } from 'lucide-react'

export function ConsentScreen({ onAccept }: { onAccept: () => void }) {
  const { t } = useTranslation()
  const points = [0, 1, 2, 3]
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center gap-2 text-secondary-text">
        <ShieldCheck size={20} aria-hidden />
        <span className="text-sm font-semibold uppercase tracking-wide">{t('gov.consent.tag')}</span>
      </div>
      <h1 className="mt-2 font-serif text-2xl text-ink sm:text-3xl">{t('gov.consent.title')}</h1>
      <p className="mt-3 text-muted">{t('gov.consent.intro')}</p>
      <ul className="mt-5 space-y-2">
        {points.map((i) => (
          <li
            key={i}
            className="flex items-start gap-2 rounded-xl border border-line bg-surface p-3 text-sm text-ink"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
            {t(`gov.consent.points.${i}`)}
          </li>
        ))}
      </ul>
      <button
        onClick={onAccept}
        className="mt-6 w-full rounded-xl bg-primary px-4 py-3 font-medium text-white"
      >
        {t('gov.consent.accept')}
      </button>
      <p className="mt-3 text-xs text-muted">{t('gov.consent.note')}</p>
    </div>
  )
}
