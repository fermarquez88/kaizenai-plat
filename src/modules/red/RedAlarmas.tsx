import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Activity, ArrowLeft, Check, ClipboardList, HeartHandshake, MessageCircle, Stethoscope, TriangleAlert } from 'lucide-react'
import { SEED_PERSONAS, type SeedPersona } from '../../seed/personas'
import { alarmasDeSeed, inputFromSeed } from '../../scoring/alarmasFromSeed'
import { colaPorRol, derivarAlarmas, type Alarma } from '../../scoring/alarmas'
import { lenteDe } from '../../app/lentes'
import type { MedibleTipo, PuntoMedible } from '../../scoring/medibles'
import { waMeLink } from '../../channel/ChannelAdapter'
import { usePedidos } from './pedidosStore'
import { estaRegistrada, useMediciones } from './medicionesStore'

// Valor representativo para la demo al "registrar una medición" (cierra el pedido → huella).
const VALOR_DEMO: Record<MedibleTipo, number> = {
  presionArterial: 130,
  hba1c: 6.4,
  ldl: 110,
  imc: 27,
  audicion: 25,
  vision: 0.2,
}

const SEV_CHIP: Record<Alarma['severidad'], string> = {
  aguda: 'border border-rojo bg-rojo/10 text-rojo-text',
  alta: 'border border-amarillo bg-amarillo/10 text-ink',
  media: 'border border-line bg-bg text-muted',
  baja: 'border border-line bg-bg text-muted',
}

// Aplica las mediciones registradas en sesión (la huella) sobre las personas seed.
function conHuella(personas: SeedPersona[], extra: Record<string, PuntoMedible[]>): SeedPersona[] {
  return personas.map((p) => {
    if (!p.medibles) return p
    const medibles = p.medibles.map((m) => {
      const k = `${p.id}:${m.tipo}`
      return extra[k] ? { ...m, puntos: [...m.puntos, ...extra[k]] } : m
    })
    return { ...p, medibles }
  })
}

