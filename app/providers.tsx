'use client';
import * as React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import theme from './theme';
import { UserProvider } from '@/hooks/useUser';
import { CartProvider } from '@/hooks/useCart';


export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AppRouterCacheProvider>
            <UserProvider>
                <CartProvider>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        {children}
                    </ThemeProvider>
                </CartProvider>
            </UserProvider>
        </AppRouterCacheProvider>
    );
}