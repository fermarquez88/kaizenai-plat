import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Check, ClipboardList, HeartPulse, Sparkles, Stethoscope, User } from 'lucide-react'
import { useSettings } from '../../lib/store'
import { Onboarding } from './Onboarding'
import { usePreconsulta } from '../pre/preconsultaStore'
import { avancePerfil } from '../../scoring/avancePerfil'
import { prioridadDominio } from '../../scoring/catalogoModulos'
import { colaPorRol, derivarAlarmas } from '../../scoring/alarmas'
import { inputFromSeed } from '../../scoring/alarmasFromSeed'
import { SEED_PERSONAS } from '../../seed/personas'
import { usePedidos } from '../red/pedidosStore'
import { Gate0 } from './Gate0'
import { VozControl } from './VozControl'

// Barra suave de avance (la persona ve el nivel cálido; el % es secundario).
function BarraAvance({ pct }: { pct: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-line" aria-hidden>
      <div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${Math.max(6, Math.round(pct * 100))}%` }} />
    </div>
  )
}

// Una fila de "sección por responsable": lo que falta de OTRO actor nunca se lee como
// deuda de la persona ("Falta que la enfermera cargue…"), sino como tarea de equipo.
function Seccion({ icon: Icon, titulo, estado, ok }: { icon: typeof User; titulo: string; estado: string; ok: boolean }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
      <span className={'inline-flex h-9 w-9 items-center justify-center rounded-lg ' + (ok ? 'bg-verde/15 text-verde-text' : 'bg-bg text-muted')}>
        {ok ? <Check size={18} /> : <Icon size={18} />}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{titulo}</p>
        <p className="text-xs text-muted">{estado}</p>
      </div>
    </li>
  )
}

export function MiSaludCerebral() {
  const { t } = useTranslation()
  const { profileId } = useParams()
  const demo = usePreconsulta((s) => s.demo)
  const lancet = usePreconsulta((s) => s.lancet)
  const instruments = usePreconsulta((s) => s.instruments)

  const av = useMemo(
    () => avancePerfil({ demo, lancet: lancet as Record<string, string | undefined>, instruments }),
    [demo, lancet, instruments],
  )
  // Pedidos a la díada (demo): reusa el caso p7, incluyendo los que creó el equipo de salud.
  const pedidosCreados = usePedidos((s) => s.pedidos)
  const pedidos = useMemo(() => {
    const sujeto = SEED_PERSONAS.find((p) => p.id === 'p7')
    if (!sujeto) return 0
    const creados = pedidosCreados.filter((p) => p.personId === sujeto.id && p.estado !== 'cerrada')
    return colaPorRol([...derivarAlarmas(inputFromSeed(sujeto, Date.UTC(2026, 5, 25))), ...creados], 'diada').filter(
      (a) => !a.brechaDeServicio,
    ).length
  }, [pedidosCreados])

  // ── Identidad/contexto: de quién es esta ficha + saludo por nombre ──────────────────
  const usuarioRol = useSettings((s) => s.usuarioRol)
  const setUsuarioRol = useSettings((s) => s.setUsuarioRol)
  const activePersonId = useSettings((s) => s.activePersonId)
  const personas = useSettings((s) => s.personas)
  useEffect(() => {
    if (!usuarioRol) setUsuarioRol(profileId === 'cuidador' ? 'cuidador' : 'persona')
  }, [profileId, usuarioRol, setUsuarioRol])
  const personaActiva = activePersonId ? personas[activePersonId] : undefined

  // Sin identidad resuelta → onboarding (quién sos / a quién acompañás / cómo te llamamos).
  if (!personaActiva) return <Onboarding />

  const esCuidador = usuarioRol === 'cuidador'
  const alias = personaActiva.alias
  const saludo = esCuidador ? `Estás acompañando a ${alias}` : `Hola ${alias}. Cuidemos tu memoria.`
  const preconsultaTo = `/p/${profileId}/preconsulta`
  const vozText = `${saludo} ${t(`puerta.nivel.${av.nivel}.sub`)}`
  const nuevo = av.necesario.answered === 0

  // ── LAUNCHPAD (primera vez): nunca un tablero vacío; una sola acción guiada ──────────
  if (nuevo) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8" id="puerta">
        <div className="mb-5"><VozControl text={vozText} /></div>
        <div className="mb-5"><Gate0 /></div>
        <h1 className="font-serif text-2xl text-ink sm:text-3xl">{saludo}</h1>
        <p className="mt-2 text-muted">{t('puerta.bienvenida')}</p>
        <Link
          to={`${preconsultaTo}?nuevo=1`}
          className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-5 text-white shadow-card"
        >
          <span className="text-lg font-medium">{t('puerta.cta.empezar')}</span>
          <ArrowRight size={24} />
        </Link>
        <p className="mt-3 text-sm text-muted">{t('puerta.empezarNota')}</p>
      </div>
    )
  }

  // ── ESPACIO (con avance): nivel cálido + próxima acción única + secciones ────────────
  // "Otros temas" ordenados de MÁS a MENOS deseable según la clasificación base.
  const deseables = av.dominios
    .filter((d) => d.pct < 1)
    .sort((a, b) => prioridadDominio(b.id) - prioridadDominio(a.id))
    .slice(0, 3)
  return (
    <div className="mx-auto max-w-2xl px-4 py-8" id="puerta">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="font-serif text-2xl text-ink sm:text-3xl">{saludo}</h1>
      </div>
      <div className="mb-5"><VozControl text={vozText} /></div>
      <div className="mb-5"><Gate0 /></div>

      {/* Avance del perfil — nivel cálido (la persona) + % chico (equipo) */}
      <section className="rounded-2xl border border-line bg-surface p-5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-serif text-xl text-ink">{t(`puerta.nivel.${av.nivel}.t`)}</p>
          <span className="text-xs text-muted">{Math.round(av.necesario.pct * 100)}%</span>
        </div>
        <p className="mt-0.5 text-sm text-muted">{t(`puerta.nivel.${av.nivel}.sub`)}</p>
        <div className="mt-3"><BarraAvance pct={av.necesario.pct} /></div>
        <p className="mt-1 text-xs text-muted">{t('puerta.avanceLabel')}</p>
      </section>

      {/* Próxima-mejor-acción ÚNICA */}
      {av.proxima && (
        <Link to={preconsultaTo} className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-4 text-white shadow-card">
          <span>
            <span className="block text-xs text-white/80">{t('puerta.proximoPaso')}</span>
            <span className="block text-lg font-medium">{t(`puerta.proxima.${av.proxima}`, { defaultValue: t('puerta.proxima.seguir') })}</span>
          </span>
          <ArrowRight size={24} />
        </Link>
      )}
      {!av.proxima && (
        <Link to={`/p/${profileId}/mi-resultado`} className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-verde px-5 py-4 text-white shadow-card">
          <span className="text-lg font-medium">{t('puerta.listo')}</span>
          <ArrowRight size={24} />
        </Link>
      )}

      {/* Lo que te pidieron (díada) */}
      {pedidos > 0 && (
        <Link to={`/p/${profileId}/alarmas`} className="mt-4 flex items-center gap-3 rounded-2xl border border-secondary bg-secondary/10 p-4">
          <ClipboardList className="text-secondary" />
          <div className="min-w-0">
            <p className="font-medium text-ink">{t('puerta.pedidos', { n: pedidos })}</p>
            <p className="text-sm text-muted">{t('puerta.pedidosSub')}</p>
          </div>
          <ArrowRight className="ml-auto shrink-0 text-muted" size={20} />
        </Link>
      )}

      {/* Secciones por responsable — anti-estigma: lo de otro actor no es deuda de la persona */}
      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{t('puerta.seccionesTitulo')}</h2>
        <ul className="space-y-2">
          <Seccion icon={User} titulo={t('puerta.sec.persona.t')} estado={av.proxima ? t('puerta.sec.persona.falta') : t('puerta.sec.persona.ok')} ok={!av.proxima} />
          <Seccion icon={HeartPulse} titulo={t('puerta.sec.vitales.t')} estado={t('puerta.sec.vitales.falta')} ok={false} />
          <Seccion icon={Stethoscope} titulo={t('puerta.sec.tests.t')} estado={t('puerta.sec.tests.falta')} ok={false} />
        </ul>
      </section>

      {/* Otros temas (2-3 deseables) */}
      {deseables.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{t('puerta.otrosTemas')}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {deseables.map((d) => (
              <Link key={d.id} to="/perfil" className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:shadow-card">
                <Sparkles size={18} className="mt-0.5 text-accent-text" />
                <div>
                  <p className="font-medium text-ink">{t(`completitud.dominio.${d.id}`)}</p>
                  <p className="text-sm text-muted">{t(`puerta.beneficio.${d.id}`, { defaultValue: t('puerta.beneficioGen') })}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Link
        to="/perfil"
        className="mt-6 flex items-center justify-between gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink"
      >
        <span>{t('puerta.elegir')}</span>
        <ArrowRight size={16} className="text-secondary" />
      </Link>

      <Link
        to={`/p/${profileId}/informe-doc`}
        className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink"
      >
        <span>{t('puerta.informe')}</span>
        <ArrowRight size={16} className="text-secondary" />
      </Link>
    </div>
  )
}
