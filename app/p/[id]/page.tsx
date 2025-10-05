// app/p/[id]/page.tsx
import Grid from '@mui/material/GridLegacy';
import { Container, Box, Typography, Stack, Chip, Divider } from '@mui/material';
import Link from 'next/link';
import { fetchJSON } from '@/lib/server';
import { formatARS } from '@/lib/format';
import AddToCartButton from '@/components/AddToCartButton';
import ProductsCarousel from '@/components/ProductsCarousel';
import { getCategoryEmoji } from '@/lib/categoryEmoji';
import { upscaleCarrefourImage } from '@/lib/images';

export const revalidate = 60;

type Category = { id: number; name: string; slug: string };
type Product = {
    id: string;
    name: string;
    brand: string | null;
    price: number | null;
    currency: string;
    image: string | null;
    category_id: number;
    category?: Category | null;
};
type CategoryProductsPayload = {
    items: Product[];
    total: number;
    page: number;
    pageSize: number;
};

export default async function ProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params; // Next 15: params es Promise
    const product = await fetchJSON<Product>(`/api/products/${encodeURIComponent(id)}`, 120);

    const category = product.category ?? null;

    // Traer otros productos de la misma categoría (18) y excluir el actual
    let others: Product[] = [];
    if (category) {
        const qs = new URLSearchParams({ pageSize: '18', sort: 'name_asc' }).toString();
        const data = await fetchJSON<CategoryProductsPayload>(
            `/api/categories/${category.id}/products?${qs}`,
            60
        );
        others = (data.items || []).filter((p) => p.id !== product.id);
    }

    // Descripción simulada (mock)
    const mockDescription =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ut felis at nunc dictum aliquet. Integer non sem malesuada, semper turpis a, commodo nulla. Etiam a dolor nec justo pulvinar hendrerit.';

    return (
        <>
            <Grid container spacing={6} justifyContent="space-between">
                {/* Imagen */}
                <Grid item xs={12} md={7}>
                    <Box
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            p: 2,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: 'background.paper',
                            aspectRatio: '1 / 1',
                            margin: "0 auto"
                        }}
                    >
                        {product.image ? (
                            <img
                                src={upscaleCarrefourImage(product.image, 1200) || product.image}
                                alt={product.name}
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                        ) : null}
                    </Box>
                </Grid>

                {/* Detalle */}
                <Grid item xs={12} md={4}>
                    <Stack spacing={2} direction="column" justifyContent="space-between" sx={{ height: "80%"}}>
                        <Stack direction="column" gap={2}>
                            <Typography variant="h4" fontWeight={800}>
                                {product.name}
                            </Typography>

                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                {category && (
                                    <Chip
                                        component={Link}
                                        clickable
                                        href={`/c/${category.slug}`}
                                        label={`${getCategoryEmoji(category.slug)} ${category.name}`}
                                    />
                                )}
                                {product.brand ? <Chip label={product.brand} variant="outlined" /> : null}
                            </Stack>

                            <Typography variant="body1" color="text.secondary">
                                {mockDescription}
                            </Typography>
                        </Stack>

                        <Stack direction="column" gap={2} sx={{ mt: 10 }}>
                            <Divider />

                            <Typography variant="h5" fontWeight={800} align='right'>
                                {formatARS(product.price)}
                            </Typography>

                            <AddToCartButton product={product} />
                        </Stack>
                    </Stack>
                </Grid>
            </Grid>

            {/* Otros productos de la misma categoría */}
            {category && others.length > 0 && (
                <Box sx={{ mt: 5 }}>
                    <ProductsCarousel
                        title={`Más de ${category.name}`}
                        categorySlug={category.slug}
                        products={others}
                    />
                </Box>
            )}
        </>
    );
}
