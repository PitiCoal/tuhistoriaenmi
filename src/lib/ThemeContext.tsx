'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type FontSize = 'sm' | 'md' | 'lg' | 'xl'
type Theme = 'light' | 'dark'

const FONT_SIZES: Record<FontSize, string> = {
  sm: '14px',
  md: '16px',
  lg: '18px',
  xl: '20px',
}

const THEME_STYLES_ID = 'thm-theme-vars'

const lightCSS = `
:root {
  --color-primary: #0085C2;
  --color-primary-dark: #1A3A5C;
  --color-secondary: #5BA3A8;
  --color-bg: rgba(245, 240, 235, 0.92);
  --color-card: #FFFFFF;
  --color-text: #1A1A1A;
  --color-text-light: #6B6358;
  --color-accent: #D4A843;
  --color-gold: #C4974A;
  --color-yt: #FF0000;
  --color-spotify: #1DB954;
  --color-apple: #6C3FE7;
  --color-amazon: #FF9900;
  --color-whatsapp: #25D366;
  --color-instagram: #E4405F;
  --font-heading: Georgia, serif;
  --font-body: Inter, system-ui, sans-serif;
}
body {
  background-image: url('/images/fondo-podcast.jpg') !important;
  background-size: cover !important;
  background-attachment: fixed !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}
@media (max-width: 767px) { body { background-attachment: scroll !important; } }
`

const darkCSS = `
[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-card: #1e293b;
  --color-text: #e2e8f0;
  --color-text-light: #94a3b8;
  --color-primary: #38bdf8;
  --color-primary-dark: #7dd3fc;
  --color-accent: #fbbf24;
  --color-gold: #f59e0b;
  --color-secondary: #6ee7b7;
}
[data-theme="dark"] body {
  background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url('/images/fondo-podcast.jpg') !important;
}
[data-theme="dark"] .bg-white,
[data-theme="dark"] .bg-card {
  background-color: var(--color-card) !important;
}
[data-theme="dark"] .bg-gray-50 { background-color: #1e293b !important; }
[data-theme="dark"] .bg-gray-100 { background-color: #334155 !important; }
[data-theme="dark"] .border-gray-200\/70,
[data-theme="dark"] .border-gray-200,
[data-theme="dark"] .border-gray-100 { border-color: rgba(51, 65, 85, 0.7) !important; }
[data-theme="dark"] .shadow-sm,
[data-theme="dark"] .shadow-md,
[data-theme="dark"] .shadow-lg,
[data-theme="dark"] .shadow-xl { box-shadow: 0 1px 3px rgba(0,0,0,0.4) !important; }
[data-theme="dark"] .text-white\/80,
[data-theme="dark"] .text-white\/60 { color: rgba(226, 232, 240, 0.8) !important; }
[data-theme="dark"] input,
[data-theme="dark"] textarea,
[data-theme="dark"] select {
  background-color: #1e293b !important;
  border-color: #475569 !important;
  color: #e2e8f0 !important;
}
`

interface ThemeContextValue {
  theme: Theme
  fontSize: FontSize
  toggleTheme: () => void
  setFontSize: (size: FontSize) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  fontSize: 'md',
  toggleTheme: () => {},
  setFontSize: () => {},
})

function injectStyles(id: string, css: string) {
  let el = document.getElementById(id)
  if (!el) {
    el = document.createElement('style')
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = css
}

function removeStyles(id: string) {
  document.getElementById(id)?.remove()
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [fontSize, setFontSizeState] = useState<FontSize>('md')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    const savedFont = localStorage.getItem('fontSize') as FontSize | null
    const t = savedTheme || 'light'
    const f = savedFont || 'md'
    setTheme(t)
    setFontSizeState(f)
    document.documentElement.setAttribute('data-theme', t)
    document.documentElement.style.fontSize = FONT_SIZES[f]
    injectStyles(THEME_STYLES_ID, t === 'dark' ? lightCSS + darkCSS : lightCSS)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
    injectStyles(THEME_STYLES_ID, theme === 'dark' ? lightCSS + darkCSS : lightCSS)
  }, [theme])

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZES[fontSize]
    localStorage.setItem('fontSize', fontSize)
  }, [fontSize])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, fontSize, toggleTheme, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
