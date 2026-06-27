// Logo KaizenAI: cresta cordillerana (San Juan) sobre rayos de amanecer que irradian —
// luz/prevención y a la vez la red que se despliega desde un centro. Adaptado del tatuaje.
// Usa currentColor para heredar el color del contenedor.
export function Logo({ className }: { className?: string }) {
  // Rayos que bajan en abanico desde un foco bajo la cresta.
  const fx = 24
  const fy = 19
  const fin: [number, number][] = [
    [5, 30], [8, 39], [13, 44], [18.5, 46.5], [24, 47.5], [29.5, 46.5], [35, 44], [40, 39], [43, 30],
  ]
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="KaizenAI" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" opacity="0.85">
        {fin.map(([x, y], i) => (
          <line key={i} x1={fx} y1={fy} x2={x} y2={y} />
        ))}
      </g>
      {/* cresta cordillerana ondulada */}
      <path
        d="M4 19 C 8 13.5, 12 15, 15.5 17 C 18.5 18.5, 20 12.5, 24 13.5 C 28 14.5, 30 18, 33.5 16 C 37 14, 40 16, 44 18.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
