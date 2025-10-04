import { NextRequest, NextResponse } from "next/server";
import { loadDB } from "../../_lib/db";


export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
    const { categories } = await loadDB();
    const id = Number.parseInt(params.id, 10);
    const found = categories.find((c) => c.id === id);
    if (!found) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    return NextResponse.json(found, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
}