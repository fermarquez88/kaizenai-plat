import { useTranslation } from 'react-i18next'
import { INSTRUMENTS, scoreInstrument } from '../../../scoring/instruments'
import { usePreconsulta } from '../preconsultaStore'

export function InstrumentStep({ id }: { id: string }) {
  const { t } = useTranslation()
  const inst = INSTRUMENTS[id]
  const allAnswers = usePreconsulta((s) => s.instruments)
  const setItem = usePreconsulta((s) => s.setInstrumentItem)
  const answers = allAnswers[id] ?? {}
  const sc = scoreInstrument(inst, answers)

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">{inst.name}</h1>
      <p className="mt-2 text-muted">{inst.why}</p>
      <p className="mt-2 text-sm text-secondary-text">
        {t('instrumento.progress', { current: sc.answered, total: inst.items.length })}
      </p>

      <ul className="mt-4 space-y-3">
        {inst.items.map((it, i) => (
          <li key={i} className="rounded-xl border border-line bg-surface p-4">
            <p className="text-ink">
              {i + 1}. {it}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={it}>
              {inst.options.map((o) => {
                const sel = answers[i] === o.value
                return (
                  <button
                    key={o.value}
                    onClick={() => setItem(id, i, o.value)}
                    aria-pressed={sel}
                    className={
                      'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ' +
                      (sel
                        ? 'border-secondary bg-secondary text-white'
                        : 'border-line bg-bg text-ink hover:border-secondary')
                    }
                  >
                    {o.label}
                  </button>
                )
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
