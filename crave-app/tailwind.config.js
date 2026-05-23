/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'c-bg':     '#1C0A00',
        'c-card':   '#2A1200',
        'c-deep':   '#140800',
        'c-hover':  '#351800',
        'c-orange': '#E8612C',
        'c-light':  '#F07840',
        'c-dark':   '#C4500A',
        'c-gold':   '#D4940A',
        'c-border': '#3D1E0A',
        'c-muted':  '#9B7B6B',
        'c-cream':  '#F5E6D3',
        'c-line':   '#5A2E12',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
