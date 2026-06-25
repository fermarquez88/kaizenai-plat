import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Check, HeartPulse, Send, Stethoscope, Users } from 'lucide-react'
import { crearPedido, type Rol } from '../../scoring/alarmas'
import { SEED_PERSONAS } from '../../seed/personas'
import { usePedidos } from './pedidosStore'

// Panel de pedidos: CUALQUIER actor (médico, enfermera, agente) pide completar el perfil,
// ruteado por DESTINO y con ALCANCE. Multi-select. Cada marca = un pedidoCompletar (alarma).
const GRUPOS: { grupo: string; destino: Rol; icon: typeof Users; items: { alcance: string }[] }[] = [
  {
    grupo: 'diada',
    destino: 'diada',
    icon: Users,
    items: [{ alcance: 'minima-completa' }, { alcance: 'modulo:sueno' }, { alcance: 'modulo:habitos' }, { alcance: 'modulo:social' }],
  },
  {
    grupo: 'enfermeria',
    destino: 'enfermero',
    icon: HeartPulse,
    items: [{ alcance: 'minima-obligatoria' }, { alcance: 'medir:presionArterial' }, { alcance: 'medir:hba1c' }, { alcance: 'medir:ldl' }],
  },
  {
    grupo: 'neuropsico',
    destino: 'neuropsico',
    icon: Stethoscope,
    items: [{ alcance: 'test:bateria' }, { alcance: 'test:ACE-III' }, { alcance: 'test:MMSE' }, { alcance: 'test:RAVLT' }, { alcance: 'test:TMT' }],
  },
]

const alcLabel = (t: (k: string, o?: Record<string, unknown>) => string, alcance: string) =>
  t(`alcance.${alcance.replace(':', '_')}`, { defaultValue: alcance })

export function PanelPedidos() {
  const { t } = useTranslation()
  const { profileId, personId } = useParams()
  const navigate = useNavigate()
  const addPedidos = usePedidos((s) => s.addPedidos)
  const persona = SEED_PERSONAS.find((p) => p.id === personId)
  const alias = persona?.alias ?? personId ?? '—'
  const [sel, setSel] = useState<Set<string>>(new Set())

  const toggle = (alcance: string) =>
    setSel((s) => {
      const n = new Set(s)
      if (n.has(alcance)) n.delete(alcance)
      else n.add(alcance)
      return n
    })

  const confirmar = () => {
    if (!personId) return
    const now = Date.now()
    const pedidos = GRUPOS.flatMap((g) =>
      g.items.filter((it) => sel.has(it.alcance)).map((it) => crearPedido({ personId, alias, destinoRol: g.destino, alcance: it.alcance, now })),
    )
    if (pedidos.length) addPedidos(pedidos)
    navigate(`/p/${profileId}/alarmas`)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-28">
      <Link to={`/p/${profileId}/alarmas`} className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink no-print">
        <ArrowLeft size={16} /> {t('common.back')}
      </Link>
      <h1 className="font-serif text-2xl text-ink sm:text-3xl">{t('panel.title')}</h1>
      <p className="mt-1 text-sm text-muted">{t('panel.intro', { alias })}</p>

      <div className="mt-5 space-y-5">
        {GRUPOS.map((g) => {
          const Icon = g.icon
          return (
            <section key={g.grupo} className="rounded-2xl border border-line bg-surface p-4">
              <p className="flex items-center gap-2 font-medium text-ink">
                <Icon size={18} className="text-secondary" /> {t(`panel.grupo.${g.grupo}`)}
              </p>
              <ul className="mt-3 space-y-2">
                {g.items.map((it) => {
                  const on = sel.has(it.alcance)
                  return (
                    <li key={it.alcance}>
                      <button
                        onClick={() => toggle(it.alcance)}
                        aria-pressed={on}
                        className={'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left ' + (on ? 'border-secondary bg-secondary/10' : 'border-line bg-bg')}
                      >
                        <span className={'inline-flex h-5 w-5 items-center justify-center rounded border ' + (on ? 'border-secondary bg-secondary text-white' : 'border-line')}>
                          {on && <Check size={14} />}
                        </span>
                        <span className="text-sm text-ink">{alcLabel(t, it.alcance)}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-bg/90 backdrop-blur no-print">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <span className="text-sm text-muted">{t('panel.seleccionados', { n: sel.size })}</span>
          <button
            onClick={confirmar}
            disabled={sel.size === 0}
            className="ml-auto inline-flex items-center gap-1 rounded-xl bg-primary px-5 py-2.5 font-medium text-white disabled:opacity-40"
          >
            <Send size={18} /> {t('panel.crear')}
          </button>
        </div>
      </div>
    </div>
  )
}
