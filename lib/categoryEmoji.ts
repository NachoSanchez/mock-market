// lib/categoryEmoji.ts
const EMOJI_BY_SLUG: Record<string, string> = {
    'almacen': '🥫',
    'bebidas-sin-alcohol': '🧃',
    'carnes': '🥩',
    'congelados': '🧊',
    'frutas-y-verduras': '🥦',
    'gaseosas': '🥤',
    'lacteos': '🥛',
    'panaderia': '🥖',
    'snacks': '🍿',
    'vinos-tintos': '🍷',
};

export function getCategoryEmoji(slugOrName?: string | null) {
    if (!slugOrName) return '';
    const key = slugOrName.toLowerCase().trim().replace(/\s+/g, '-');
    return EMOJI_BY_SLUG[key] ?? '';
}
