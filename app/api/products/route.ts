import { NextRequest, NextResponse } from "next/server";
import { loadDB } from "../_lib/db";
import { categoriesFacet, paginate, sortProducts, toFloat, toInt } from "../_lib/util";

export async function GET(req: NextRequest) {
    const { products, categories } = await loadDB();
    const { searchParams } = new URL(req.url);

    const query = (searchParams.get("query") ?? searchParams.get("q") ?? "").trim();
    const categoryId = toInt(searchParams.get("categoryId"), 0);
    const categorySlug = (searchParams.get("categorySlug") ?? "").trim();
    const minPrice = toFloat(searchParams.get("minPrice"), null);
    const maxPrice = toFloat(searchParams.get("maxPrice"), null);
    const page = toInt(searchParams.get("page"), 1);
    const pageSize = toInt(searchParams.get("pageSize"), 24);

    // sort seguro con fallback
    const sortRaw = (searchParams.get("sort") ?? "name_asc").toLowerCase();
    const allowedSort = new Set(["name_asc", "name_desc", "price_asc", "price_desc"]);
    const sort = allowedSort.has(sortRaw) ? sortRaw : "name_asc";

    // Resolver categoryId por slug si vino con categorySlug
    let effectiveCategoryId = categoryId;
    if (!effectiveCategoryId && categorySlug) {
        effectiveCategoryId = categories.find((c) => c.slug === categorySlug)?.id ?? 0;
    }

    const q = query.toLocaleLowerCase("es");
    const containsQ = (s: string | null | undefined) =>
        (s ? s.toLocaleLowerCase("es").includes(q) : false);

    let filtered = products.filter((p) => {
        if (effectiveCategoryId && p.category_id !== effectiveCategoryId) return false;
        if (minPrice != null && (p.price ?? Number.POSITIVE_INFINITY) < minPrice) return false;
        if (maxPrice != null && (p.price ?? Number.POSITIVE_INFINITY) > maxPrice) return false;
        if (q && !(containsQ(p.name) || containsQ(p.brand))) return false;
        return true;
    });

    filtered = sortProducts(filtered, sort);

    const facetCats = categoriesFacet(categories, filtered);
    const priced = filtered.map((p) => p.price).filter((v): v is number => typeof v === "number");
    const priceRange = priced.length
        ? { min: Math.min(...priced), max: Math.max(...priced) }
        : { min: null, max: null };

    const payload = {
        ...paginate(filtered, page, pageSize),
        facets: { categories: facetCats, priceRange },
    };

    return NextResponse.json(payload, {
        headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60" },
    });
}
