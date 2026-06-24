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

export interface SettingsState {
  lang: 'es' | 'en'
  fontScale: number
  consentAccepted: boolean
  consentAt?: number
  simpleMode: boolean
  selfPersonId?: string
  setLang: (l: 'es' | 'en') => void
  incFont: () => void
  decFont: () => void
  setConsent: (v: boolean) => void
  setSimpleMode: (v: boolean) => void
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
      setLang: (lang) => set({ lang }),
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
