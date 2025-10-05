// components/CartIcon.tsx
'use client';
import * as React from 'react';
import { IconButton, Badge } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCart } from '@/hooks/useCart';

export default function CartIcon({ onClick }: { onClick?: () => void }) {
    const { totalItems } = useCart();
    return (
        <IconButton aria-label="cart" onClick={onClick}>
            <Badge color="primary" badgeContent={totalItems}>
                <ShoppingCartIcon />
            </Badge>
        </IconButton>
    );
}
