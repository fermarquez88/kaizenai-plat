import { useTranslation } from 'react-i18next'

const CARD_COUNT = 5

export function PacienteGuia() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-serif text-2xl text-ink sm:text-3xl">{t('post.paciente.title')}</h1>
      <p className="mt-2 text-muted">{t('post.paciente.intro')}</p>
      <div className="mt-6 space-y-3">
        {Array.from({ length: CARD_COUNT }, (_, i) => (
          <div key={i} className="rounded-xl border border-line bg-surface p-4">
            <p className="font-medium text-ink">{t(`post.paciente.cards.${i}.t`)}</p>
            <p className="mt-1 text-sm text-muted">{t(`post.paciente.cards.${i}.b`)}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted">{t('post.paciente.note')}</p>
    </div>
  )
}
