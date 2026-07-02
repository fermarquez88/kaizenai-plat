import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { usePreconsulta } from '../pre/preconsultaStore'
import { buildSummary } from '../../data/preconsultaSummary'
import { usePersona } from '../../data/usePersona'

// Informe de salud cerebral GENÉRICO e imprimible: sintetiza todas las capas del perfil
// (autorreporte + informante + objetivo + riesgo + medicación + determinantes) en un
// documento que el profesional imprime y SELLA. Un selector de propósito (CUD / derivación
// / apoyos / escolar-laboral / constancia) ajusta encabezado y pie; el cuerpo es el mismo.
// ⚠️ Estimación, no diagnóstico: vale el criterio y el sello del profesional.
type Proposito = 'cud' | 'derivacion' | 'apoyos' | 'escolar' | 'constancia'

const PROPOSITO_LABEL: Record<Proposito, { titulo: string; pie: string }> = {
  cud: { titulo: 'Para solicitud de Certificado Único de Discapacidad (CUD)', pie: 'Documento de apoyo a la solicitud de CUD. Adjuntar a la junta evaluadora.' },
  derivacion: { titulo: 'Para derivación / interconsulta', pie: 'Documento de derivación a especialista.' },
  apoyos: { titulo: 'Para gestión de apoyos sociales', pie: 'Documento de apoyo para programas y prestaciones sociales.' },
  escolar: { titulo: 'Para ámbito escolar / laboral', pie: 'Documento de constancia para adecuaciones escolares o laborales.' },
  constancia: { titulo: 'Constancia de evaluación', pie: 'Constancia de la evaluación realizada.' },
}

const CUD_LABEL: Record<string, string> = {
  vigente: 'vigente', tramite: 'en trámite', vencido: 'vencido', no: 'no posee', nose: 'no sabe', na: 'no aplica',
}

const NEURO_LABEL: Record<string, string> = { si: 'realizada', no: 'no realizada', pendiente: 'pendiente', nose: 'no sabe' }
const IMAGEN_LABEL: Record<string, string> = { rmn: 'Resonancia (RMN)', tc: 'Tomografía (TC)', no: 'no realizada', pendiente: 'pendiente', nose: 'no sabe' }
const HALLAZGO_LABEL: Record<string, string> = { normal: 'normal', atrofia: 'atrofia', vascular: 'lesiones vasculares', otro: 'otro hallazgo', pendiente: 'sin informe' }
const LAB_DEF: { id: string; label: string; unidad: string }[] = [
  { id: 'colesterol', label: 'Colesterol total', unidad: 'mg/dl' },
  { id: 'ldl', label: 'LDL', unidad: 'mg/dl' },
  { id: 'hdl', label: 'HDL', unidad: 'mg/dl' },
  { id: 'trigliceridos', label: 'Triglicéridos', unidad: 'mg/dl' },
  { id: 'hba1c', label: 'HbA1c', unidad: '%' },
  { id: 'tsh', label: 'TSH', unidad: 'µUI/ml' },
  { id: 'b12', label: 'Vitamina B12', unidad: 'pg/ml' },
]

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-4 break-inside-avoid">
      <h2 className="border-b border-line pb-1 text-sm font-semibold uppercase tracking-wide text-ink">{titulo}</h2>
      <div className="mt-2 text-sm text-ink">{children}</div>
    </section>
  )
}

