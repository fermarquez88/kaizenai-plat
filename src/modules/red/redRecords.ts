// Adaptador de la RED REAL: une las preconsultas guardadas (datos reales que el
// agente/persona capturó y/o importó) con las personas de ejemplo (seed, demo).
// Así la bandeja/cola/tablero/seguimiento dejan de ser pura maqueta: en cuanto se
// captura algo real, aparece arriba; el seed queda como ejemplo etiquetado.
import { useCallback, useEffect, useState } from 'react'
import { dexieRepo } from '../../data/dexieRepo'
import { SEED_PERSONAS, type SeedPersona } from '../../seed/personas'
import { estadoSeguimiento, type SeguimientoEstado } from '../../scoring/retention'
import type { DerivationStatus, MrcaBand, PreAssessmentSummary, TriageLevel } from '../../data/types'

const DAY = 86_400_000

export interface RedRecord {
  id: string
  alias: string
  ageYears?: number
  educationYears?: number
  level: TriageLevel
  riskPct: number
  mrcaBand: MrcaBand
  meds: number
  redFlags: number
  note: string
  daysSinceContact: number
  estado: SeguimientoEstado
  phone?: string
  cuidadorAlias?: string
  discrepancia?: boolean
  derivationStatus?: DerivationStatus
  createdAt: number
  demo: boolean
}

export function fromSeed(p: SeedPersona): RedRecord {
  return {
    id: `seed-${p.id}`,
    alias: p.alias,
    ageYears: p.age,
    educationYears: p.edu,
    level: p.level,
    riskPct: p.riskPct,
    mrcaBand: p.mrcaBand,
    meds: p.meds,
    redFlags: p.redFlags,
    note: p.note,
    daysSinceContact: p.lastSeenDays,
    estado: estadoSeguimiento(p.lastSeenDays),
    phone: p.phone,
    cuidadorAlias: p.cuidador,
    discrepancia: p.discrepancia,
    derivationStatus: undefined,
    createdAt: 0,
    demo: true,
  }
}

export function fromAssessment(a: PreAssessmentSummary, now: number): RedRecord {
  const base = a.lastContactAt ?? a.createdAt
  const days = Math.max(0, Math.floor((now - base) / DAY))
  return {
    id: a.id,
    alias: a.alias || '—',
    ageYears: a.ageYears,
    educationYears: a.educationYears,
    level: a.triage ?? 'verde',
    riskPct: a.riskPct ?? Math.round((a.modifiableRiskIndex ?? 0) * 100),
    mrcaBand: a.mrcaBand ?? 'bajo',
    meds: a.medsCount ?? 0,
    redFlags: a.redFlagsCount ?? 0,
    note: a.note ?? '',
    daysSinceContact: days,
    estado: estadoSeguimiento(days),
    phone: a.phone,
    cuidadorAlias: a.cuidadorAlias,
    discrepancia: a.discrepancia,
    derivationStatus: a.derivationStatus,
    createdAt: a.createdAt,
    demo: false,
  }
}

export function useRedRecords() {
  const [records, setRecords] = useState<RedRecord[]>([])
  const [realCount, setRealCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(() => {
    setLoading(true)
    dexieRepo
      .listPreAssessments()
      .then((list) => {
        const now = Date.now()
        const real = list.filter((a) => a.triage).map((a) => fromAssessment(a, now))
        real.sort((x, y) => y.createdAt - x.createdAt)
        setRealCount(real.length)
        setRecords([...real, ...SEED_PERSONAS.map(fromSeed)])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { records, realCount, loading, reload }
}
