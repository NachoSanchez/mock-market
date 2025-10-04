import { NextResponse } from "next/server";


export async function GET() {
    return NextResponse.json({ ok: true, ts: Date.now() }, {
        status: 200,
        headers: { "Cache-Control": "public, max-age=60" },
    });
}