import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './es.json'
import en from './en.json'

// ES es el idioma base; EN se traduce desde es.json (fallback a ES para claves faltantes).
void i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en } },
  lng: 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
  // Red de seguridad: si una clave falta en TODOS los idiomas, mostrar el último segmento
  // legible en vez de la clave cruda ('nav.crumb.vitales' → 'vitales').
  parseMissingKeyHandler: (key) => key.split('.').pop() ?? key,
})

export default i18n
