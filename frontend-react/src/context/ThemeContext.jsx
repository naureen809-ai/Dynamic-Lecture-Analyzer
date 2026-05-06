import React, { createContext, useState, useContext, useEffect } from 'react'

const ThemeContext = createContext()

const themes = {
  dark: {
    name: 'Dark',
    colors: {
      bg: '#0f172a',
      bgSecondary: '#1e293b',
      bgTertiary: '#334155',
      text: '#ffffff',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      border: 'rgba(255, 255, 255, 0.08)',
      primary: '#06b6d4',
      primaryLight: '#0ea5e9',
      secondary: '#ec4899',
      success: '#10b981',
      danger: '#ef4444',
      warning: '#f59e0b'
    }
  },
  light: {
    name: 'Light',
    colors: {
      bg: '#ffffff',
      bgSecondary: '#e3f2fd',
      bgTertiary: '#f5f7fa',
      text: '#1e293b',
      textSecondary: '#475569',
      textMuted: '#64748b',
      border: 'rgba(0, 0, 0, 0.12)',
      primary: '#0891b2',
      primaryLight: '#0284c7',
      secondary: '#be185d',
      success: '#059669',
      danger: '#dc2626',
      warning: '#d97706'
    }
  }
}

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('app-theme')
    const theme = (saved && themes[saved]) ? saved : 'dark'
    
    // Apply theme immediately on initialization
    const themeObj = themes[theme]
    if (themeObj) {
      const root = document.documentElement
      Object.entries(themeObj.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value)
      })
      document.documentElement.classList.remove('dark', 'light')
      document.documentElement.classList.add(theme === 'dark' ? 'dark' : 'light')
      document.body.style.backgroundColor = themeObj.colors.bg
      document.body.style.color = themeObj.colors.text
    }
    
    return theme
  })

  // Apply theme on component mount and when it changes
  useEffect(() => {
    const theme = themes[currentTheme]
    if (!theme) {
      console.error('Theme not found:', currentTheme)
      return
    }

    // Apply CSS variables
    const root = document.documentElement
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
    
    // Apply Tailwind dark/light class
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(currentTheme === 'dark' ? 'dark' : 'light')
    
    // Apply body background and text colors
    document.body.style.backgroundColor = theme.colors.bg
    document.body.style.color = theme.colors.text
    
    console.log(`✓ Theme applied: ${currentTheme}`)
  }, [currentTheme])

  const toggleTheme = () => {
    const themeNames = Object.keys(themes)
    const currentIndex = themeNames.indexOf(currentTheme)
    const nextIndex = (currentIndex + 1) % themeNames.length
    const nextTheme = themeNames[nextIndex]
    
    console.log(`🎨 Switching theme: ${currentTheme} → ${nextTheme}`)
    localStorage.setItem('app-theme', nextTheme)
    setCurrentTheme(nextTheme)
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme, toggleTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
