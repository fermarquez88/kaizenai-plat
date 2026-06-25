import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Minus, Plus, Volume2, VolumeX } from 'lucide-react'
import { useSettings } from '../lib/store'
import { Logo } from './Logo'
import { ModuleNav } from './ModuleNav'

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const incFont = useSettings((s) => s.incFont)
  const decFont = useSettings((s) => s.decFont)
  const fontScale = useSettings((s) => s.fontScale)
  const [speaking, setSpeaking] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const atHome = ['/', '', '/inicio'].includes(location.pathname)
  // Back ANCLADO: dentro de un módulo de un rol, "volver" lleva a "mi panel" (/p/:rol),
  // no al historial impredecible del navegador.
  const enModulo = location.pathname.match(/^\/p\/([^/]+)\/.+/)
  const panelHref = enModulo ? `/p/${enModulo[1]}` : null
  // Nav de módulos: visible dentro de un rol, oculta en el chequeo (que tiene su propia barra).
  const rol = location.pathname.match(/^\/p\/([^/]+)(?:\/(.*))?$/)
  const showModuleNav = !!rol && (rol[2] ?? '').split('/')[0] !== 'preconsulta'

  return (
    <div className={'min-h-screen flex flex-col ' + (showModuleNav ? 'pb-16' : '')}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-20 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-white"
      >
        {t('common.skip')}
      </a>
      <header className="sticky top-0 z-10 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2">
            {panelHref ? (
              <Link
                to={panelHref}
                aria-label={t('nav.miPanel')}
                className="inline-flex items-center gap-1 rounded-lg p-3 text-muted hover:bg-surface"
              >
                <ArrowLeft size={20} />
                <span className="hidden text-sm sm:inline">{t('nav.miPanel')}</span>
              </Link>
            ) : (
              !atHome && (
                <button
                  onClick={() => navigate(-1)}
                  aria-label={t('common.back')}
                  className="rounded-lg p-3 text-muted hover:bg-surface"
                >
                  <ArrowLeft size={20} />
                </button>
              )
            )}
            <Link to="/inicio" className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-secondary" />
              <span className="leading-none">
                <span className="block font-serif text-lg text-ink">{t('app.name')}</span>
                <span className="block font-sans text-xs text-muted">{t('app.tagline')}</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={decFont}
              disabled={fontScale <= 0.9}
              aria-label={t('common.fontSmaller')}
              className="rounded-lg p-3 text-muted hover:bg-surface disabled:opacity-40"
            >
              <Minus size={18} />
            </button>
            <span className="select-none text-xs text-muted" aria-hidden>
              A
            </span>
            <button
              onClick={incFont}
              disabled={fontScale >= 1.4}
              aria-label={t('common.fontLarger')}
              className="rounded-lg p-3 text-muted hover:bg-surface disabled:opacity-40"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={() => {
                const synth = window.speechSynthesis
                if (!synth) return
                if (speaking) {
                  synth.cancel()
                  setSpeaking(false)
                  return
                }
                const m = document.querySelector('main')
                let txt = ''
                if (m instanceof HTMLElement) {
                  const clone = m.cloneNode(true) as HTMLElement
                  // No leer el detalle profesional ni controles: voz clara para la persona.
                  clone.querySelectorAll('details, .no-print').forEach((el) => el.remove())
                  txt = clone.innerText.trim().slice(0, 1500)
                  const cut = txt.lastIndexOf('. ')
                  if (cut > 400) txt = txt.slice(0, cut + 1)
                }
                synth.cancel()
                if (!txt) return
                const u = new SpeechSynthesisUtterance(txt)
                u.lang = 'es-AR'
                u.rate = 0.95
                u.onend = () => setSpeaking(false)
                u.onerror = () => setSpeaking(false)
                setSpeaking(true)
                synth.speak(u)
              }}
              aria-label={speaking ? t('common.voiceStop') : t('common.voice')}
              aria-pressed={speaking}
              className={'rounded-lg p-3 hover:bg-surface ' + (speaking ? 'text-secondary-text' : 'text-muted')}
            >
              {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <span
              className="ml-1 rounded-full border border-line bg-surface px-2 py-1 text-xs font-semibold text-secondary-text"
              title="Español"
            >
              ES
            </span>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">{children}</main>

      <footer className="border-t border-line bg-surface no-print">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-1 px-4 py-4 text-center text-xs text-muted">
          <span>{t('common.disclaimer')}</span>
          <Link to="/datos" className="text-secondary-text underline-offset-2 hover:underline">
            {t('gov.datos.footer')}
          </Link>
        </div>
      </footer>

      {showModuleNav && rol && <ModuleNav profileId={rol[1]} />}
    </div>
  )
}
