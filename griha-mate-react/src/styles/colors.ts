// Sapphire Veil Color Palette
// Inspired by elegant blue gradients

export const colors = {
  // Main Palette
  primary: {
    lightest: '#E7F0FA', // Very light blue - backgrounds, hover states
    light: '#7BA4D0',    // Medium blue - secondary buttons, accents
    DEFAULT: '#2E5E99',  // Main blue - primary buttons, links
    dark: '#0D2440',     // Deep navy - headers, text, footer
  },
  
  // Semantic Colors (derived from palette)
  background: {
    main: '#E7F0FA',     // Page backgrounds
    card: '#FFFFFF',     // Card backgrounds
    hover: '#7BA4D0',    // Hover states
    overlay: 'rgba(14, 36, 64, 0.9)', // Modal overlays
  },
  
  text: {
    primary: '#0D2440',   // Main text
    secondary: '#2E5E99', // Secondary text
    light: '#7BA4D0',     // Muted text
    white: '#FFFFFF',     // Text on dark backgrounds
  },
  
  button: {
    primary: '#2E5E99',      // Primary buttons
    primaryHover: '#0D2440', // Primary hover
    secondary: '#7BA4D0',    // Secondary buttons
    secondaryHover: '#2E5E99', // Secondary hover
  },
  
  border: {
    light: '#E7F0FA',
    medium: '#7BA4D0',
    dark: '#2E5E99',
  },
  
  badge: {
    success: '#10b981',  // Keep green for verified
    warning: '#f59e0b',  // Keep amber for warnings
    info: '#7BA4D0',     // Use palette blue
    error: '#ef4444',    // Keep red for errors
  },
  
  gradient: {
    primary: 'linear-gradient(135deg, #2E5E99 0%, #0D2440 100%)',
    light: 'linear-gradient(135deg, #E7F0FA 0%, #7BA4D0 100%)',
    overlay: 'linear-gradient(180deg, rgba(14, 36, 64, 0.8) 0%, rgba(46, 94, 153, 0.9) 100%)',
  }
}

// Tailwind CSS class mappings
export const tailwindColors = {
  'primary-lightest': '#E7F0FA',
  'primary-light': '#7BA4D0',
  'primary': '#2E5E99',
  'primary-dark': '#0D2440',
}

export default colors


