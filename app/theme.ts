'use client';
import { createTheme } from '@mui/material/styles';


const theme = createTheme({
    palette: {
        mode: 'light',
        //primary: { main: '#ff6d00' },
        //secondary: { main: '#2962ff' },
    },
    shape: { borderRadius: 12 },
    typography: { fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' },
});


export default theme;