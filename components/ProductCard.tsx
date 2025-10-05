'use client';
import * as React from 'react';
import { Paper, Typography, Box, Stack } from '@mui/material';
import AddToCartButton from '@/components/AddToCartButton';
import type { Product } from '@/hooks/useCart';
import { formatARS } from '@/lib/format';

export default function ProductCard({ product }: { product: Product }) {
    return (
        <Paper
            sx={{
                height: 370,              
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                display: 'grid',
                gridTemplateRows: '210px 1fr', // imagen + contenido
            }}
            elevation={0}
        >
            {/* Imagen en alto fijo */}
            <Box sx={{ p: 0, display: 'grid', placeItems: 'center' }}>
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                ) : null}
            </Box>

            {/* Contenido */}
            <Box sx={{ p: 2, mt: 4, background: "#fff"}}>
                <Stack spacing={1}>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
                        <Typography
                            variant="subtitle2"
                            title={product.name}
                            sx={{
                                flex: 1,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,          
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                minHeight: 40,               
                            }}
                        >
                            {product.name}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={700} align='left' sx={{ whiteSpace: 'nowrap' }}>
                            {formatARS(product.price)}
                        </Typography>
                    </Stack>

                    <AddToCartButton product={product} />
                </Stack>
            </Box>
        </Paper>
    );
}
