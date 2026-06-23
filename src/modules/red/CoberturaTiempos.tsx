import { useTranslation } from 'react-i18next'

const METRICS = [
  { key: 'cobertura', value: '68%' },
  { key: 'cribadas', value: '1.240' },
  { key: 'derivaciones', value: '214' },
  { key: 'tiempoTurno', value: '18 días' },
  { key: 'seguimiento', value: '72%' },
  { key: 'agentes', value: '9' },
]

export function CoberturaTiempos() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-serif text-2xl text-ink sm:text-3xl">{t('metricas.title')}</h1>
      <p className="mt-1 text-sm text-muted">{t('red.seedNote')}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {METRICS.map((m) => (
          <div key={m.key} className="rounded-xl border border-line bg-surface p-4">
            <p className="text-xs text-muted">{t(`metricas.${m.key}`)}</p>
            <p className="mt-0.5 font-serif text-2xl text-ink">{m.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">{t('metricas.note')}</p>
    </div>
  )
}
