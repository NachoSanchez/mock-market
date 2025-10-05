// components/ProductCard.tsx
'use client';
import * as React from 'react';
import { Paper, Typography, Box, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';
import type { Product } from '@/hooks/useCart';
import { formatARS } from '@/lib/format';

export default function ProductCard({ product }: { product: Product }) {
    const router = useRouter();

    const goToPDP = React.useCallback(() => {
        router.push(`/p/${encodeURIComponent(product.id)}`);
    }, [router, product.id]);

    const onKeyActivate = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goToPDP();
        }
    };

    return (
        <Paper
            elevation={0}
            role="link"
            tabIndex={0}
            aria-label={`Ver ${product.name}`}
            onClick={goToPDP}
            onKeyDown={onKeyActivate}
            sx={{
                height: 370,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                display: 'grid',
                gridTemplateRows: '210px 1fr', // imagen + contenido
                cursor: 'pointer',
                '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                },
            }}
        >
            {/* Imagen (alto fijo) */}
            <Box sx={{ p: 0, display: 'grid', placeItems: 'center' }}>
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        height={220}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                ) : null}
            </Box>

            {/* Contenido */}
            <Box sx={{ p: 2, mt: 4, background: '#fff' }}>
                <Stack spacing={1}>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
                        <Typography
                            variant="subtitle2"
                            title={product.name}
                            sx={{
                                flex: 1,
                                display: '-webkit-box',
                                WebkitLineClamp: 2, // máx 2 líneas
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                minHeight: 40,
                            }}
                        >
                            {product.name}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={700} align="left" sx={{ whiteSpace: 'nowrap' }}>
                            {formatARS(product.price)}
                        </Typography>
                    </Stack>

                    {/* Importante: evitar que el click en el botón navegue */}
                    <Box
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                    >
                        <AddToCartButton product={product} />
                    </Box>
                </Stack>
            </Box>
        </Paper>
    );
}
