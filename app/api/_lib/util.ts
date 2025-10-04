import type { Category, Product } from "../_lib/types";


export function toInt(value: string | null, fallback: number): number {
    const n = Number.parseInt(String(value ?? ""), 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}


export function toFloat(value: string | null, fallback: number | null): number | null {
    if (value == null) return fallback;
    const n = Number.parseFloat(String(value));
    return Number.isFinite(n) ? n : fallback;
}


export function sortProducts(items: Product[], sort: string): Product[] {
    const [field, dir] = sort.split("_");
    const isAsc = (dir ?? "asc").toLowerCase() !== "desc";

    const collator = new Intl.Collator("es", { sensitivity: "base" });

    return items.slice().sort((a, b) => {
        if (field === "price") {
            const pa = a.price ?? Number.POSITIVE_INFINITY;
            const pb = b.price ?? Number.POSITIVE_INFINITY;
            return isAsc ? pa - pb : pb - pa;
        }
        // default: name
        const na = a.name ?? "";
        const nb = b.name ?? "";
        return isAsc ? collator.compare(na, nb) : collator.compare(nb, na);
    });
}


export function paginate<T>(items: T[], page: number, pageSize: number) {
    const total = items.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return { total, page, pageSize, items: items.slice(start, end) };
}


export function categoriesFacet(categories: Category[], items: Product[]) {
    const countById = new Map<number, number>();
    for (const p of items) countById.set(p.category_id, (countById.get(p.category_id) ?? 0) + 1);
    return categories
        .map((c) => ({ id: c.id, name: c.name, slug: c.slug, count: countById.get(c.id) ?? 0 }))
        .filter((c) => c.count > 0)
        .sort((a, b) => a.name.localeCompare(b.name, "es"));
}