import { useTranslation } from 'react-i18next'
import { ShieldCheck } from 'lucide-react'

// Aviso legal / privacidad (Ley 25.326 — datos personales sensibles). Cierra el vacío
// señalado por el panel (sin política de privacidad / responsable del tratamiento).
// El 'responsable' va como placeholder hasta confirmar la entidad real.
export function AvisoLegal() {
  const { t } = useTranslation()
  const Section = ({ k }: { k: string }) => (
    <section className="mt-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t(`aviso.${k}.t`)}</h2>
      <p className="mt-1 text-ink">{t(`aviso.${k}.d`)}</p>
    </section>
  )
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="flex items-center gap-2 font-serif text-2xl text-ink sm:text-3xl">
        <ShieldCheck size={24} aria-hidden /> {t('aviso.title')}
      </h1>
      <p className="mt-2 text-muted">{t('aviso.intro')}</p>

      <Section k="responsable" />
      <Section k="baseLegal" />
      <Section k="datos" />
      <Section k="derechos" />
      <Section k="onDevice" />
      <Section k="noDx" />

      <p className="mt-6 text-xs text-muted">{t('aviso.nota')}</p>
    </div>
  )
}
