"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import { getCategoryEmoji } from "@/lib/categoryEmoji";

declare global {
    interface Window {
        SalesforceInteractions?: any;
    }
}

type EmojiShape = {
    emoji: string;
    left: string;   
    top: string;    
    rotate: string; 
    size: string;   
    opacity: number;
};

const CATEGORY_SLUGS = [
    "almacen",
    "bebidas-sin-alcohol",
    "carnes",
    "congelados",
    "frutas-y-verduras",
    "gaseosas",
    "lacteos",
    "panaderia",
    "snacks",
    "vinos-tintos",
];

export default function WelcomeBanner() {
    const [heroTitle, setHeroTitle] = useState<string | null>(null);
    const [heroBgUrl, setHeroBgUrl] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && window.SalesforceInteractions) {
            console.log("SalesforceInteractions detected:", window.SalesforceInteractions);
            // FUTURO:
            // - Llamar a window.SalesforceInteractions.mcis.fetch(...)
            // - setHeroTitle(payload.title);
            // - setHeroBgUrl(payload.imageUrl);
        }
    }, []);

    const hasDynamic = !!heroTitle || !!heroBgUrl;

    const emojiWall: EmojiShape[] = useMemo(() => {
        const basePositions: Array<Omit<EmojiShape, "emoji">> = [
            { left: "5%", top: "10%", rotate: "-10deg", size: "clamp(48px, 7vw, 84px)", opacity: 1 },
            { left: "22%", top: "0%", rotate: "12deg", size: "clamp(56px, 9vw, 108px)", opacity: 1 },
            { left: "40%", top: "14%", rotate: "-6deg", size: "clamp(44px, 6.5vw, 76px)", opacity: 1 },
            { left: "62%", top: "4%", rotate: "8deg", size: "clamp(60px, 9vw, 110px)", opacity: 1 },
            { left: "82%", top: "12%", rotate: "-14deg", size: "clamp(48px, 7vw, 88px)", opacity: 1 },
            { left: "12%", top: "58%", rotate: "10deg", size: "clamp(58px, 8vw, 96px)", opacity: 1 },
            { left: "30%", top: "70%", rotate: "-8deg", size: "clamp(44px, 6vw, 72px)", opacity: 1 },
            { left: "48%", top: "54%", rotate: "14deg", size: "clamp(64px, 9vw, 112px)", opacity: 1 },
            { left: "68%", top: "72%", rotate: "-12deg", size: "clamp(52px, 7.5vw, 92px)", opacity: 1 },
            { left: "86%", top: "52%", rotate: "6deg", size: "clamp(46px, 6.5vw, 80px)", opacity: 1 },
           // { left: "12%", top: "25%", rotate: "36deg", size: "clamp(75px, 6.5vw, 120px)", opacity: 1 },
        ];

        // Recorremos slugs y repetimos algunos para llenar
        const emojis = CATEGORY_SLUGS.map(getCategoryEmoji).filter(Boolean);
        const extended = [...emojis, ...emojis.slice(0, Math.max(0, basePositions.length - emojis.length))];

        return basePositions.map((pos, i) => ({
            emoji: extended[i % extended.length],
            ...pos,
        }));
    }, []);

    return (
        <Box
            role="banner"
            sx={{
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                minHeight: { xs: 220, sm: 260, md: 300 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                px: 2,
                // Default: color secundario
                bgcolor: hasDynamic ? "transparent" : "secondary.main",
                color: hasDynamic ? "common.white" : "secondary.contrastText",
                // Dinámico: imagen de fondo si existe
                ...(heroBgUrl
                    ? {
                        backgroundImage: `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.35)), url(${heroBgUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }
                    : {}),
            }}
        >
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
                    {emojiWall.map((e, idx) => (
                        <Box
                            key={`${e.emoji}-${idx}`}
                            component="span"
                            sx={{
                                position: "absolute",
                                left: e.left,
                                top: e.top,
                                transform: `rotate(${e.rotate})`,
                                fontSize: e.size,
                                opacity: e.opacity,
                                filter: "saturate(120%)",
                                userSelect: "none",
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
                    textShadow: heroBgUrl ? "0 2px 12px rgba(0,0,0,.45)" : "none",
                }}
            >
                {heroTitle || "Bienvenido a MockMarket"}
            </Typography>
        </Box>
    );
}
