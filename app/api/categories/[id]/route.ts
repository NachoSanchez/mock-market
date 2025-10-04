import { NextRequest, NextResponse } from "next/server";
import { loadDB } from "../../_lib/db";

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;          // 👈 await al Promise de params
    const { categories } = await loadDB();

    const catId = Number.parseInt(id, 10);
    const found = categories.find((c) => c.id === catId);

    if (!found) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(found, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
}
