// Seam de canal: cómo ENTRA una persona a la plataforma desde cualquier canal.
// v1 (Nivel 0): enlace + QR + WhatsApp como canal HUMANO (wa.me, sin bot, sin Meta API).
// Fase 2: bot de WhatsApp (Cloud API) implementará esta misma interfaz.

export type ChannelKind = 'link' | 'qr' | 'whatsapp' | 'in-person'

export interface InboundContext {
  channel: ChannelKind
  /** referencia opcional: id de agente, campaña, etc. */
  ref?: string
}

export interface ChannelAdapter {
  kind: ChannelKind
  /** Construye un deep-link de onboarding hacia la app. */
  buildEntryLink(base: string, ctx?: Partial<InboundContext>): string
}

/** Canal humano WhatsApp — Nivel 0: abre un chat con un número, sin bot. */
export function waMeLink(phoneE164: string, text: string): string {
  const digits = phoneE164.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}

export const linkAdapter: ChannelAdapter = {
  kind: 'link',
  buildEntryLink: (base, ctx) => {
    const u = new URL(base)
    u.searchParams.set('ch', ctx?.channel ?? 'link')
    if (ctx?.ref) u.searchParams.set('ref', ctx.ref)
    return u.toString()
  },
}
