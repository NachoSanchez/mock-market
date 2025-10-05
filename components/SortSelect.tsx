// components/SortSelect.tsx
'use client';
import * as React from 'react';
import { TextField, MenuItem } from '@mui/material';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const OPTIONS = [
    { value: 'name_asc', label: 'Nombre (A→Z)' },
    { value: 'name_desc', label: 'Nombre (Z→A)' },
    { value: 'price_asc', label: 'Precio (↑)' },
    { value: 'price_desc', label: 'Precio (↓)' },
];

export default function SortSelect() {
    const router = useRouter();
    const pathname = usePathname();
    const search = useSearchParams();

    const current = (search.get('sort') ?? 'name_asc').toLowerCase();

    const onChange = (value: string) => {
        const params = new URLSearchParams(search.toString());
        params.set('sort', value);
        params.set('page', '1'); // reset paginación al cambiar sort
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <TextField
            select
            size="small"
            label="Ordenar por"
            value={current}
            onChange={(e) => onChange(e.target.value)}
            sx={{ minWidth: 220 }}
            slotProps={{
                input: {
                    sx : { background: "#FFFFFF"}
                }
            }}
        >
            {OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                </MenuItem>
            ))}
        </TextField>
    );
}
