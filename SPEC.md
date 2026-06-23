# KaizenAI — Red centrada en la persona · SPEC (fuente de verdad)

**Director:** Dr. Fernando Márquez · Unidad de Memoria y Salud Cerebral, Hospital Rawson (San Juan)
**Decisiones cerradas:** 2026-06-23 · **v1:** demo en vivo congreso/WTD **2026-07-03**

---

## 1. Qué es (y qué NO es)

Una **PWA mobile-first, offline-first** que es la **puerta de entrada territorial**:
**captura, estratifica y acompaña** antes y después del diagnóstico, y le **entrega** a la
historia clínica oficial un resumen estructurado bajo consentimiento.

- **NO es un EHR.** La persona ya tiene HCE en salud pública → no duplicar.
- **Interopera vía FHIR** (`QuestionnaireResponse` / `RiskAssessment` / `Observation`).
  v1 standalone con **seam FHIR listo**; conecta en el piloto.
- **Encuadre de equidad (no negociable):** descarta de forma equitativa y deriva mejor
  donde no hay especialista. **No diagnostica · No reemplaza al profesional.** Normas
  locales ajustadas por educación (criterio Bruno), no cortes importados.

## 2. Decisiones cerradas

| Eje | Decisión |
|---|---|
| Producto | App modular = capa captura/triage/acompañamiento interoperable |
| Datos | **Sostenidos por la persona** (local-first + consentimiento + "mis datos") |
| HCE | Standalone v1 + **seam FHIR**; conectar en piloto |
| Descentralización | Las tres; **principal: gobernanza comunitaria** |
| Gobernanza MVP | Co-diseño in-app · consentimiento/soberanía · vista representante |
| Co-diseño | Híbrido (sprints presenciales + telemetría/feedback) |
| Idioma | ES primero (i18n desde día 1; EN fase 2) |
| Clinical-OS | Se **absorbe** como el rol Profesional/Unidad |
| WhatsApp | **Nivel 0** v1 (wa.me humano + QR/deep-link); bot = fase 2 |
| Branding | KaizenAI + "Red centrada en la persona"; identidad **Territorio cálido/humano** |
| Repo/stack | Repo nuevo · React+Vite+TS+Tailwind+Zustand+i18next+Dexie · export JSON/FHIR/PDF · Vitest |

## 3. Perfiles (6)

Paciente · Cuidador · Agente sanitario · Gestor · **Profesional/Unidad (absorbe Clinical-OS)** · **Representante comunitario**.

## 4. Módulos

- **PRE:** Prevención (14 factores Lancet → índice modificable PAF) · Polifarmacia
  (conteo, ACB, Beers/STOPP, BZD) + cribados reversibles/sensoriales/funcional/ánimo/banderas
  rojas · Biblioteca de escalas configurable (AD8, GPCOG, IQCODE, PHQ-4, GAD-2…) · **MRCA**
  (7 ítems) · **Triage** Verde/Amarillo/Rojo con racional · Recomendaciones personalizadas.
- **POST:** guía paciente · guía cuidador (DICE + Zarit-12, **embebe la guía existente**
  kaizenai-cuidadores) · seguimiento agente.
- **Transversal:** consentimiento + panel "mis datos" (ver/exportar/borrar) · bucle de
  co-diseño in-app (sugerir → priorizar → changelog) · export JSON/FHIR/PDF.

## 5. Scoring (rigor)

Pesos/umbrales en `src/scoring/` son **PLACEHOLDERS configurables a validar clínicamente**.
Toda salida muestra que es una **estimación** + interpretación en lenguaje claro + racional.
MRCA: 7 ítems autorreportados; valor = **descarte equitativo** (AUC ~0,80 desarrollo →
~0,63 validación), no superar edad+educación. Modelo congelado `kaizen-mrca` portado a TS.

## 6. Identidad visual — "Territorio cálido / humano" (tokens AA verificados)

```
bg #F7F3EC · surface #FFF · line #DED6C7 · ink #243133 · muted #51625F
primary #B5552E (texto #9A4524) · secondary #2E7D74 (texto #246B63) · accent #C98A2B (texto #8A5A14)
triage: verde #2E7D5B/#1F6A48 · amarillo #E8B54B/#8A5A14 · rojo #C0392B/#A52F23  (siempre color + texto + ícono)
```
Tipos: **Fraunces** (títulos, serif humanista) + **Atkinson Hyperlegible** (cuerpo, baja visión).
Logo: **persona-nodo**. Accesibilidad WCAG AA; control de tamaño de letra; lenguaje claro.

## 7. Roadmap por fases (cada una demostrable)

- **F0** ✅ scaffold + tokens + logo + selección de perfil + 6 dashboards shell.
- **F1** PRE Prevención (14 factores Lancet) + índice modificable (PAF).
- **F2** PRE Polifarmacia (ACB/Beers-STOPP/BZD) + cribados + banderas rojas.
- **F3** PRE Biblioteca de escalas configurable + MRCA.
- **F4** Scoring + Triage (Verde/Amarillo/Rojo) + cola de derivaciones + tests.
- **F5** Recomendaciones + resumen preconsulta + export JSON/FHIR/PDF.
- **F6** POST (guías; cuidador DICE+Zarit; embebe guía existente).
- **F7** Gobernanza (consentimiento, mis-datos, co-diseño in-app, vista comunidad).
- **F8** Seed demo (Verde/Amarillo/Rojo) + pulido + PWA/offline (fuentes self-host) + deploy.

> Para la demo del 03/07 se prioriza el recorrido end-to-end pulido, con seed data y offline.
> Lo content-heavy (biblioteca completa de escalas, profundidad de los 6 perfiles) se entrega
> "demostrable"; lo crítico (PRE→triage→recomendación, POST cuidador, soberanía, export) va funcional.

## 8. Guardrails

No diagnóstico/dispositivo médico · sin PII real (alias/iniciales) · sin backend con datos
sensibles en v1 · nada de strings hardcodeados (todo i18n) · colores solo de la paleta ·
umbrales = placeholders a validar · sin sobre-ingeniería.
