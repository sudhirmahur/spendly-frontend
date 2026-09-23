export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'slide-up'  : 'slideUp 0.3s ease forwards',
        'scale-in'  : 'scaleIn 0.2s ease forwards',
        'fade-in'   : 'fadeIn 0.25s ease forwards',
        'shimmer'   : 'shimmer 1.5s infinite',
      },
      keyframes: {
        slideUp  : { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scaleIn  : { from: { opacity: 0, transform: 'scale(0.97)' },      to: { opacity: 1, transform: 'scale(1)' } },
        fadeIn   : { from: { opacity: 0 },                                  to: { opacity: 1 } },
        shimmer  : { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'card'  : '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
        'modal' : '0 20px 60px rgba(0,0,0,0.25)',
        'glow'  : '0 0 24px rgba(59,130,246,0.25)',
      },
    },
  },
  plugins: [],
}
