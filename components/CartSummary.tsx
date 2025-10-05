// components/CartSummary.tsx
'use client';
import * as React from 'react';
import { Box, Stack, Typography, Divider, Button } from '@mui/material';
import { useCart } from '@/hooks/useCart';
import AddToCartButton from '@/components/AddToCartButton';
import { formatARS } from '@/lib/format';

export default function CartSummary({ onClose }: { onClose?: () => void }) {
    const { cart } = useCart();

    const total = cart.lineItems.reduce((acc, li) => {
        const unit = Number(li.product.price ?? 0);
        return acc + unit * li.quantity;
    }, 0);

    if (cart.lineItems.length === 0) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Tu carrito está vacío por ahora.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'grid', gap: 2 }}>
            {/* Lista */}
            <Stack spacing={2} sx={{ p: 1, height: 500, overflow: "auto" }}>
                {cart.lineItems.map((li) => {
                    const unit = Number(li.product.price ?? 0);
                    const subtotal = unit * li.quantity;
                    return (
                        <Box
                            key={li.itemId}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                py: 1,
                            }}
                        >
                            {/* Imagen */}
                            <Box
                                sx={{
                                    width: 84,
                                    height: 84,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    bgcolor: 'background.paper',
                                    flexShrink: 0, // no se achica en layouts angostos
                                }}
                            >
                                {li.product.image ? (
                                    <img
                                        src={li.product.image}
                                        alt={li.product.name}
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                    />
                                ) : null}
                            </Box>

                            {/* Detalle + controles */}
                            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {/* Nombre + qty */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'baseline',
                                        gap: 1,
                                        minWidth: 0,
                                    }}
                                >
                                    <Box
                                        component="span"
                                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.95rem' }}
                                        title={li.product.name}
                                    >
                                        {li.product.name}
                                    </Box>
                                    <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                        (x {li.quantity})
                                    </Box>
                                </Box>

                                {/* Precios + controles */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 2,
                                        flexWrap: 'wrap', // mejor comportamiento en mobile
                                    }}
                                >
                                    <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                                        {formatARS(unit)} / <strong>{formatARS(subtotal)}</strong>
                                    </Box>

                                    <Box sx={{ width: 220, maxWidth: '50%' }}>
                                        <AddToCartButton product={li.product} />
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                    );
                })}
            </Stack>

            <Divider />

            {/* Total */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle1" fontWeight={700}>
                    Total
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                    {formatARS(total)}
                </Typography>
            </Stack>
        </Box>
    );
}
