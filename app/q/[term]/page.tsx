// app/q/[term]/page.tsx
import Grid from '@mui/material/GridLegacy';
import { fetchJSON } from '@/lib/server';
import {  Stack, Typography } from '@mui/material';
import ProductCard from '@/components/ProductCard';
import PaginationBar from '@/components/PaginationBar';
import type { Product } from '@/hooks/useCart';
import SortSelect from '@/components/SortSelect';

type SearchPayload = {
    items: Product[];
    total: number;
    page: number;
    pageSize: number;
};

export const revalidate = 60;

export default async function SearchPage({
    params,
    searchParams,
}: {
    params: Promise<{ term: string }>;
    searchParams: Promise<{ page?: string; sort?: string }>;
}) {
    const { term } = await params;               // 👈 await params
    const sp = await searchParams;               // 👈 await searchParams
    const page = Number(sp.page ?? 1);
    const pageSize = 24;
    const sort = sp.sort ?? 'name_asc';

    const qs = new URLSearchParams({
        query: decodeURIComponent(term).trim(),
        page: String(page),
        pageSize: String(pageSize),
        sort,
    }).toString();

    const data = await fetchJSON<SearchPayload>(`/api/products?${qs}`, 60);

    return (
        <>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
                    Resultados para “{decodeURIComponent(term)}”
                </Typography>

                <SortSelect />
            </Stack>

            <Grid container spacing={2}>
                {data.items.map((p) => (
                    <Grid item key={p.id} xs={12} sm={6} md={4} lg={3}>
                        <ProductCard product={p} />
                    </Grid>
                ))}
            </Grid>

            <PaginationBar total={data.total} page={data.page} pageSize={data.pageSize} />
        </>
    );
}
