// components/PaginationBar.tsx
'use client';
import * as React from 'react';
import { Pagination, Box } from '@mui/material';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function PaginationBar({
    total,
    page,
    pageSize,
}: {
    total: number;
    page: number;
    pageSize: number;
}) {
    const pages = Math.max(1, Math.ceil((total ?? 0) / (pageSize || 24)));
    const router = useRouter();
    const pathname = usePathname();
    const search = useSearchParams();

    if (pages <= 1) return null;

    const handleChange = (_: React.ChangeEvent<unknown>, value: number) => {
        const params = new URLSearchParams(search.toString());
        params.set('page', String(value));
        router.push(`${pathname}?${params.toString()}`);
        // scroll to top of list
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 3 }}>
            <Pagination
                count={pages}
                page={page || 1}
                onChange={handleChange}
                shape="rounded"
                color="primary"
                showFirstButton
                showLastButton
            />
        </Box>
    );
}
