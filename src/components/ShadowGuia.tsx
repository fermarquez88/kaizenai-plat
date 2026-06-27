import { useEffect, useRef, useState } from 'react'
import { GraduationCap, Volume2, VolumeX } from 'lucide-react'
import guiaCss from '../content/cuidador/guia/guia.css?raw'
import sprite from '../content/cuidador/guia/sprite.svg?raw'

// Porta la EXPERIENCIA de kaizen-cuidadores (no texto plano): tarjetas con niveles de
// detalle (Ahora mismo / Para sostener / A fondo), modo Experto y leer en voz alta. Usa
// Shadow DOM para traer el HTML+CSS originales con aislamiento total (sin pisar el tema de
// KaizenAI). Los comportamientos (segmentos, Experto, voz) los maneja React.
const BASE = `
.kc-root{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:var(--ink,#142a3a);line-height:1.55;padding:2px 2px 16px}
.kc-root *{box-sizing:border-box}
.kc-root a{color:var(--brand-d,#0a4f60)}
.reg-exp .expert{display:block}
`

export function ShadowGuia({ html }: { html: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [experto, setExperto] = useState(false)
  const [leyendo, setLeyendo] = useState(false)

  // Monta el contenido en el shadow root y cablea el control de nivel de detalle.
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: 'open' })
    shadow.innerHTML = `<style>${guiaCss}\n${BASE}</style>${sprite}<div class="kc-root">${html}</div>`
    const onClick = (e: Event) => {
      const btn = (e.target as HTMLElement).closest?.('.segbtn') as HTMLElement | null
      if (!btn) return
      const scope = (btn.closest('.body') as HTMLElement) ?? shadow
      const d = btn.getAttribute('data-d')
      scope.querySelectorAll('.segbtn').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)))
      scope.querySelectorAll('.dlevel').forEach((l) => l.classList.toggle('on', l.getAttribute('data-d') === d))
    }
    shadow.addEventListener('click', onClick)
    return () => shadow.removeEventListener('click', onClick)
  }, [html])

  // Modo Experto: muestra/oculta los bloques .expert (replica body.reg-exp del original).
  useEffect(() => {
    const root = hostRef.current?.shadowRoot?.querySelector('.kc-root')
    root?.classList.toggle('reg-exp', experto)
  }, [experto, html])

  // Leer en voz alta SOLO lo visible (innerText excluye lo oculto: niveles no activos, etc.).
  const leer = () => {
    if (typeof speechSynthesis === 'undefined') return
    if (leyendo) { speechSynthesis.cancel(); setLeyendo(false); return }
    const root = hostRef.current?.shadowRoot?.querySelector('.kc-root') as HTMLElement | null
    const texto = root?.innerText?.trim()
    if (!texto) return
    const u = new SpeechSynthesisUtterance(texto)
    u.lang = 'es-AR'
    u.rate = 0.95
    u.onend = () => setLeyendo(false)
    speechSynthesis.cancel()
    speechSynthesis.speak(u)
    setLeyendo(true)
  }
  useEffect(() => () => { if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel() }, [])

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 no-print">
        <div className="inline-flex rounded-xl border border-line bg-surface p-1 text-sm" role="group" aria-label="Nivel de lenguaje">
          <button onClick={() => setExperto(false)} aria-pressed={!experto} className={`rounded-lg px-3 py-1.5 ${!experto ? 'bg-primary text-white' : 'text-muted'}`}>Sencillo</button>
          <button onClick={() => setExperto(true)} aria-pressed={experto} className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 ${experto ? 'bg-primary text-white' : 'text-muted'}`}><GraduationCap size={15} /> Experto</button>
        </div>
        <button onClick={leer} className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-sm text-ink hover:bg-bg">
          {leyendo ? <VolumeX size={16} /> : <Volume2 size={16} />} {leyendo ? 'Detener' : 'Leer en voz alta'}
        </button>
      </div>
      {experto && <p className="mb-3 text-xs text-muted">«Experto» agrega el porqué neurobiológico, el método DICE y referencias. Aplica a toda la guía.</p>}
      <div ref={hostRef} />
    </div>
  )
}