export function InformeDocumento() {
  const { profileId, personId } = useParams()
  const intended = usePersona(personId)
  // El documento se arma con el chequeo cargado (usePreconsulta). Si vino con :personId y no
  // coincide, avisamos para no firmar datos de otra persona (riesgo detectado en auditoría).
  const coincide = !personId || (!!intended.dni && `dni-${intended.dni}` === personId)
  const demo = usePreconsulta((s) => s.demo)
  const lancet = usePreconsulta((s) => s.lancet)
  const instruments = usePreconsulta((s) => s.instruments)
  const factores = usePreconsulta((s) => s.factores)
  const meds = usePreconsulta((s) => s.meds)
  const redFlags = usePreconsulta((s) => s.redFlags)
  const cud = usePreconsulta((s) => s.cud)
  const estudios = usePreconsulta((s) => s.estudios)
  const [proposito, setProposito] = useState<Proposito>('cud')
  const [nota, setNota] = useState('')

  const s = useMemo(
    () => buildSummary({ demo, lancet, instruments, factores, meds, redFlags }, new Date().toISOString()),
    [demo, lancet, instruments, factores, meds, redFlags],
  )

  const pick = (ids: string[]) => s.instrumentScores.filter((i) => ids.includes(i.id))
  const cog = pick(['cqc', 'ad8', 'iqcode'])
  const fun = pick(['tadlq', 'faq'])
  const animo = pick(['gds', 'gad', 'ucla'])
  const otros = pick(['isi', 'mind', 'ipaq', 'auditc', 'frail', 'mnasf'])
  const fecha = new Date().toLocaleDateString('es-AR')
  const objetivo = pick(['ace', 'mmse']).length > 0 // (batería objetiva, cuando se conecte)

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Controles (no se imprimen) */}
      <div className="no-print mb-4">
        <Link to={`/p/${profileId}`} className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowLeft size={16} /> Volver
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-muted">Propósito:</label>
          <select
            value={proposito}
            onChange={(e) => setProposito(e.target.value as Proposito)}
            className="rounded-lg border border-line bg-bg px-2 py-1 text-ink"
          >
            <option value="cud">CUD (discapacidad)</option>
            <option value="derivacion">Derivación</option>
            <option value="apoyos">Apoyos sociales</option>
            <option value="escolar">Escolar / laboral</option>
            <option value="constancia">Constancia</option>
          </select>
          <button
            onClick={() => window.print()}
            className="ml-auto inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            <Printer size={16} /> Imprimir
          </button>
        </div>
        {!coincide && (
          <p className="mt-2 rounded-xl border border-rojo bg-rojo/10 p-3 text-sm text-rojo-text">
            ⚠️ Este documento se arma con el chequeo cargado ({demo.alias || 'sin datos'}), que <strong>no coincide</strong> con {intended.alias}. Abrí el chequeo de esa persona antes de imprimir/firmar.
          </p>
        )}
      </div>

      {/* Documento */}
      <article className="rounded-2xl border border-line bg-surface p-6 print:rounded-none print:border-0 print:bg-white print:p-0">
        <header className="border-b-2 border-ink pb-2">
          <p className="text-xs text-muted">Programa de Salud Cerebral · San Juan · KaizenAI</p>
          <h1 className="font-serif text-2xl text-ink">Informe de salud cerebral</h1>
          <p className="text-sm text-ink">{PROPOSITO_LABEL[proposito].titulo}</p>
          <p className="mt-1 text-xs text-muted">Fecha: {fecha}</p>
        </header>

        <Seccion titulo="Datos de la persona">
          <p>
            <strong>{demo.alias || '—'}</strong>
            {demo.dni && ` · DNI ${demo.dni}`}
            {demo.edad != null && ` · ${demo.edad} años`}
            {demo.sexo && ` · ${demo.sexo}`}
            {demo.edu_anios != null && ` · ${demo.edu_anios} años de escolaridad`}
            {demo.depto && ` · ${demo.depto}`}
          </p>
        </Seccion>

        <Seccion titulo="Evaluación cognitiva">
          {cog.length ? (
            <ul className="list-disc pl-5">
              {cog.map((i) => (
                <li key={i.id}>
                  {i.name}: {i.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Sin datos cognitivos cargados.</p>
          )}
          <p className="mt-2">
            Estimación de riesgo cognitivo (Kaizen-MRCA): banda <strong>{s.mrcaBand}</strong> (ACE-III estimado ≈ {Math.round(s.mrcaAceEst)})
            {s.mrcaPreliminary && ' — preliminar'}.
          </p>
          {!objetivo && <p className="mt-1 text-xs text-muted">Datos cognitivos por autorreporte/informante; sin batería objetiva en este informe.</p>}
        </Seccion>

        <Seccion titulo="Impacto funcional (vida diaria)">
          {fun.length ? (
            <ul className="list-disc pl-5">
              {fun.map((i) => (
                <li key={i.id}>
                  {i.name}: {i.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Sin datos funcionales cargados.</p>
          )}
        </Seccion>

        {animo.length > 0 && (
          <Seccion titulo="Estado de ánimo">
            <ul className="list-disc pl-5">
              {animo.map((i) => (
                <li key={i.id}>
                  {i.name}: {i.text}
                </li>
              ))}
            </ul>
          </Seccion>
        )}

        <Seccion titulo="Factores de riesgo y salud física">
          <p>Riesgo modificable presente: ~{s.modifiableRiskPct}% · prioridad de seguimiento: {s.triageLevel}.</p>
          {s.meds.length > 0 && (
            <p className="mt-1">
              Medicación: {s.meds.join(', ')}.
              {s.medFlags.anyConcern && ' Atención a carga anticolinérgica / sedantes.'}
            </p>
          )}
          {redFlags.length > 0 && <p className="mt-1">Señales de alarma reportadas: {redFlags.length}.</p>}
        </Seccion>

        {otros.length > 0 && (
          <Seccion titulo="Otros (sueño, hábitos, fragilidad, nutrición)">
            <ul className="list-disc pl-5">
              {otros.map((i) => (
                <li key={i.id}>
                  {i.name}: {i.text}
                </li>
              ))}
            </ul>
          </Seccion>
        )}

        <Seccion titulo="Situación social y discapacidad">
          {s.equityFactors.length > 0 ? (
            <p>Factores de vulnerabilidad: {s.equityFactors.join(', ')}.</p>
          ) : (
            <p className="text-muted">Sin factores de vulnerabilidad destacados cargados.</p>
          )}
          {cud.persona && <p className="mt-1">Certificado de Discapacidad (CUD): {CUD_LABEL[cud.persona] ?? cud.persona}.</p>}
        </Seccion>

        {(estudios.neuro || estudios.imagen || LAB_DEF.some((l) => estudios[l.id])) && (
          <Seccion titulo="Estudios complementarios">
            {estudios.neuro && <p>Evaluación neuropsicológica: {NEURO_LABEL[estudios.neuro] ?? estudios.neuro}.</p>}
            {estudios.imagen && (
              <p className="mt-1">
                Neuroimagen: {IMAGEN_LABEL[estudios.imagen] ?? estudios.imagen}
                {estudios.imagen_hallazgo && (estudios.imagen === 'rmn' || estudios.imagen === 'tc') ? ` — ${HALLAZGO_LABEL[estudios.imagen_hallazgo] ?? estudios.imagen_hallazgo}` : ''}.
              </p>
            )}
            {LAB_DEF.some((l) => estudios[l.id]) && (
              <p className="mt-1">Laboratorio: {LAB_DEF.filter((l) => estudios[l.id]).map((l) => `${l.label} ${estudios[l.id]} ${l.unidad}`).join(' · ')}.</p>
            )}
          </Seccion>
        )}

        <Seccion titulo="Observaciones del profesional">
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Escriba aquí sus observaciones clínicas (se imprimen con el informe)…"
            className="min-h-[80px] w-full rounded-lg border border-line bg-bg p-2 text-sm text-ink print:border-0 print:bg-white"
          />
        </Seccion>

        <div className="mt-10 flex items-end justify-between gap-6 break-inside-avoid">
          <div className="flex-1 border-t border-ink pt-1 text-center text-xs text-muted">Firma del profesional</div>
          <div className="flex-1 border-t border-ink pt-1 text-center text-xs text-muted">Aclaración / Matrícula</div>
          <div className="h-20 w-32 rounded border border-dashed border-line text-center text-[10px] text-muted">Sello</div>
        </div>

        <footer className="mt-6 border-t border-line pt-2 text-[11px] text-muted">
          <p>{PROPOSITO_LABEL[proposito].pie}</p>
          <p className="mt-1">
            Este informe se genera a partir de datos del perfil de salud cerebral (estimación, no diagnóstico). La
            interpretación y validez clínica corresponden al profesional firmante.
          </p>
        </footer>
      </article>
    </div>
  )
}
