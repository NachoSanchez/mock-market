export function upscaleCarrefourImage(
    url: string | null | undefined,
    size = 600 
): string | null {
    if (!url) return null;
    try {
        const u = new URL(url);

        if (!u.hostname.includes('carrefourar.vtexassets.com')) {
            return url;
        }

        u.pathname = u.pathname.replace(/-(\d+)-(\d+)(?=($|[.?]))/, `-${size}-${size}`);

        if (u.searchParams.has('width')) u.searchParams.set('width', String(size));
        if (u.searchParams.has('height')) u.searchParams.set('height', String(size));

        return u.toString();
    } catch {
        return url;
    }
}
