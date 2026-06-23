import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './es.json'

// ES first (decisión 2026-06-23). EN se agrega en fase 2 cargando en.json aquí.
void i18n.use(initReactI18next).init({
  resources: { es: { translation: es } },
  lng: 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
})

export default i18n
