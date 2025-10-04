import { NextRequest, NextResponse } from "next/server";
import { loadDB } from "../../_lib/db";

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params; // 👈 await al Promise de params
    const { products, categories } = await loadDB();

    const found = products.find((p) => p.id === id);
    if (!found) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const category = categories.find((c) => c.id === found.category_id) ?? null;

    return NextResponse.json({ ...found, category }, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
}
