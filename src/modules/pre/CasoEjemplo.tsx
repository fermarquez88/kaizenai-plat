import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePreconsulta } from './preconsultaStore'
import { ResultadoStep } from './steps/ResultadoStep'

export function CasoEjemplo() {
  const { t } = useTranslation()
  const seedDemo = usePreconsulta((s) => s.seedDemo)
  const [ready, setReady] = useState(false)

  // Sembrar ANTES de montar el resultado, para que calcule sobre el caso de ejemplo.
  useEffect(() => {
    seedDemo()
    setReady(true)
  }, [seedDemo])

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 rounded-xl border border-line bg-bg p-3 text-sm text-muted no-print">
        {t('ejemplo.banner')}{' '}
        <Link
          to="/p/paciente/preconsulta"
          className="text-secondary-text underline underline-offset-2"
        >
          {t('ejemplo.real')}
        </Link>
      </div>
      {ready ? <ResultadoStep /> : <p className="text-muted">…</p>}
    </div>
  )
}
