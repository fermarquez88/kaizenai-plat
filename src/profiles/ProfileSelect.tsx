import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Compass, ShieldCheck } from 'lucide-react'
import { LENTE_IDS } from '../app/lentes'

// DEMO (/demo): el único lugar con cambio-de-lente. "Una persona, muchas miradas" — entrar
// como cada actor. NO es la puerta del producto (esa es /inicio, task-first). Aquí se ve la
// red integrada sin exponer el antipatrón del selector de roles como puerta.
export function ProfileSelect() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <div className="mx-auto mb-6 flex max-w-2xl items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-center text-sm text-secondary-text">
        <Compass size={16} aria-hidden /> {t('home.demoBanner')}
      </div>
      <header className="mb-8 text-center">
        <h1 className="font-serif text-3xl text-ink sm:text-4xl">{t('home.title')}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted">{t('demo.subtitle')}</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LENTE_IDS.map((id) => (
          <Link
            key={id}
            to={`/p/${id}`}
            className="rounded-2xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:border-secondary hover:shadow-card"
          >
            <p className="font-serif text-lg text-ink">{t(`nav.lente.${id}`)}</p>
            <p className="mt-1 text-sm text-muted">{t('demo.verComo', { actor: t(`nav.lente.${id}`) })}</p>
          </Link>
        ))}
      </div>

      <p className="mt-8 flex items-center justify-center gap-2 text-sm text-secondary-text">
        <ShieldCheck size={18} aria-hidden /> {t('home.privacy')}
      </p>
    </div>
  )
}
