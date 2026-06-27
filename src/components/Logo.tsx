// Logo KaizenAI: la CONCHA/VIEIRA del Camino de Santiago (logo WTD) — "muchos caminos
// llevan a un mismo lugar": los radios (caminos) convergen a un punto (la meta común: la
// salud cerebral). Adaptado del tatuaje a la identidad visual (terracota + teal).
const FOCO: [number, number] = [24, 17]
const N = 11
const SPAN = [38, 142] // grados; abanico hacia ABAJO (90 = recto)
const L = 26
const TEAL = '#2E7D74'
const TERRACOTA = '#B5552E'
const ribs = Array.from({ length: N }, (_, i) => {
  const a = ((SPAN[0] + ((SPAN[1] - SPAN[0]) * i) / (N - 1)) * Math.PI) / 180
  return [FOCO[0], FOCO[1], +(FOCO[0] + L * Math.cos(a)).toFixed(2), +(FOCO[1] + L * Math.sin(a)).toFixed(2)] as const
})

export function Logo({ className, mono = false }: { className?: string; mono?: boolean }) {
  const ribColor = mono ? 'currentColor' : TEAL
  const rimColor = mono ? 'currentColor' : TERRACOTA
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="KaizenAI" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* radios (caminos) que convergen al foco */}
      <g stroke={ribColor} strokeWidth="1.6" strokeLinecap="round" opacity={mono ? 0.8 : 0.92}>
        {ribs.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
      {/* borde fileteado (festón) de la concha */}
      <path
        d="M6 17 Q 9.6 11.5 13.2 16 Q 16.8 11.5 20.4 16 Q 24 11 27.6 16 Q 31.2 11.5 34.8 16 Q 38.4 11.5 42 17"
        stroke={rimColor}
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
