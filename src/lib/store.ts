import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const FONT_MIN = 0.9
const FONT_MAX = 1.4
const FONT_STEP = 0.1
const SIMPLE_FONT = 1.3

export const CONSENT_VERSION = '1.0'

function uid() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
}

export type UsuarioRol = 'persona' | 'cuidador' | 'promotor'
export interface Persona {
  id: string
  alias: string
  relacion?: string // 'yo' | 'familiar' | 'vecino' | 'otro'
  creadaAt: number
}

export interface SettingsState {
  lang: 'es' | 'en'
  fontScale: number
  consentAccepted: boolean
  consentAt?: number
  simpleMode: boolean
  selfPersonId?: string
  /** voz (lectura en pantalla) encendida por defecto en la puerta de la persona. */
  voiceOn: boolean
  /** se mostró ya la señal animada de "cómo apagar la voz". */
  voiceHintDismissed: boolean
  // ── IDENTIDAD/CONTEXTO (entrada): una persona, una ficha, muchas lentes ──────────────
  /** fichas-persona conocidas en este dispositivo (sin PII: alias/iniciales). */
  personas: Record<string, Persona>
  /** rol de uso del dispositivo (lo elegido en la entrada). */
  usuarioRol?: UsuarioRol
  /** persona activa: de quién es la ficha que se está viendo/completando. */
  activePersonId?: string
  /** personas que acompaña un cuidador/promotor (orden = recencia). */
  cuidados: string[]
  setUsuarioRol: (r: UsuarioRol) => void
  setActivePerson: (id: string) => void
  /** crea una persona acompañada (cuidador/promotor) y la activa; devuelve su id. */
  addPersona: (alias: string, relacion?: string) => string
  /** define el alias de "yo" (persona), crea/activa su ficha. */
  setSelfAlias: (alias: string) => void
  setLang: (l: 'es' | 'en') => void
  incFont: () => void
  decFont: () => void
  setConsent: (v: boolean) => void
  setSimpleMode: (v: boolean) => void
  setVoiceOn: (v: boolean) => void
  dismissVoiceHint: () => void
  /** Devuelve (creando si hace falta) el id estable de la persona, para enlazar
   *  sus re-evaluaciones en el tiempo (vista longitudinal). */
  ensureSelfPersonId: () => string
}

const round1 = (n: number) => Math.round(n * 10) / 10

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      lang: 'es',
      fontScale: 1,
      consentAccepted: false,
      simpleMode: false,
      voiceOn: true,
      voiceHintDismissed: false,
      personas: {},
      cuidados: [],
      setLang: (lang) => set({ lang }),
      setVoiceOn: (voiceOn) => set({ voiceOn }),
      dismissVoiceHint: () => set({ voiceHintDismissed: true }),
      setUsuarioRol: (usuarioRol) => set({ usuarioRol }),
      setActivePerson: (activePersonId) => set({ activePersonId }),
      addPersona: (alias, relacion) => {
        const id = uid()
        set((s) => ({
          personas: { ...s.personas, [id]: { id, alias, relacion, creadaAt: Date.now() } },
          cuidados: [id, ...s.cuidados.filter((x) => x !== id)],
          activePersonId: id,
        }))
        return id
      },
      setSelfAlias: (alias) =>
        set((s) => {
          const id = s.selfPersonId ?? uid()
          return {
            selfPersonId: id,
            usuarioRol: 'persona',
            activePersonId: id,
            personas: { ...s.personas, [id]: { id, alias, relacion: 'yo', creadaAt: s.personas[id]?.creadaAt ?? Date.now() } },
          }
        }),
      incFont: () => set((s) => ({ fontScale: round1(Math.min(FONT_MAX, s.fontScale + FONT_STEP)) })),
      decFont: () => set((s) => ({ fontScale: round1(Math.max(FONT_MIN, s.fontScale - FONT_STEP)) })),
      setConsent: (consentAccepted) =>
        set({ consentAccepted, consentAt: consentAccepted ? Date.now() : undefined }),
      setSimpleMode: (simpleMode) =>
        set((s) => ({ simpleMode, fontScale: simpleMode ? SIMPLE_FONT : s.fontScale })),
      ensureSelfPersonId: () => {
        let id = get().selfPersonId
        if (!id) {
          id = uid()
          set({ selfPersonId: id })
        }
        return id
      },
    }),
    { name: 'kaizenai-settings' },
  ),
)
