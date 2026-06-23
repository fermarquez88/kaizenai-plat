// "Persona-nodo": una persona en el centro de una red de nodos conectados.
// Usa currentColor para heredar el color del contenedor.
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="KaizenAI"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeWidth="1.6" opacity="0.4">
        <line x1="24" y1="24" x2="24" y2="7" />
        <line x1="24" y1="24" x2="39" y2="15" />
        <line x1="24" y1="24" x2="39" y2="33" />
        <line x1="24" y1="24" x2="24" y2="41" />
        <line x1="24" y1="24" x2="9" y2="33" />
        <line x1="24" y1="24" x2="9" y2="15" />
      </g>
      <g fill="currentColor" opacity="0.65">
        <circle cx="24" cy="7" r="2.8" />
        <circle cx="39" cy="15" r="2.8" />
        <circle cx="39" cy="33" r="2.8" />
        <circle cx="24" cy="41" r="2.8" />
        <circle cx="9" cy="33" r="2.8" />
        <circle cx="9" cy="15" r="2.8" />
      </g>
      <circle cx="24" cy="24" r="7.5" fill="currentColor" />
    </svg>
  )
}
