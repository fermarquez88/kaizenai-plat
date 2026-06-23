import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GitCommitHorizontal, Send, ThumbsUp, Users } from 'lucide-react'
import { dexieRepo } from '../../data/dexieRepo'
import type { Suggestion } from '../../data/types'

const SEED = [
  { key: '0', votes: 28 },
  { key: '1', votes: 19 },
  { key: '2', votes: 12 },
]
const CHANGELOG = ['0', '1', '2']
const REPS = ['0', '1', '2']

export function Comunidad() {
  const { t } = useTranslation()
  const [local, setLocal] = useState<Suggestion[]>([])
  const [text, setText] = useState('')

  const refresh = () => dexieRepo.listSuggestions().then(setLocal)
  useEffect(() => {
    void refresh()
  }, [])

  const submit = async () => {
    const v = text.trim()
    if (!v) return
    await dexieRepo.addSuggestion({ id: crypto.randomUUID(), text: v, createdAt: Date.now(), votes: 1 })
    setText('')
    await refresh()
  }
  const vote = async (id: string) => {
    await dexieRepo.voteSuggestion(id)
    await refresh()
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center gap-2 text-primary-text">
        <Users size={20} aria-hidden />
        <span className="text-sm font-semibold uppercase tracking-wide">{t('gov.community.tag')}</span>
      </div>
      <h1 className="mt-2 font-serif text-2xl text-ink sm:text-3xl">{t('gov.community.title')}</h1>
      <p className="mt-3 text-muted">{t('gov.community.intro')}</p>

      {/* Sugerir mejora */}
      <section className="mt-6">
        <h2 className="font-serif text-xl text-ink">{t('gov.community.suggestTitle')}</h2>
        <div className="mt-3 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder={t('gov.community.suggestPlaceholder')}
            className="flex-1 rounded-xl border border-line bg-surface px-4 py-3 text-ink placeholder:text-muted focus:border-secondary"
          />
          <button
            onClick={submit}
            aria-label={t('gov.community.suggestBtn')}
            className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-3 font-medium text-white"
          >
            <Send size={18} />
          </button>
        </div>

        <ul className="mt-4 space-y-2">
          {local.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3"
            >
              <span className="text-ink">{s.text}</span>
              <button
                onClick={() => vote(s.id)}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-bg px-2.5 py-1 text-sm text-secondary-text"
              >
                <ThumbsUp size={14} /> {s.votes}
              </button>
            </li>
          ))}
          {SEED.map((s) => (
            <li
              key={s.key}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3"
            >
              <span className="text-ink">{t(`gov.community.seed.${s.key}`)}</span>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-bg px-2.5 py-1 text-sm text-muted">
                <ThumbsUp size={14} /> {s.votes}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Qué cambiamos */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 font-serif text-xl text-ink">
          <GitCommitHorizontal size={20} className="text-secondary" /> {t('gov.community.changelogTitle')}
        </h2>
        <ul className="mt-3 space-y-2">
          {CHANGELOG.map((k) => (
            <li key={k} className="rounded-xl border border-line bg-surface p-4">
              <p className="text-sm text-muted">{t(`gov.community.changelog.${k}.req`)}</p>
              <p className="mt-1 font-medium text-verde-text">{t(`gov.community.changelog.${k}.done`)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Representantes */}
      <section className="mt-8">
        <h2 className="font-serif text-xl text-ink">{t('gov.community.repsTitle')}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {REPS.map((k) => (
            <div key={k} className="rounded-xl border border-line bg-surface p-4">
              <p className="font-medium text-ink">{t(`gov.community.reps.${k}.role`)}</p>
              <p className="mt-1 text-sm text-muted">{t(`gov.community.reps.${k}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
