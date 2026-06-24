import { useTranslation } from 'react-i18next'
import { AlertOctagon } from 'lucide-react'
import { RED_FLAGS } from '../../../scoring/redflags'
import { usePreconsulta } from '../preconsultaStore'

export function BanderasRojasStep() {
  const { t } = useTranslation()
  const present = usePreconsulta((s) => s.redFlags)
  const toggle = usePreconsulta((s) => s.toggleRedFlag)

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">{t('pre.banderas.title')}</h1>
      <p className="mt-2 text-muted">{t('pre.banderas.intro')}</p>
      <p className="mt-1 text-sm text-muted">{t('pre.banderas.help')}</p>
      <ul className="mt-5 space-y-2">
        {RED_FLAGS.map((id) => {
          const on = present.includes(id)
          return (
            <li key={id}>
              <button
                onClick={() => toggle(id)}
                aria-pressed={on}
                className={
                  'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ' +
                  (on ? 'border-rojo bg-rojo/10' : 'border-line bg-surface hover:border-rojo')
                }
              >
                <span
                  className={
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ' +
                    (on ? 'border-rojo bg-rojo text-white' : 'border-line')
                  }
                >
                  {on && <AlertOctagon size={14} />}
                </span>
                <span className="text-ink">{t(`pre.banderas.items.${id}`)}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {present.length > 0 && (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-rojo bg-rojo/10 p-3 text-sm text-rojo-text">
          <AlertOctagon size={16} className="mt-0.5 shrink-0" /> {t('pre.banderas.warning')}
        </p>
      )}
    </div>
  )
}
