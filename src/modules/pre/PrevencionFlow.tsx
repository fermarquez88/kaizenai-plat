import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RotateCcw, ShieldAlert, Sparkles } from 'lucide-react'
import {
  LANCET_FACTORS,
  computeModifiableRisk,
  type FactorAnswer,
} from '../../scoring/lancet'
import { dexieRepo } from '../../data/dexieRepo'

type View = 'quiz' | 'result'
const OPTIONS: FactorAnswer[] = ['si', 'no', 'nose']

export function PrevencionFlow() {
  const { t } = useTranslation()
  const [answers, setAnswers] = useState<Record<string, FactorAnswer>>({})
  const [view, setView] = useState<View>('quiz')

  const result = useMemo(() => computeModifiableRisk(answers), [answers])
  const answered = Object.keys(answers).length

  const submit = async () => {
    setView('result')
    try {
      await dexieRepo.savePreAssessment({
        id: crypto.randomUUID(),
        personId: 'anon',
        createdAt: Date.now(),
        modifiableRiskIndex: result.share,
      })
    } catch {
      /* guardado local best-effort: no rompemos la experiencia si falla */
    }
  }

  const restart = () => {
    setAnswers({})
    setView('quiz')
  }

  if (view === 'result') {
    const pct = Math.round(result.modifiableRiskPct)
    const present = result.presentFactors
    const list = present.map((f) => t(`factors.${f.id}.label`)).join(', ')

    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-serif text-2xl text-ink sm:text-3xl">
          {t('pre.prevencion.result.title')}
        </h1>

        {present.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-card">
            <p className="flex items-center gap-2 text-verde-text">
              <Sparkles size={20} aria-hidden /> {t('pre.prevencion.result.none')}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-card">
              <p className="font-serif text-3xl text-primary-text">
                {t('pre.prevencion.result.estimate', { pct })}
              </p>
              <p className="mt-2 text-sm text-muted">
                {t('pre.prevencion.result.estimateHint')}
              </p>
            </div>

            <section className="mt-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                {t('pre.prevencion.result.topTitle')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.topFactors.map((f) => (
                  <span
                    key={f.id}
                    className="rounded-full border border-line bg-bg px-3 py-1 text-sm text-ink"
                  >
                    {t(`factors.${f.id}.label`)}
                  </span>
                ))}
              </div>
            </section>

            <section className="mt-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                {t('pre.prevencion.result.adviceTitle')}
              </h2>
              <ul className="space-y-3">
                {present.map((f) => (
                  <li key={f.id} className="rounded-xl border border-line bg-surface p-4">
                    <p className="font-medium text-ink">{t(`factors.${f.id}.label`)}</p>
                    <p className="mt-1 text-sm text-muted">{t(`factors.${f.id}.advice`)}</p>
                  </li>
                ))}
              </ul>
            </section>

            <p className="mt-6 text-sm text-muted">
              {t('pre.prevencion.result.rationale', { list })}
            </p>
          </>
        )}

        <p className="mt-4 flex items-start gap-2 rounded-xl bg-bg p-3 text-xs text-muted">
          <ShieldAlert size={16} className="mt-0.5 shrink-0" aria-hidden />
          {t('pre.prevencion.result.disclaimer')}
        </p>

        <button
          onClick={restart}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-ink hover:bg-bg"
        >
          <RotateCcw size={18} aria-hidden /> {t('pre.prevencion.result.restart')}
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-28">
      <h1 className="font-serif text-2xl text-ink sm:text-3xl">
        {t('pre.prevencion.title')}
      </h1>
      <p className="mt-2 text-muted">{t('pre.prevencion.intro')}</p>
      <p className="mt-3 text-sm text-secondary-text">
        {t('pre.prevencion.progress', { current: answered, total: LANCET_FACTORS.length })}
      </p>

      <ul className="mt-5 space-y-3">
        {LANCET_FACTORS.map((f) => (
          <li key={f.id} className="rounded-xl border border-line bg-surface p-4">
            <p className="font-medium text-ink">{t(`factors.${f.id}.label`)}</p>
            <p className="mt-1 text-sm text-muted">{t(`factors.${f.id}.question`)}</p>
            <div
              className="mt-3 flex gap-2"
              role="group"
              aria-label={t(`factors.${f.id}.label`)}
            >
              {OPTIONS.map((opt) => {
                const selected = answers[f.id] === opt
                return (
                  <button
                    key={opt}
                    onClick={() => setAnswers((p) => ({ ...p, [f.id]: opt }))}
                    aria-pressed={selected}
                    className={
                      'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ' +
                      (selected
                        ? 'border-secondary bg-secondary text-white'
                        : 'border-line bg-bg text-ink hover:border-secondary')
                    }
                  >
                    {t(`pre.prevencion.answer.${opt}`)}
                  </button>
                )
              })}
            </div>
          </li>
        ))}
      </ul>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <button
            onClick={submit}
            className="w-full rounded-xl bg-primary px-4 py-3 font-medium text-white shadow-card transition hover:brightness-95"
          >
            {t('pre.prevencion.see')}
          </button>
        </div>
      </div>
    </div>
  )
}
