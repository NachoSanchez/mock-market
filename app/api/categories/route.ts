import { NextResponse } from "next/server";
import { loadDB } from "../_lib/db";


export async function GET() {
    const { categories } = await loadDB();
    return NextResponse.json(categories, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
}