import { createTheme } from '@mui/material/styles';

// Color palette based on the original theme
const colors = {
  background: {
    default: '#f0f2f5',
  },
  text: {
    main: '#7b809a',
    focus: '#7b809a',
  },
  transparent: {
    main: 'transparent',
  },
  white: {
    main: '#ffffff',
    focus: '#ffffff',
  },
  black: {
    light: '#000000',
    main: '#000000',
    focus: '#000000',
  },
  primary: {
    main: '#e91e63',
    focus: '#e91e63',
  },
  secondary: {
    main: '#7b809a',
    focus: '#8f93a9',
  },
  info: {
    main: '#1A73E8',
    focus: '#1662C4',
  },
  success: {
    main: '#4CAF50',
    focus: '#67bb6a',
  },
  warning: {
    main: '#fb8c00',
    focus: '#fc9d26',
  },
  error: {
    main: '#F44335',
    focus: '#f65f53',
  },
  light: {
    main: '#f0f2f5',
    focus: '#f0f2f5',
  },
  dark: {
    main: '#344767',
    focus: '#2c3c58',
  },
  grey: {
    100: '#f8f9fa',
    200: '#f0f2f5',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#adb5bd',
    600: '#6c757d',
    700: '#495057',
    800: '#343a40',
    900: '#212529',
  },
};

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: colors.background.default,
      paper: colors.white.main,
    },
    primary: {
      main: colors.primary.main,
      light: colors.primary.focus,
      dark: colors.primary.main,
      contrastText: colors.white.main,
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.focus,
      dark: colors.secondary.main,
      contrastText: colors.white.main,
    },
    info: {
      main: colors.info.main,
      light: colors.info.focus,
      dark: colors.info.main,
      contrastText: colors.white.main,
    },
    success: {
      main: colors.success.main,
      light: colors.success.focus,
      dark: colors.success.main,
      contrastText: colors.white.main,
    },
    warning: {
      main: colors.warning.main,
      light: colors.warning.focus,
      dark: colors.warning.main,
      contrastText: colors.white.main,
    },
    error: {
      main: colors.error.main,
      light: colors.error.focus,
      dark: colors.error.main,
      contrastText: colors.white.main,
    },
    text: {
      primary: colors.dark.main,
      secondary: colors.text.main,
    },
    grey: colors.grey,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme; 