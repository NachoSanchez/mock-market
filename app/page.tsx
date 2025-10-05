import ProductsCarousel from '@/components/ProductsCarousel';
import type { Product } from '@/hooks/useCart';
import type { Category } from '@/components/navbar';
import { fetchJSON } from '@/lib/server';

export const revalidate = 60;

export default async function HomePage() {
	const categories = await fetchJSON<Category[]>(`/api/categories`, 300);

	const sections = await Promise.all(
		categories.map(async (c) => {
			const data = await fetchJSON<{ items: Product[] }>(`/api/categories/${c.id}/products?${new URLSearchParams({ pageSize: '12', sort: 'name_asc' })}`);
			return { category: c, items: data.items };
		})
	);

	return (
		<main>
			{sections.map((s) => (
				<ProductsCarousel
					key={s.category.id}
					title={s.category.name}
					products={s.items}
					categorySlug={s.category.slug}
				/>
			))}
		</main>
	);
}
