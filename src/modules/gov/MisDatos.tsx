import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, ShieldCheck, Trash2 } from 'lucide-react'
import { dexieRepo } from '../../data/dexieRepo'
import { downloadJSON } from '../../lib/download'

export function MisDatos() {
  const { t } = useTranslation()
  const [count, setCount] = useState(0)
  const [confirming, setConfirming] = useState(false)
  const [deleted, setDeleted] = useState(false)

  const refresh = () => dexieRepo.listPreAssessments().then((a) => setCount(a.length))
  useEffect(() => {
    void refresh()
  }, [])

  const exportAll = async () => {
    const json = await dexieRepo.exportJSON()
    downloadJSON('mis-datos-kaizenai.json', JSON.parse(json))
  }
  const clearAll = async () => {
    await dexieRepo.clearAll()
    setConfirming(false)
    setDeleted(true)
    await refresh()
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center gap-2 text-secondary-text">
        <ShieldCheck size={20} aria-hidden />
        <span className="text-sm font-semibold uppercase tracking-wide">{t('gov.datos.tag')}</span>
      </div>
      <h1 className="mt-2 font-serif text-2xl text-ink sm:text-3xl">{t('gov.datos.title')}</h1>
      <p className="mt-3 text-muted">{t('gov.datos.intro')}</p>

      <div className="mt-5 rounded-2xl border border-line bg-surface p-5">
        <p className="text-ink">{t('gov.datos.count', { n: count })}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={exportAll}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-bg px-4 py-2 text-ink hover:bg-surface"
          >
            <Download size={18} /> {t('gov.datos.export')}
          </button>
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-rojo px-4 py-2 text-rojo-text hover:bg-rojo/10"
            >
              <Trash2 size={18} /> {t('gov.datos.delete')}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-rojo-text">{t('gov.datos.confirm')}</span>
              <button
                onClick={clearAll}
                className="rounded-xl bg-rojo px-3 py-2 text-sm font-medium text-white"
              >
                {t('gov.datos.confirmYes')}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-xl border border-line px-3 py-2 text-sm text-ink"
              >
                {t('gov.datos.confirmNo')}
              </button>
            </div>
          )}
        </div>
        {deleted && <p className="mt-3 text-sm text-verde-text">{t('gov.datos.deleted')}</p>}
      </div>

      <ul className="mt-5 space-y-2">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
            {t(`gov.datos.points.${i}`)}
          </li>
        ))}
      </ul>
    </div>
  )
}
