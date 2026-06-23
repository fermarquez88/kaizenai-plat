/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F7F3EC',
        surface: '#FFFFFF',
        line: '#DED6C7',
        ink: '#243133',
        muted: '#51625F',
        primary: { DEFAULT: '#B5552E', text: '#9A4524' },
        secondary: { DEFAULT: '#2E7D74', text: '#246B63' },
        accent: { DEFAULT: '#C98A2B', text: '#8A5A14' },
        verde: { DEFAULT: '#2E7D5B', text: '#1F6A48' },
        amarillo: { DEFAULT: '#E8B54B', text: '#8A5A14' },
        rojo: { DEFAULT: '#C0392B', text: '#A52F23' },
      },
      fontFamily: {
        serif: ['Fraunces', 'Palatino', 'Georgia', 'serif'],
        sans: ['"Atkinson Hyperlegible"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl: '0.9rem', '2xl': '1.25rem' },
      boxShadow: {
        card: '0 1px 2px rgba(36,49,52,.04), 0 8px 24px rgba(36,49,52,.06)',
      },
    },
  },
  plugins: [],
}
