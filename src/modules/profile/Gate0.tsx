import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Phone } from 'lucide-react'

// GATE 0 — banderas rojas / ACV. Paso de SEGURIDAD, independiente y previo a la puerta
// (must-fix #1 del panel clínico: el rediseño no puede absorberlo). "Sí" corta el flujo
// con derivación inmediata; "No" se colapsa para no estorbar.
export function Gate0() {
  const { t } = useTranslation()
  const [ans, setAns] = useState<null | 'si' | 'no'>(null)

  if (ans === 'si') {
    return (
      <div role="alert" className="rounded-2xl border-2 border-rojo bg-rojo/10 p-5">
        <p className="flex items-center gap-2 font-serif text-xl text-rojo-text">
          <AlertTriangle size={24} /> {t('gate0.urgenciaTitle')}
        </p>
        <p className="mt-2 text-ink">{t('gate0.urgenciaBody')}</p>
        <a
          href="tel:107"
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-rojo px-5 py-3 text-lg font-semibold text-white"
        >
          <Phone size={20} /> {t('gate0.llamar')}
        </a>
        <button onClick={() => setAns(null)} className="mt-3 block text-sm text-muted underline">
          {t('gate0.volver')}
        </button>
      </div>
    )
  }
  if (ans === 'no') return null

  return (
    <div className="rounded-2xl border border-amarillo bg-amarillo/10 p-4">
      <p className="font-medium text-ink">{t('gate0.pregunta')}</p>
      <p className="mt-1 text-sm text-muted">{t('gate0.aclaracion')}</p>
      <div className="mt-3 flex gap-2">
        <button onClick={() => setAns('si')} className="rounded-xl bg-rojo px-6 py-2.5 font-medium text-white">
          {t('gate0.si')}
        </button>
        <button onClick={() => setAns('no')} className="rounded-xl border border-line bg-surface px-6 py-2.5 text-ink">
          {t('gate0.no')}
        </button>
      </div>
    </div>
  )
}
