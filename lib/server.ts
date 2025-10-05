// lib/server.ts
import { headers } from "next/headers";

// Solo para usar en Server Components / Route Handlers (no en Client Components)
export async function getBaseUrl() {
    const h = await headers();
    const host =
        h.get("x-forwarded-host") ??
        h.get("host") ??
        process.env.VERCEL_URL ??
        "localhost:3000";

    const proto =
        h.get("x-forwarded-proto") ??
        (host.includes("localhost") ? "http" : "https");

    return `${proto}://${host}`;
}

export async function fetchJSON<T>(path: string, revalidate = 60): Promise<T> {
    const base = await getBaseUrl();
    const res = await fetch(`${base}${path}`, { next: { revalidate } });
    if (!res.ok) throw new Error(`Failed to fetch ${path} (${res.status})`);

    return res.json() as Promise<T>;
}
