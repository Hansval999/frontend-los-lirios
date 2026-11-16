/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  theme: {
    extend: {
      // --------------------------------------------------------
      // Paleta de colores de Florería Los Lirios
      // --------------------------------------------------------
      colors: {
        primary: {
          DEFAULT: '#2d6a4f',
          50:  '#f0faf4',
          100: '#dcf3e6',
          200: '#bce7cf',
          300: '#8dd4af',
          400: '#57b989',
          500: '#2d6a4f',  // ← color principal
          600: '#276045',
          700: '#1f4e38',
          800: '#193f2d',
          900: '#143325',
        },
        secondary: {
          DEFAULT: '#95d5b2',
          50:  '#f4fbf7',
          100: '#e6f6ee',
          200: '#cceedd',
          300: '#95d5b2',  // ← color secundario
          400: '#6ec299',
          500: '#4aad80',
          600: '#389068',
          700: '#2d7454',
          800: '#265e44',
          900: '#1f4d38',
        },
        accent: {
          DEFAULT: '#e63946',
          50:  '#fff1f2',
          100: '#ffe0e2',
          200: '#ffc5c8',
          300: '#ff9da2',
          400: '#ff6570',
          500: '#e63946',  // ← acento (rojo rosa)
          600: '#d42030',
          700: '#b21828',
          800: '#941826',
          900: '#7c1a25',
        },
        // Colores neutrales de la marca
        brand: {
          bg:   '#f8f9fa',
          text: '#212529',
          muted:'#6c757d',
          border:'#dee2e6',
        },
      },

      // --------------------------------------------------------
      // Tipografía
      // --------------------------------------------------------
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },

      // --------------------------------------------------------
      // Espaciado y tamaños extra
      // --------------------------------------------------------
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // --------------------------------------------------------
      // Breakpoints adicionales
      // --------------------------------------------------------
      screens: {
        'xs': '480px',
      },

      // --------------------------------------------------------
      // Sombras personalizadas
      // --------------------------------------------------------
      boxShadow: {
        'card':  '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px rgba(45,106,79,0.15)',
        'modal': '0 20px 60px rgba(0,0,0,0.3)',
      },

      // --------------------------------------------------------
      // Animaciones personalizadas
      // --------------------------------------------------------
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        checkmark: {
          '0%':   { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in':        'fadeIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'checkmark':      'checkmark 0.6s ease-out forwards',
        'pulse-slow':     'pulse 2s ease-in-out infinite',
        'shimmer':        'shimmer 1.5s infinite linear',
      },

      // --------------------------------------------------------
      // Aspect ratios
      // --------------------------------------------------------
      aspectRatio: {
        'product': '4 / 3',
      },
    },
  },

  plugins: [],
}
