import ProductsCarousel from '@/components/ProductsCarousel';
import type { Product } from '@/hooks/useCart';
import type { Category } from '@/components/navbar';
import { fetchJSON } from '@/lib/server';
import WelcomeBanner from '@/components/WelcomeBanner';
import dynamic from 'next/dynamic';
import ThankYouModal from '@/components/ThankYouModal';

export const revalidate = 60;

export default async function HomePage({
	searchParams,
}: { searchParams: Promise<{ thanks?: string }> }) {
	const sp = await searchParams;
	const orderId = sp?.thanks ?? null; // puede ser undefined

	const categories = await fetchJSON<Category[]>(`/api/categories`, 300);
	const sections = await Promise.all(
		categories.map(async (c) => {
			const data = await fetchJSON<{ items: Product[] }>(
				`/api/categories/${c.id}/products?${new URLSearchParams({ pageSize: '12', sort: 'name_asc' })}`
			);
			return { category: c, items: data.items };
		})
	);

	return (
		<main>
      		<ThankYouModal openInitially={Boolean(orderId)} orderId={orderId} />
			<WelcomeBanner />
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
