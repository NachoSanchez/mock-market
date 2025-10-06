// components/Footer.tsx
'use client';
import * as React from 'react';
import {
    Box,
    Container,
    Stack,
    Typography,
    TextField,
    Button,
    InputAdornment,
    Divider,
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { alpha } from '@mui/material/styles';
import { useUser } from '@/hooks/useUser';

export default function Footer() {
    const { user } = useUser();
    const [email, setEmail] = React.useState(user?.email ?? '');
    const [loading, setLoading] = React.useState(false);
    const [ok, setOk] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        setEmail(user?.email ?? '');
    }, [user?.email]);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const val = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            setError('Ingresá un email válido.');
            return;
        }
        setLoading(true);
        // simulación de request
        setTimeout(() => {
            setLoading(false);
            setOk(true);
        }, 1200);
    };

    return (
        <Box
            component="footer"
            sx={(t) => ({
                mt: 8,
                pt: 5,
                pb: 3,
                borderRadius: 1,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderTop: `1px solid ${alpha(t.palette.common.black, 0.15)}`,
            })}
        >
            <Container>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={3}
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    justifyContent="space-between"
                    sx={{ pb: 3 }}
                >
                    <Box>
                        <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                            🛒 MockMarket
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            Suscribite a nuestras ofertas
                        </Typography>
                    </Box>

                    <Box
                        component="form"
                        onSubmit={onSubmit}
                        noValidate
                        sx={{ width: { xs: '100%', md: 520 } }}
                    >
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
                            <TextField
                                variant="outlined"
                                size="small"
                                fullWidth
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={Boolean(error)}
                                //helperText={error || (ok ? '¡Gracias por suscribirte!' : ' ')}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MailOutlineIcon sx={{ color: 'primary.contrastText' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        bgcolor: 'rgba(255,255,255,0.12)',
                                        color: 'primary.contrastText',
                                        borderColor: alpha('#fff', 0.4),
                                    },
                                    '& .MuiInputBase-input::placeholder': { color: alpha('#fff', 0.8) },
                                    '& .MuiFormHelperText-root': { color: 'primary.contrastText', m: 0, mt: 0.5 },
                                }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                color="secondary"
                                disabled={loading}
                                sx={{
                                    whiteSpace: 'nowrap',
                                    alignSelf: { xs: 'stretch', sm: 'center' },
                                }}
                            >
                                {loading ? 'Enviando…' : 'Suscribirme'}
                            </Button>
                        </Stack>
                    </Box>
                </Stack>

                <Divider sx={{ borderColor: alpha('#000', 0.2), mb: 2 }} />

                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Hackforce
                </Typography>
            </Container>
        </Box>
    );
}
