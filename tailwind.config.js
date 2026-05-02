/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Material 3 inspired palette — navy primary with warm gold accents
        primary: {
          DEFAULT: '#000000',
          on: '#ffffff',
          container: '#131b2e',
          'on-container': '#7c839b',
          fixed: '#dae2fd',
          'fixed-dim': '#bec6e0',
        },
        secondary: {
          DEFAULT: '#515f74',
          on: '#ffffff',
          container: '#d5e3fd',
          'on-container': '#57657b',
          fixed: '#d5e3fd',
          'fixed-dim': '#b9c7e0',
        },
        tertiary: {
          DEFAULT: '#735c00',
          on: '#ffffff',
          container: '#cba72f',
          'on-container': '#4e3d00',
          fixed: '#ffe088',
          'fixed-dim': '#e9c349',
        },
        error: {
          DEFAULT: '#ba1a1a',
          on: '#ffffff',
          container: '#ffdad6',
          'on-container': '#93000a',
        },
        surface: {
          DEFAULT: '#fcf8fa',
          on: '#1b1b1d',
          'on-variant': '#45464d',
          variant: '#e4e2e4',
          container: '#f0edef',
          'container-low': '#f6f3f5',
          'container-lowest': '#ffffff',
          'container-high': '#eae7e9',
          'container-highest': '#e4e2e4',
        },
        outline: {
          DEFAULT: '#76777d',
          variant: '#c6c6cd',
        },
        bg: '#fcf8fa',
        'on-bg': '#1b1b1d',
      },
      fontFamily: {
        serif: ['NotoSerif_600SemiBold'],
        'serif-bold': ['NotoSerif_700Bold'],
        sans: ['Inter_400Regular'],
        'sans-md': ['Inter_500Medium'],
        'sans-sb': ['Inter_600SemiBold'],
        'sans-bold': ['Inter_700Bold'],
      },
      fontSize: {
        display: ['48px', { lineHeight: '52px', letterSpacing: '-0.96px' }],
        h1: ['36px', { lineHeight: '44px' }],
        h2: ['30px', { lineHeight: '38px' }],
        h3: ['24px', { lineHeight: '32px' }],
        'body-lg': ['18px', { lineHeight: '28px' }],
        'body-md': ['16px', { lineHeight: '24px' }],
        'body-sm': ['14px', { lineHeight: '20px' }],
        button: ['14px', { lineHeight: '14px', letterSpacing: '0.28px' }],
        'label-lg': ['14px', { lineHeight: '14px', letterSpacing: '0.7px' }],
        'label-md': ['12px', { lineHeight: '14px' }],
      },
      borderRadius: {
        DEFAULT: '4px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
};
