// components/CategoryHeroBanner.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { getCategoryEmoji } from "@/lib/categoryEmoji";

declare global {
    interface Window {
        SalesforceInteractions?: any;
    }
}

type Props = {
    slug: string;
    categoryName: string;
    pollIntervalMs?: number;
};

type EmojiPos = {
    left: string; top: string; rot: string; size: string; key: string;
};

/** Colores por categoría — pasteles/análogos para convivir bien con violeta */
const COLOR_BY_SLUG: Record<string, string> = {
    "almacen": "#B8C1FF", // lavender blue
    "bebidas-sin-alcohol": "#A7E0FF", // light sky
    "carnes": "#FFC1C8", // light rose
    "congelados": "#C7E6FF", // ice blue
    "frutas-y-verduras": "#BFF0C2", // mint/green
    "gaseosas": "#B5D8FF", // soft blue
    "lacteos": "#D6F0FF", // milk blue
    "panaderia": "#FFE3B3", // bakery cream
    "snacks": "#FFE0CC", // peach
    "vinos-tintos": "#E0B7FF", // lilac
};

const RELATED_BY_SLUG: Record<string, string[]> = {
    "almacen": ["🥫", "🍝", "🍪", "🧂", "🫙", "🧄"],
    "bebidas-sin-alcohol": ["🧃", "🥤", "🧋", "☕", "🫖", "🥛", "🧊"],
    "carnes": ["🥩", "🍗", "🍖", "🥓", "🍔"],
    "congelados": ["🧊", "🍨", "🍦", "🥶", "🧁", "❄️"],
    "frutas-y-verduras": ["🥦", "🍎", "🍌", "🥕", "🍅", "🥒", "🍇", "🍓"],
    "gaseosas": ["🥤", "🧃", "🧊", "🧋"],
    "lacteos": ["🥛", "🧀", "🍦", "🍨", "🥞", "🧈"],
    "panaderia": ["🥖", "🍞", "🥐", "🥯", "🥨", "🫓"],
    "snacks": ["🍿", "🍪", "🍫", "🍟", "🌮"],
    "vinos-tintos": ["🍷", "🍇", "🧀", "🍞", "🍾", "🥂"],
};

const BASE_POSITIONS: Omit<EmojiPos, "key">[] = [
    { left: "6%", top: "8%", rot: "-12deg", size: "clamp(56px, 9vw, 110px)" },
    { left: "24%", top: "-2%", rot: "10deg", size: "clamp(64px, 10vw, 128px)" },
    { left: "44%", top: "12%", rot: "-6deg", size: "clamp(52px, 8vw, 100px)" },
    { left: "64%", top: "0%", rot: "8deg", size: "clamp(66px, 10vw, 132px)" },
    { left: "84%", top: "10%", rot: "-14deg", size: "clamp(58px, 9vw, 116px)" },

    { left: "12%", top: "60%", rot: "12deg", size: "clamp(62px, 10vw, 128px)" },
    { left: "32%", top: "74%", rot: "-10deg", size: "clamp(50px, 8vw, 100px)" },
    { left: "52%", top: "56%", rot: "14deg", size: "clamp(70px, 11vw, 140px)" },
    { left: "72%", top: "70%", rot: "-8deg", size: "clamp(56px, 9vw, 112px)" },
    { left: "90%", top: "52%", rot: "6deg", size: "clamp(48px, 7.5vw, 96px)" },
];

function hashStr(s: string) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
}
function rotateByHash<T>(arr: T[], seed: string): T[] {
    if (!arr.length) return arr;
    const offset = hashStr(seed) % arr.length;
    return [...arr.slice(offset), ...arr.slice(0, offset)];
}

