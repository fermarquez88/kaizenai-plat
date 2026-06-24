import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Minus, Plus, Volume2 } from 'lucide-react'
import { useSettings } from '../lib/store'
import { Logo } from './Logo'

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const incFont = useSettings((s) => s.incFont)
  const decFont = useSettings((s) => s.decFont)
  const location = useLocation()
  const navigate = useNavigate()
  const atHome = location.pathname === '/' || location.pathname === ''

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-20 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-white"
      >
        {t('common.skip')}
      </a>
      <header className="sticky top-0 z-10 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2">
            {!atHome && (
              <button
                onClick={() => navigate(-1)}
                aria-label={t('common.back')}
                className="rounded-lg p-3 text-muted hover:bg-surface"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-secondary" />
              <span className="leading-none">
                <span className="block font-serif text-lg text-ink">{t('app.name')}</span>
                <span className="block font-sans text-[11px] text-muted">{t('app.tagline')}</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={decFont}
              aria-label={t('common.fontSmaller')}
              className="rounded-lg p-3 text-muted hover:bg-surface"
            >
              <Minus size={18} />
            </button>
            <span className="select-none text-xs text-muted" aria-hidden>
              A
            </span>
            <button
              onClick={incFont}
              aria-label={t('common.fontLarger')}
              className="rounded-lg p-3 text-muted hover:bg-surface"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={() => {
                if (!window.speechSynthesis) return
                const m = document.querySelector('main')
                const txt = (m instanceof HTMLElement ? m.innerText : '').trim().slice(0, 600)
                window.speechSynthesis.cancel()
                if (txt) {
                  const u = new SpeechSynthesisUtterance(txt)
                  u.lang = 'es-AR'
                  u.rate = 0.95
                  window.speechSynthesis.speak(u)
                }
              }}
              aria-label={t('common.voice')}
              className="rounded-lg p-3 text-muted hover:bg-surface"
            >
              <Volume2 size={18} />
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
    </div>
  )
}
