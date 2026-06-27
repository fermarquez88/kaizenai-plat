import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarCheck, Check } from 'lucide-react'
import { personaSeed } from '../../seed/personas'
import { useRedRecords } from './redRecords'
import { useTurnos } from './turnosStore'

// Agendar un turno para una persona (agente/equipo) → cierra el loop de seguimiento.
export function AgendarTurno() {
  const { profileId, personId } = useParams()
  const navigate = useNavigate()
  const agendar = useTurnos((s) => s.agendar)
  const { records } = useRedRecords()
  const rec = records.find((r) => r.id === personId) ?? records.find((r) => r.id === `seed-${personId}`)
  const alias = rec?.alias ?? personaSeed(personId)?.alias ?? personId ?? '—'

  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [lugar, setLugar] = useState('Hospital Rawson · Memoria')
  const [nota, setNota] = useState('')
  const [listo, setListo] = useState(false)

  const guardar = () => {
    if (!personId || !fecha) return
    agendar({ personId, alias, fecha, hora: hora || undefined, lugar: lugar || undefined, nota: nota || undefined })
    setListo(true)
    window.setTimeout(() => navigate(`/p/${profileId}/agenda`), 900)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Link to={`/p/${profileId}/ficha/${personId}`} className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> Volver</Link>
      <h1 className="flex items-center gap-2 font-serif text-2xl text-ink"><CalendarCheck className="text-secondary" /> Agendar turno</h1>
      <p className="mt-1 text-sm text-muted">Para {alias}.</p>

      {listo ? (
        <div className="mt-5 rounded-2xl border border-verde bg-verde/10 p-5 text-center text-verde-text">
          <Check className="mx-auto" /> <p className="mt-1">Turno agendado. Lo verás en la Agenda.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <label className="block"><span className="text-sm text-ink">Fecha</span>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-ink" />
          </label>
          <label className="block"><span className="text-sm text-ink">Hora <span className="text-muted">(opcional)</span></span>
            <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-ink" />
          </label>
          <label className="block"><span className="text-sm text-ink">Lugar</span>
            <input type="text" value={lugar} onChange={(e) => setLugar(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-ink" />
          </label>
          <label className="block"><span className="text-sm text-ink">Nota <span className="text-muted">(opcional)</span></span>
            <textarea value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Motivo, indicaciones…" className="mt-1 min-h-[70px] w-full rounded-xl border border-line bg-bg px-3 py-2 text-ink" />
          </label>
          <button onClick={guardar} disabled={!fecha} className="w-full rounded-xl bg-primary py-3 font-medium text-white disabled:opacity-40">Agendar turno</button>
        </div>
      )}
    </div>
  )
}
