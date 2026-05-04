# Theme System Documentation

## Overview
The application now has a complete theme system with 5 pre-built themes:
- **Dark** - Dark blue theme (default)
- **Light** - Light gray theme
- **Blue** - Blue accent theme
- **Purple** - Purple accent theme
- **Green** - Green accent theme

## Using Themes

### Switch Themes
Click the theme button in the top-right of the header (shows current theme name). Click again to cycle through all available themes.

### Theme Persistence
Your selected theme is automatically saved to localStorage and will be restored when you return.

## For Developers

### Adding a New Theme
Edit `src/context/ThemeContext.jsx` and add to the `themes` object:

```javascript
myTheme: {
  name: 'My Theme',
  colors: {
    bg: '#your-bg-color',
    bgSecondary: '#your-secondary-bg',
    bgTertiary: '#your-tertiary-bg',
    text: '#your-text-color',
    textSecondary: '#your-secondary-text',
    textMuted: '#your-muted-text',
    border: 'rgba(...)',
    primary: '#your-primary-color',
    primaryLight: '#your-light-primary',
    secondary: '#your-secondary-color',
    success: '#your-success-color',
    danger: '#your-danger-color',
    warning: '#your-warning-color'
  }
}
```

### Using Theme Colors in CSS
All theme colors are available as CSS variables:

```css
.my-element {
  background-color: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
```

### Using Theme in React Components
```javascript
import { useTheme } from '@/context/ThemeContext'

function MyComponent() {
  const { currentTheme, setCurrentTheme, themes } = useTheme()
  
  return (
    <div style={{
      backgroundColor: themes[currentTheme].colors.bg,
      color: themes[currentTheme].colors.text
    }}>
      Current theme: {themes[currentTheme].name}
    </div>
  )
}
```

## Available CSS Variables
- `--color-bg` - Main background
- `--color-bgSecondary` - Secondary background
- `--color-bgTertiary` - Tertiary background
- `--color-text` - Main text color
- `--color-textSecondary` - Secondary text
- `--color-textMuted` - Muted text
- `--color-border` - Border color
- `--color-primary` - Primary accent
- `--color-primaryLight` - Light primary
- `--color-secondary` - Secondary accent
- `--color-success` - Success color
- `--color-danger` - Danger/error color
- `--color-warning` - Warning color
