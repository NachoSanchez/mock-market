'use client';
import { createTheme, alpha } from '@mui/material/styles';

const TOMATO_MAIN  = '#ff6347'; // tomato
const TOMATO_LIGHT = '#ff8a72';
const TOMATO_DARK  = '#c94a32';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: TOMATO_MAIN,
      light: TOMATO_LIGHT,
      dark: TOMATO_DARK,
      contrastText: '#ffffff',
    },
    // secondary: { main: '#2f6df6' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        outlinedPrimary: {
          borderColor: alpha(TOMATO_MAIN, 0.5),
          '&:hover': { borderColor: TOMATO_MAIN, backgroundColor: alpha(TOMATO_MAIN, 0.06) },
        },
        root: {
          textTransform: 'none'
        }
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: alpha(TOMATO_MAIN, 0.12),
          color: TOMATO_DARK,
        },
      },
    },
  },
});

export default theme;
