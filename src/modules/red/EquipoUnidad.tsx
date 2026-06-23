import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const TABS = ['medicina', 'enfermeria', 'neuropsico'] as const
type Tab = (typeof TABS)[number]

export function EquipoUnidad() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('medicina')
  const items = [0, 1, 2, 3]

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-serif text-2xl text-ink sm:text-3xl">{t('equipo.title')}</h1>
      <p className="mt-1 text-muted">{t('equipo.intro')}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            aria-pressed={tab === tb}
            className={
              'rounded-lg border px-3 py-2 text-sm font-medium transition ' +
              (tab === tb
                ? 'border-secondary bg-secondary text-white'
                : 'border-line bg-bg text-ink hover:border-secondary')
            }
          >
            {t(`equipo.tabs.${tb}`)}
          </button>
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {items.map((i) => (
          <li
            key={i}
            className="flex items-start gap-2 rounded-xl border border-line bg-surface p-4 text-sm text-ink"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
            {t(`equipo.${tab}.${i}`)}
          </li>
        ))}
      </ul>
    </div>
  )
}
