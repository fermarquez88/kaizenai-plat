import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Volume2, VolumeX } from 'lucide-react'
import { useSettings } from '../../lib/store'

// Control de voz prominente para la puerta de la persona. La voz arranca ENCENDIDA
// (decisión 2026-06-25); por eso, la primera vez, una SEÑAL ANIMADA (anillo que late +
// flecha que rebota + texto) muestra cómo apagarla. Respeta prefers-reduced-motion.
export function VozControl({ text }: { text: string }) {
  const { t } = useTranslation()
  const voiceOn = useSettings((s) => s.voiceOn)
  const setVoiceOn = useSettings((s) => s.setVoiceOn)
  const hintDismissed = useSettings((s) => s.voiceHintDismissed)
  const dismissHint = useSettings((s) => s.dismissVoiceHint)
  const spoke = useRef(false)

  const speak = (txt: string) => {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined
    if (!synth) return
    synth.cancel()
    const u = new SpeechSynthesisUtterance(txt.slice(0, 1200))
    u.lang = 'es-AR'
    u.rate = 0.95
    synth.speak(u)
  }

  // Lee al entrar si la voz está encendida (best-effort: algunos navegadores piden gesto).
  useEffect(() => {
    if (voiceOn && text && !spoke.current) {
      spoke.current = true
      speak(text)
    }
    return () => window.speechSynthesis?.cancel()
  }, [voiceOn, text])

  const toggle = () => {
    if (!hintDismissed) dismissHint()
    if (voiceOn) {
      window.speechSynthesis?.cancel()
      setVoiceOn(false)
    } else {
      setVoiceOn(true)
      speak(text)
    }
  }

  const cuing = voiceOn && !hintDismissed

  return (
    <div className="relative inline-flex items-center gap-3 no-print">
      {cuing && (
        <span
          className="pointer-events-none absolute -left-1 -top-1 h-12 w-12 rounded-2xl ring-4 ring-secondary/50 animate-ping motion-reduce:hidden"
          aria-hidden
        />
      )}
      <button
        onClick={toggle}
        aria-pressed={voiceOn}
        className={
          'relative inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-base font-medium transition ' +
          (voiceOn ? 'bg-secondary text-white' : 'border border-line bg-surface text-ink')
        }
      >
        {voiceOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
        {voiceOn ? t('voz.on') : t('voz.off')}
      </button>
      {cuing && (
        <span
          className="inline-flex items-center gap-1 text-sm font-medium text-secondary animate-bounce motion-reduce:animate-none"
          aria-hidden
        >
          👈 {t('voz.hint')}
        </span>
      )}
    </div>
  )
}
