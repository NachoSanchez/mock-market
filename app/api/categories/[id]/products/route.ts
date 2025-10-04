import { NextRequest, NextResponse } from "next/server";
import { loadDB } from "../../../_lib/db";
import { categoriesFacet, paginate, sortProducts, toFloat, toInt } from "../../../_lib/util";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    // 👇 await al Promise de params
    const { id } = await context.params;

    const { products, categories } = await loadDB();
    const { searchParams } = new URL(req.url);

    const catId = Number.parseInt(id, 10);
    if (!Number.isFinite(catId)) {
        return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
    }

    const query = (searchParams.get("query") ?? searchParams.get("q") ?? "").trim();
    const minPrice = toFloat(searchParams.get("minPrice"), null);
    const maxPrice = toFloat(searchParams.get("maxPrice"), null);
    const page = toInt(searchParams.get("page"), 1);
    const pageSize = toInt(searchParams.get("pageSize"), 24);
    const sort = (searchParams.get("sort") ?? "name_asc").toLowerCase();

    const q = query.toLocaleLowerCase("es");
    const containsQ = (s: string | null | undefined) => (s ? s.toLocaleLowerCase("es").includes(q) : false);

    let filtered = products.filter((p) => {
        if (p.category_id !== catId) return false;
        if (minPrice != null && (p.price ?? Number.POSITIVE_INFINITY) < minPrice) return false;
        if (maxPrice != null && (p.price ?? Number.POSITIVE_INFINITY) > maxPrice) return false;
        if (q && !(containsQ(p.name) || containsQ(p.brand))) return false;
        return true;
    });

    filtered = sortProducts(filtered, sort);

    const facetCats = categoriesFacet(categories, filtered);
    const priced = filtered.map((p) => p.price).filter((v): v is number => typeof v === "number");
    const priceRange = priced.length ? { min: Math.min(...priced), max: Math.max(...priced) } : { min: null, max: null };

    const payload = {
        ...paginate(filtered, page, pageSize),
        facets: { categories: facetCats, priceRange },
    };

    return NextResponse.json(payload, {
        headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60" },
    });
}
