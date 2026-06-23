# CLAUDE.md — KaizenAI / Red centrada en la persona

Constitución corta para sesiones de Claude Code en este repo. **La fuente de verdad de
las decisiones de diseño es [`SPEC.md`](./SPEC.md)** — leerlo antes de cambios grandes.

## Qué es

PWA (React+Vite+TS+Tailwind) **local-first**, capa de **captura/triage/acompañamiento** en
demencia, antes y después del diagnóstico. **No es un EHR** (interopera con la HCE vía FHIR).
**No diagnostica · No reemplaza al profesional.** v1 = demo congreso/WTD **2026-07-03**.

## Reglas de oro

1. **Nada de PII real** en el MVP: alias/iniciales. Datos **sostenidos por la persona**.
2. **Todo string visible va por i18n** (`src/i18n/es.json`). Nada hardcodeado. EN = fase 2.
3. **Solo la paleta** de tokens (Tailwind `theme.colors`). Estados de triage = color **+ texto + ícono**.
4. **Accesibilidad WCAG AA**: contraste verificado, foco visible, control de tamaño de letra, lenguaje claro.
5. La UI habla **solo con `DataRepository`** (nunca Dexie directo) → migrable a backend/FHIR sin refactor.
6. **Scoring = placeholders configurables** (`src/scoring/`), a validar clínicamente; toda salida es una **estimación** con racional.
7. Sin sobre-ingeniería. Cada fase debe quedar **demostrable**.

## Comandos

`npm run dev` · `npm run build` · `npm test` · `npm run typecheck`
(Node 22 local en `~/.local/node`; ver `.nvmrc`.)

## Convenciones

- Comentarios y nombres de variables nuevas en **inglés**; UI en **español**.
- Componentes en `src/components`, vistas por perfil en `src/profiles`, lógica en `src/scoring` y `src/data`.
- Seams: `data/DataRepository.ts` (persistencia), `data/fhirExport.ts` (FHIR), `channel/ChannelAdapter.ts` (canales/WhatsApp).
