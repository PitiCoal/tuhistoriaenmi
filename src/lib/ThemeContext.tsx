'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type FontSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
type Theme = 'light' | 'dark'

const FONT_SIZES: Record<FontSize, string> = {
  sm: '14px',
  md: '16px',
  lg: '18px',
  xl: '20px',
  xxl: '24px',
}

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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [fontSize, setFontSizeState] = useState<FontSize>('md')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    const savedFont = localStorage.getItem('fontSize') as FontSize | null
    if (savedTheme) setTheme(savedTheme)
    if (savedFont) setFontSizeState(savedFont)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
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
