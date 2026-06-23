import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink, LifeBuoy } from 'lucide-react'
import { ZARIT_ITEMS, ZARIT_MAX, computeZarit } from '../../scoring/zarit'

const GUIDE_URL = 'https://fermarquez88.github.io/kaizenai-cuidadores/'
const OPTS = [0, 1, 2, 3, 4] as const

export function CuidadorGuia() {
  const { t } = useTranslation()
  const [ans, setAns] = useState<Record<string, number>>({})
  const z = computeZarit(ans)
  const answered = Object.keys(ans).length

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-serif text-2xl text-ink sm:text-3xl">{t('post.cuidador.title')}</h1>

      <section className="mt-6">
        <h2 className="font-serif text-xl text-ink">{t('zarit.title')}</h2>
        <p className="mt-1 text-muted">{t('zarit.intro')}</p>
        <ul className="mt-4 space-y-3">
          {ZARIT_ITEMS.map((id) => (
            <li key={id} className="rounded-xl border border-line bg-surface p-4">
              <p className="text-ink">{t(`zarit.items.${id}`)}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {OPTS.map((o) => {
                  const sel = ans[id] === o
                  return (
                    <button
                      key={o}
                      onClick={() => setAns((p) => ({ ...p, [id]: o }))}
                      aria-pressed={sel}
                      className={
                        'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ' +
                        (sel
                          ? 'border-secondary bg-secondary text-white'
                          : 'border-line bg-bg text-ink hover:border-secondary')
                      }
                    >
                      {t(`zarit.options.${o}`)}
                    </button>
                  )
                })}
              </div>
            </li>
          ))}
        </ul>
        {answered > 0 && (
          <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
            <p className="font-serif text-lg text-ink">
              {t('zarit.result', { score: z.score, max: ZARIT_MAX, band: t(`zarit.bands.${z.band}`) })}
            </p>
            <p className="mt-1 text-sm text-muted">{t(`zarit.hint.${z.band}`)}</p>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-ink">{t('post.cuidador.dice.title')}</h2>
        <p className="mt-1 text-muted">{t('post.cuidador.dice.intro')}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(['d', 'i', 'c', 'e'] as const).map((k) => (
            <div key={k} className="rounded-xl border border-line bg-surface p-4">
              <p className="font-medium text-secondary-text">{t(`post.cuidador.dice.${k}.t`)}</p>
              <p className="mt-1 text-sm text-muted">{t(`post.cuidador.dice.${k}.b`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-primary bg-primary/5 p-5">
        <h2 className="flex items-center gap-2 font-serif text-xl text-ink">
          <LifeBuoy size={20} className="text-primary-text" /> {t('post.cuidador.help.title')}
        </h2>
        <p className="mt-2 text-ink">{t('post.cuidador.help.body')}</p>
        <a
          href={GUIDE_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-medium text-white"
        >
          <ExternalLink size={18} /> {t('post.cuidador.help.link')}
        </a>
      </section>
    </div>
  )
}
