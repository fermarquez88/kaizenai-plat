# KaizenAI — Red centrada en la persona

PWA de **salud cerebral comunitaria**: capa de **captura / triage / acompañamiento**
en el territorio, **antes y después** del diagnóstico de demencia. No es una historia
clínica: interopera con la HCE oficial (seam FHIR). Datos **sostenidos por la persona**
(local-first). **No diagnostica · No reemplaza al profesional.**

> Fuente de verdad del proyecto: [`SPEC.md`](./SPEC.md) · convenciones para agentes: [`CLAUDE.md`](./CLAUDE.md)

## Requisitos

- Node.js ≥ 20 (este repo usa 22 — ver `.nvmrc`).

## Comandos

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # build estático -> dist/
npm run preview  # previsualizar el build
npm test         # tests (Vitest) — lógica de scoring
npm run typecheck
```

## Deploy

El build es **estático** (`dist/`), publicable en Vercel/Netlify o GitHub Pages.

- **Vercel / Netlify / raíz:** sin configuración extra (`base = "/"`).
- **GitHub Pages (project site):** build con `DEPLOY_BASE=/kaizenai-plat/ npm run build`.
  El routing usa hash (`#/`), así que los refrescos funcionan sin reescrituras de servidor.

## Estructura

```
src/
  app/         router (hash) por perfil + módulo
  profiles/    selección de perfil + dashboards (6 perfiles)
  components/  AppShell, Logo (persona-nodo), ProfileCard
  data/        DataRepository (interfaz) · dexieRepo · db (Dexie) · fhirExport (seam)
  channel/     ChannelAdapter (enlace/QR/WhatsApp Nivel 0)
  scoring/     scoring.config (PLACEHOLDERS) + tests
  i18n/        es.json (EN en fase 2)
  lib/         store (zustand: idioma, tamaño de letra, consentimiento)
public/icon.svg
```

## Estado

**F0** (scaffold + identidad + selección de perfil + 6 dashboards shell). Roadmap completo en `SPEC.md`.
