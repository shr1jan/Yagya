// src/constants/theme.js
export const COLORS = {
    // Core colors
    background: '#EDE9F6',
    primary: '#9A66FF',
    secondary: '#6C4BEB',
    text: '#000000',
    placeholder: '#999999',
    white: '#FFFFFF',
    black: '#000000',
    border: '#CCCCCC',
    
    // Status colors
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FFC107',
    info: '#2196F3',
  };
  
  export const SIZES = {
    // Global measurements
    padding: 16,
    margin: 8,
    radius: 8,
    icon: 24,
    
    // Text sizes
    h1: 24,
    h2: 20,
    h3: 18,
    body: 14,
    caption: 12,
  };
  
  export const FONTS = {
    // Font families
    regular: 'PlusJakartaSans-Medium',
    bold: 'PlusJakartaSans-Bold',
    italic: 'PlusJakartaSans-MediumItalic',
  };
  
  export const STYLES = {
    // Common style presets
    shadow: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    container: {
      flex: 1,
      backgroundColor: '#EDE9F6',
      paddingHorizontal: SIZES.padding,
    },
  };
  
  // Default export for easy importing
  export default {
    COLORS,
    SIZES,
    FONTS,
    STYLES,
  };