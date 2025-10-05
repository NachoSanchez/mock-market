// components/AddToCartButton.tsx
'use client';
import * as React from 'react';
import { Button, IconButton, Stack, Box, Tooltip } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { useCart, Product } from '@/hooks/useCart';

const CONTROL_SIZE = 40;

export default function AddToCartButton({
    product,
    qty = 1,
}: {
    product: Product;
    qty?: number;
}) {
    const { cart, addItem, setQuantity, removeItem } = useCart();

    // Buscar si el producto está en el carrito
    const line = React.useMemo(
        () => cart.lineItems.find((li) => li.itemId === product.id),
        [cart.lineItems, product.id]
    );

    // Si no está en el carrito -> botón agregar
    if (!line) {
        return (
            <Button
                variant="contained"
                fullWidth
                onClick={() => addItem(product, qty)}
            >
                Agregar al carrito
            </Button>
        );
    }

    const q = line.quantity;

    // Componente contador (muestra la cantidad con alto uniforme)
    const CountBox = (
        <Box
            aria-live="polite"
            sx={{
                minWidth: 48,
                height: CONTROL_SIZE,
                borderRadius: 1,
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                px: 1,
                userSelect: 'none',
            }}
        >
            {q}
        </Box>
    );

    // UI cuando quantity === 1: [Trash] 1 [+]
    if (q === 1) {
        return (
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ width: '100%', background: "#F5F5F5", borderRadius: 1 }}>
                <Tooltip title="Quitar del carrito">
                    <span>
                        <IconButton
                            aria-label="Quitar del carrito"
                            onClick={() => removeItem(line.itemId)}
                            color="error"
                            sx={{ width: CONTROL_SIZE, height: CONTROL_SIZE }}
                        >
                            <DeleteOutlineIcon />
                        </IconButton>
                    </span>
                </Tooltip>

                {CountBox}

                <Tooltip title="Agregar una unidad">
                    <span>
                        <IconButton
                            aria-label="Agregar una unidad"
                            onClick={() => setQuantity(line.itemId, q + 1)}
                            color="primary"
                            sx={{ width: CONTROL_SIZE, height: CONTROL_SIZE }}
                        >
                            <AddIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            </Stack>
        );
    }

    // UI cuando quantity > 1: [-] q [+]
    return (
        <Stack direction="row" spacing={1} alignItems="center"  justifyContent="space-between" sx={{ width: '100%', background: "#F5F5F5", borderRadius: 1 }}>
            <Tooltip title="Quitar una unidad">
                <span>
                    <IconButton
                        aria-label="Quitar una unidad"
                        onClick={() => setQuantity(line.itemId, q - 1)}
                        sx={{ width: CONTROL_SIZE, height: CONTROL_SIZE }}
                    >
                        <RemoveIcon />
                    </IconButton>
                </span>
            </Tooltip>

            {CountBox}

            <Tooltip title="Agregar una unidad">
                <span>
                    <IconButton
                        aria-label="Agregar una unidad"
                        onClick={() => setQuantity(line.itemId, q + 1)}
                        color="primary"
                        sx={{ width: CONTROL_SIZE, height: CONTROL_SIZE }}
                    >
                        <AddIcon />
                    </IconButton>
                </span>
            </Tooltip>
        </Stack>
    );
}
