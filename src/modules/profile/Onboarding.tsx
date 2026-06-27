import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowRight, HeartHandshake, User } from 'lucide-react'
import { useSettings } from '../../lib/store'

// Onboarding de IDENTIDAD (primer uso): deja claro QUIÉN sos, A QUIÉN vas a acompañar y
// CÓMO te llamamos (alias, sin PII) ANTES de la puerta. Resuelve los 4 gaps de Fernando:
// saludo, de quién es el perfil, cuidador→N personas, propósito (cuidador vs persona).
export function Onboarding() {
  const { profileId } = useParams()
  const esCuidador = profileId === 'cuidador'
  const setSelfAlias = useSettings((s) => s.setSelfAlias)
  const addPersona = useSettings((s) => s.addPersona)
  const setUsuarioRol = useSettings((s) => s.setUsuarioRol)
  const [alias, setAlias] = useState('') // persona: yo · cuidador: a quién acompaño
  const [relacion, setRelacion] = useState('familiar')
  const [respondente, setRespondente] = useState<'persona' | 'cuidador' | 'mixto'>('mixto')

  const valido = alias.trim().length > 0
  const continuar = () => {
    if (!valido) return
    if (esCuidador) {
      setUsuarioRol('cuidador')
      addPersona(alias.trim(), relacion, respondente) // crea su ficha y la activa
    } else {
      setSelfAlias(alias.trim()) // crea/activa "yo"
    }
    // El cambio de store re-renderiza la puerta automáticamente.
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface text-secondary">
        {esCuidador ? <HeartHandshake size={26} /> : <User size={26} />}
      </span>
      <h1 className="mt-4 font-serif text-2xl text-ink sm:text-3xl">
        {esCuidador ? 'Vas a acompañar a alguien' : 'Vamos a cuidar tu memoria'}
      </h1>
      <p className="mt-2 text-muted">
        {esCuidador
          ? 'Primero, ¿a quién vas a acompañar? Usá un apodo o sus iniciales (no el nombre completo).'
          : '¿Cómo querés que te llamemos? Un apodo o tus iniciales (no tu nombre completo).'}
      </p>

      <label className="mt-6 block text-sm font-medium text-ink">
        {esCuidador ? 'Apodo o iniciales de la persona' : 'Tu apodo o iniciales'}
      </label>
      <input
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        placeholder={esCuidador ? 'Ej.: "mi mamá", "L. F."' : 'Ej.: "Marta", "M. R."'}
        className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-3 text-lg text-ink focus:border-secondary"
        autoFocus
      />

      {esCuidador && (
        <>
          <label className="mt-4 block text-sm font-medium text-ink">¿Qué relación tenés?</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {[['familiar', 'Familiar'], ['pareja', 'Pareja'], ['vecino', 'Vecino/a'], ['otro', 'Otro']].map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => setRelacion(v)}
                aria-pressed={relacion === v}
                className={'rounded-xl border px-4 py-2 text-sm ' + (relacion === v ? 'border-secondary bg-secondary/10 text-secondary-text' : 'border-line bg-surface text-ink')}
              >
                {l}
              </button>
            ))}
          </div>

          <label className="mt-4 block text-sm font-medium text-ink">¿Quién va a responder las preguntas?</label>
          <p className="text-xs text-muted">Si la memoria está muy afectada, podés responder vos. Se puede cambiar después.</p>
          <div className="mt-1 flex flex-col gap-2">
            {([['persona', `${alias.trim() || 'La persona'} puede responder`], ['cuidador', 'Respondo yo por ella'], ['mixto', 'Un poco cada uno']] as const).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => setRespondente(v)}
                aria-pressed={respondente === v}
                className={'rounded-xl border px-4 py-2.5 text-left text-sm ' + (respondente === v ? 'border-secondary bg-secondary/10 text-secondary-text' : 'border-line bg-surface text-ink')}
              >
                {l}
              </button>
            ))}
          </div>
        </>
      )}

      <button
        onClick={continuar}
        disabled={!valido}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-lg font-medium text-white disabled:opacity-40"
      >
        {esCuidador ? 'Continuar' : 'Empezar'} <ArrowRight size={22} />
      </button>
      <p className="mt-3 text-xs text-muted">No usamos tu nombre completo: tus datos quedan en este dispositivo.</p>
    </div>
  )
}
