import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const FONT_MIN = 0.9
const FONT_MAX = 1.4
const FONT_STEP = 0.1

export interface SettingsState {
  lang: 'es' | 'en'
  fontScale: number
  consentAccepted: boolean
  setLang: (l: 'es' | 'en') => void
  incFont: () => void
  decFont: () => void
  setConsent: (v: boolean) => void
}

const round1 = (n: number) => Math.round(n * 10) / 10

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      lang: 'es',
      fontScale: 1,
      consentAccepted: false,
      setLang: (lang) => set({ lang }),
      incFont: () => set((s) => ({ fontScale: round1(Math.min(FONT_MAX, s.fontScale + FONT_STEP)) })),
      decFont: () => set((s) => ({ fontScale: round1(Math.max(FONT_MIN, s.fontScale - FONT_STEP)) })),
      setConsent: (consentAccepted) => set({ consentAccepted }),
    }),
    { name: 'kaizenai-settings' },
  ),
)
