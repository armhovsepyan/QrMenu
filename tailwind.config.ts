import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        lp: {
          bg:       '#0a0c10',
          surface:  '#111318',
          surface2: '#161920',
          border:   '#1f2435',
          accent:   '#4f8ef7',
          accent2:  '#8b5cf6',
          accent3:  '#06d6a0',
          text:     '#e2e8f0',
          muted:    '#6b7a99',
          tagbg:    '#161b2e',
          tagborder:'#252d46',
        },
      },
      lineClamp: {
        2: '2',
        3: '3',
      },
    },
  },
  plugins: [],
}
export default config