export function RedAlarmas() {
  const { t } = useTranslation()
  const { profileId } = useParams()
  const rol = lenteDe(profileId).rol
  const [now] = useState(() => Date.now())
  const [extra, setExtra] = useState<Record<string, PuntoMedible[]>>({})
  const [cerradas, setCerradas] = useState<Set<string>>(new Set())
  const [victoria, setVictoria] = useState(false)
  const pedidosCreados = usePedidos((s) => s.pedidos)
  const cerrarPedidoStore = usePedidos((s) => s.cerrarPedido)
  const registradas = useMediciones((s) => s.registradas)
  // Cada rol abre SU panel desde la cola (no todos a la ficha).
  const panelDeRol = (personId: string) =>
    rol === 'neuropsico' ? `/p/${profileId}/neuropsico/${personId}` : rol === 'trabajadorSocial' ? `/p/${profileId}/social/${personId}` : `/p/${profileId}/ficha/${personId}`

  const personas = useMemo(() => conHuella(SEED_PERSONAS, extra), [extra])

  // Registrar una medición = cerrar el pedido dejando un dato (huella longitudinal → LHS).
  const registrarMedicion = (a: Alarma) => {
    const tipo = a.detalle as MedibleTipo
    const k = `${a.personId}:${tipo}`
    const punto: PuntoMedible = { valor: VALOR_DEMO[tipo] ?? 0, fecha: now, autorRol: a.duenoRol, procedencia: 'medido' }
    setExtra((e) => ({ ...e, [k]: [...(e[k] ?? []), punto] }))
    festejar()
  }
  const cerrar = (a: Alarma) => {
    setCerradas((s) => new Set(s).add(a.id))
    cerrarPedidoStore(a.id) // si es un pedido creado, lo cierra en el store (no-op si es derivado)
    festejar()
  }
  // Etiqueta legible del alcance de un pedidoCompletar.
  const alc = (s?: string) => (s ? t(`alcance.${s.replace(':', '_')}`, { defaultValue: s }) : '')
  const festejar = () => {
    setVictoria(true)
    window.setTimeout(() => setVictoria(false), 2200)
  }

  // ── Vista DÍADA: "Esto vamos a hacer juntos" — pasos de cuidado, sin jerga de alarma ──
  if (rol === 'diada') {
    const sujeto = personas.find((p) => p.id === 'p7') ?? personas.find((p) => p.medibles) ?? personas[0]
    const creadosSujeto = pedidosCreados.filter((p) => p.personId === sujeto.id && p.estado !== 'cerrada')
    const pasos = colaPorRol([...derivarAlarmas(inputFromSeed(sujeto, now)), ...creadosSujeto], 'diada')
      // La brecha de servicio es responsabilidad del Estado: NO se muestra como tarea de la persona.
      .filter((a) => !a.brechaDeServicio && !cerradas.has(a.id))

    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <BackLink profileId={profileId} t={t} />
        <h1 className="font-serif text-2xl text-ink sm:text-3xl">{t('alarmas.diada.title')}</h1>
        <p className="mt-1 text-sm text-muted">{t('alarmas.diada.intro', { alias: sujeto.alias })}</p>
        {victoria && <MicroVictoria t={t} />}

        {pasos.length === 0 ? (
          <p className="mt-6 rounded-xl border border-verde bg-verde/10 p-4 text-sm text-verde-text">
            {t('alarmas.diada.alDia')}
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {pasos.map((a) => (
              <li key={a.id} className="rounded-2xl border border-line bg-surface p-4">
                <p className="font-medium text-ink">{t(`alarmas.pasoPersona.${a.accion}`, { medible: t(`alarmas.medible.${a.detalle}`, { defaultValue: '' }), que: alc(a.alcance) })}</p>
                <p className="mt-1 text-sm text-muted">{t(`alarmas.pasoPersonaSub.${a.accion}`, { defaultValue: t('alarmas.diada.acompana') })}</p>
                <div className="mt-3">
                  {a.tipo === 'pedidoMedicion' ? (
                    <button onClick={() => registrarMedicion(a)} className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white">
                      <Check size={16} /> {t('alarmas.diada.hecho')}
                    </button>
                  ) : (
                    <button onClick={() => cerrar(a)} className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-4 py-2 text-sm text-ink hover:bg-bg">
                      <Check size={16} /> {t('alarmas.diada.listo')}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-6 text-xs text-muted">{t('alarmas.diada.derechos')}</p>
      </div>
    )
  }

  // ── Vista PROFESIONAL/AGENTE/GESTOR: la cola única filtrada por rol ────────────────────
  const todas = [...alarmasDeSeed(personas, now), ...pedidosCreados.filter((p) => p.estado !== 'cerrada')]
  const cola = colaPorRol(todas, rol)
    .filter((a) => !cerradas.has(a.id))
    // Oculta mediciones ya registradas por enfermería (huella persistida) → cola real.
    .filter((a) => !(a.tipo === 'pedidoMedicion' && estaRegistrada(registradas, a.personId, a.detalle)))
  const agudas = cola.filter((a) => a.tipo === 'aguda').length
  const brechas = cola.filter((a) => a.brechaDeServicio).length

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <BackLink profileId={profileId} t={t} />
      <h1 className="font-serif text-2xl text-ink sm:text-3xl">{t('alarmas.title')}</h1>
      <p className="mt-1 text-sm text-muted">{t('alarmas.intro', { rol: t(`alarmas.rol.${rol}`) })}</p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Kpi label={t('alarmas.kpi.abiertas')} value={String(cola.length)} />
        <Kpi label={t('alarmas.kpi.agudas')} value={String(agudas)} cls={agudas ? 'text-rojo-text' : 'text-ink'} />
        <Kpi label={t('alarmas.kpi.brechas')} value={String(brechas)} cls={brechas ? 'text-accent-text' : 'text-ink'} />
      </div>
      {victoria && <MicroVictoria t={t} />}

      {cola.length === 0 ? (
        <p className="mt-6 rounded-xl border border-verde bg-verde/10 p-4 text-sm text-verde-text">{t('alarmas.vacia')}</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {cola.map((a) => {
            const persona = personas.find((p) => p.id === a.personId)
            return (
              <li key={a.id} className={'rounded-2xl border bg-surface p-4 ' + (a.tipo === 'aguda' ? 'border-rojo' : 'border-line')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-medium text-ink">
                      <TipoIcon tipo={a.tipo} />
                      {a.alias} <span className="text-xs text-muted">· {t(`alarmas.tipo.${a.tipo}`)}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-muted">
                      {t(`alarmas.detalleTexto.${a.tipo}`, {
                        medible: t(`alarmas.medible.${a.detalle}`, { defaultValue: a.detalle ?? '' }),
                        dias: a.detalle,
                        que: alc(a.alcance),
                        defaultValue: '',
                      })}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {t('alarmas.dueno')}: <span className="text-ink">{t(`alarmas.rol.${a.duenoRol}`)}</span> · {t('alarmas.prioridad')} {Math.round(a.prioridad)}
                    </p>
                    {a.brechaDeServicio && (
                      <p className="mt-2 rounded-lg border border-accent bg-accent/10 p-2 text-xs text-accent-text">
                        <strong>{t('alarmas.brecha.badge')}</strong> — {t('alarmas.brecha.note')}
                      </p>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${SEV_CHIP[a.severidad]}`}>
                    {t(`alarmas.severidad.${a.severidad}`)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to={`/p/${profileId}/ficha/${a.personId}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink hover:bg-bg"
                  >
                    {t('alarmas.verFicha')}
                  </Link>
                  {a.brechaDeServicio ? (
                    <span className="text-xs text-muted">{t('alarmas.brecha.accion')}</span>
                  ) : a.tipo === 'pedidoMedicion' ? (
                    <Link to={`/p/${profileId}/vitales/${a.personId}`} className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white">
                      <Activity size={16} /> {t('alarmas.btn.medir')}
                    </Link>
                  ) : a.tipo === 'noVolvio' ? (
                    <>
                      {persona?.phone && (
                        <a href={waMeLink(persona.phone, t('seguimiento.msg', { alias: a.alias }))} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-white">
                          <MessageCircle size={16} /> {t('alarmas.btn.contacto')}
                        </a>
                      )}
                      <button onClick={() => cerrar(a)} className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink hover:bg-bg">
                        <Check size={16} /> {t('alarmas.btn.cerrar')}
                      </button>
                    </>
                  ) : (
                    <Link to={panelDeRol(a.personId)} className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white">
                      {a.tipo === 'aguda' ? <Stethoscope size={16} /> : <HeartHandshake size={16} />}
                      {t(`alarmas.btn.${a.accion}`, { defaultValue: t('alarmas.btn.cerrar') })}
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function BackLink({ profileId, t }: { profileId?: string; t: (k: string) => string }) {
  return (
    <Link to={`/p/${profileId ?? 'agente'}`} className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink no-print">
      <ArrowLeft size={16} /> {t('common.back')}
    </Link>
  )
}

function Kpi({ label, value, cls }: { label: string; value: string; cls?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-0.5 font-serif text-2xl ${cls ?? 'text-ink'}`}>{value}</p>
    </div>
  )
}

function MicroVictoria({ t }: { t: (k: string) => string }) {
  return (
    <p className="mt-4 inline-flex items-center gap-1 rounded-full border border-verde bg-verde/10 px-3 py-1.5 text-sm text-verde-text">
      <Check size={16} /> {t('alarmas.microVictoria')}
    </p>
  )
}

function TipoIcon({ tipo }: { tipo: Alarma['tipo'] }) {
  if (tipo === 'aguda') return <Stethoscope size={16} className="text-rojo-text" />
  if (tipo === 'noVolvio') return <MessageCircle size={16} className="text-secondary" />
  if (tipo === 'pedidoMedicion') return <Activity size={16} className="text-secondary" />
  return <TriangleAlert size={16} className="text-accent-text" />
}
