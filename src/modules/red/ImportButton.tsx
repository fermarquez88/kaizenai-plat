import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload } from 'lucide-react'
import { dexieRepo } from '../../data/dexieRepo'

// Bus de integración local-first: el agente/unidad importa el "sobre" que la
// persona compartió (archivo). Así el cribado de un dispositivo llega a otro
// sin backend central.
export function ImportButton({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation()
  const ref = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const onFile = async (file?: File) => {
    if (!file) return
    try {
      const r = await dexieRepo.importJSON(await file.text())
      setMsg(t('red.import.ok', { n: r.assessments }))
      onDone()
    } catch {
      setMsg(t('red.import.err'))
    }
    if (ref.current) ref.current.value = ''
    setTimeout(() => setMsg(null), 3500)
  }

  return (
    <div className="no-print">
      <button
        onClick={() => ref.current?.click()}
        className="inline-flex items-center gap-2 rounded-xl border border-secondary bg-surface px-4 py-2.5 font-medium text-secondary-text hover:bg-bg"
      >
        <Upload size={18} /> {t('red.import.btn')}
      </button>
      <input
        ref={ref}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {msg && <p className="mt-2 text-sm text-secondary-text">{msg}</p>}
    </div>
  )
}
