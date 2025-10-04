import { NextRequest, NextResponse } from "next/server";
import { loadDB } from "../../../_lib/db";

export async function GET(_req: NextRequest, context: { params: Promise<{ slug: string }> }) {
    const { slug } = await context.params; // 👈 await al Promise de params
    const { categories } = await loadDB();

    const found = categories.find((c) => c.slug === slug);
    if (!found) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(found, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
}
