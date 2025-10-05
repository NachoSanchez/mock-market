// app/c/[slug]/page.tsx
import Grid from '@mui/material/GridLegacy';
import { fetchJSON } from '@/lib/server';
import { Stack, Typography } from '@mui/material';
import ProductCard from '@/components/ProductCard';
import PaginationBar from '@/components/PaginationBar';
import type { Product } from '@/hooks/useCart';
import { getCategoryEmoji } from '@/lib/categoryEmoji';
import SortSelect from '@/components/SortSelect';
import CategoryHeroBanner from '@/components/CategoryHeroBanner';

type Category = { id: number; name: string; slug: string };
type CategoryPayload = {
    category: Category;
    items: Product[];
    total: number;
    page: number;
    pageSize: number;
};

export const revalidate = 60;

export default async function CategoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string; sort?: string }>;
}) {
    const { slug } = await params;
    const sp = await searchParams;
    const page = Number(sp.page ?? 1);
    const pageSize = 24;
    const sort = sp.sort ?? 'name_asc';

    const qs = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sort,
    }).toString();

    const data = await fetchJSON<CategoryPayload>(
        `/api/categories/slug/${encodeURIComponent(slug)}/products?${qs}`,
        60
    );

    return (
        <>
            <CategoryHeroBanner
                slug={slug}
                categoryName={data.category?.name ?? 'Categoría'}
                // pollIntervalMs={20000} // <- cuando conectes mcis.fetch, podés refrescar en “tiempo real”
            />

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    <span style={{ marginRight: 8 }}>{getCategoryEmoji(slug)}</span>
                    {data.category?.name ?? 'Categoría'}
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