export default function CategoryHeroBanner({ slug, categoryName, pollIntervalMs = 0 }: Props) {
    const theme = useTheme();
    const [heroTitle, setHeroTitle] = useState<string | null>(null);
    const [heroBgUrl, setHeroBgUrl] = useState<string | null>(null);
    const hasDynamic = !!heroTitle || !!heroBgUrl;

    useEffect(() => {
        if (typeof window !== "undefined" && window.SalesforceInteractions) {
            console.log("SalesforceInteractions detected (category):", window.SalesforceInteractions);
            // FUTURO: mcis.fetch(...) -> setHeroTitle(...); setHeroBgUrl(...);
        }
    }, [slug]);

    useEffect(() => {
        if (!pollIntervalMs) return;
        const id = window.setInterval(() => {
            if (window.SalesforceInteractions) {
                // FUTURO: re-fetch
            }
        }, pollIntervalMs);
        return () => window.clearInterval(id);
    }, [pollIntervalMs, slug]);

    const categoryColor = COLOR_BY_SLUG[slug] ?? "#CDBDFF"; // fallback lilac
    const primaryEmoji = getCategoryEmoji(slug) || "🛒";
    const emojiPool = useMemo(() => {
        const related = RELATED_BY_SLUG[slug] || [primaryEmoji, "🛒"];
        return rotateByHash(Array.from(new Set([primaryEmoji, ...related])), slug);
    }, [slug, primaryEmoji]);

    const emojiWall = useMemo(() => {
        const rotated = rotateByHash(emojiPool, slug + "-wall");
        return BASE_POSITIONS.map((pos, i) => ({ ...pos, key: `pos-${i}`, emoji: rotated[i % rotated.length] }));
    }, [emojiPool, slug]);

    const categoryBaseColor = (slug: string) => {
        switch(slug) {
            case "frutas-y-verduras":
                return theme.palette.success.main;
            case "congelados":
                return theme.palette.common.white;
            case "lacteos": 
                return theme.palette.info.light;
            case "bebidas-sin-alcohol":
                return theme.palette.info.dark;
            case "vinos-tintos": 
                return theme.palette.secondary.main;
            case "almacen":
                return theme.palette.success.light;
            case "carnes":
                return theme.palette.error.main;
            case "gaseosas": 
                return theme.palette.info.dark;
            default:
                return theme.palette.primary.main;
        }
    }

    return (
        <Box
            role="banner"
            sx={(theme) => ({
                position: "relative",
                borderRadius: 1,
                overflow: "hidden",
                minHeight: { xs: 220, sm: 240 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                // Default: gradiente entre el violeta del tema y el color de la categoría
                ...(hasDynamic
                    ? {
                        color: "common.white",
                        backgroundImage: `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.35)), url(${heroBgUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }
                    : {
                        color: theme.palette.getContrastText(categoryColor),
                        background: `linear-gradient(135deg, ${categoryBaseColor(slug)} 0%, ${categoryColor} 100%)`,
                    }),
            })}
        >
            {/* Emojis “al corte” con opacity = 1 */}
            {!hasDynamic && (
                <Box
                    aria-hidden
                    sx={{
                        position: "absolute",
                        inset: 0,
                        overflow: "hidden",
                        pointerEvents: "none",
                    }}
                >
                    {emojiWall.map((e) => (
                        <Box
                            key={e.key}
                            component="span"
                            sx={{
                                position: "absolute",
                                left: e.left,
                                top: e.top,
                                transform: `rotate(${e.rot})`,
                                fontSize: e.size,
                                opacity: 1, // pedido: opacidad total
                                // sutil separación para que no “peleen” con el fondo
                                textShadow: "0 2px 8px rgba(0,0,0,.10)",
                                userSelect: "none",
                                filter: "saturate(115%)",
                            }}
                        >
                            {e.emoji}
                        </Box>
                    ))}
                </Box>
            )}

            <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                    position: "relative",
                    zIndex: 1,
                    px: 1,
                    lineHeight: 1.2,
                    textShadow: heroBgUrl ? "0 2px 12px rgba(0,0,0,.45)" : "0 1px 6px rgba(0,0,0,.15)",
                    color: "primary.contrastText"
                }}
            >
                {heroTitle || categoryName}
            </Typography>
        </Box>
    );
}
