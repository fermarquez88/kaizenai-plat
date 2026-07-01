import { useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

// "Leer en voz alta" reutilizable (experiencia de kaizen-cuidadores): lee un texto con la
// voz del dispositivo (es-AR). Pieza de accesibilidad para público mayor, en toda la app.
export function LeerVoz({ texto, className }: { texto: string; className?: string }) {
  const [leyendo, setLeyendo] = useState(false)
  const disponible = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => () => { if (disponible) window.speechSynthesis.cancel() }, [disponible])
  if (!disponible) return null

  const alternar = () => {
    if (leyendo) { window.speechSynthesis.cancel(); setLeyendo(false); return }
    const u = new SpeechSynthesisUtterance(texto)
    u.lang = 'es-AR'
    u.rate = 0.95
    u.onend = () => setLeyendo(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
    setLeyendo(true)
  }

  return (
    <button
      onClick={alternar}
      aria-pressed={leyendo}
      className={'inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-sm text-ink hover:bg-bg ' + (className ?? '')}
    >
      {leyendo ? <VolumeX size={16} /> : <Volume2 size={16} />} {leyendo ? 'Detener' : 'Leer en voz alta'}
    </button>
  )
}
