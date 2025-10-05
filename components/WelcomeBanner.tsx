// components/WelcomeBanner.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import { getCategoryEmoji } from "@/lib/categoryEmoji";

declare global {
    interface Window {
        SalesforceInteractions?: any;
    }
}

type Props = {
    /** Nombre de la decision en MCP (ej. "HomeHeroRealtimeDeals") */
    decisionName?: string;
    /** Intervalo de refresco en ms para “tiempo real” */
    pollIntervalMs?: number;
    /** Color destino del degradé por defecto (convive bien con violeta) */
    fallbackGradientTo?: string; // default: "#CDBDFF"
};

type McisResponse = {
    items?: Array<{ html?: string; payload?: any; data?: any }>;
    html?: string;
    payload?: any;
    data?: any;
};

export default function WelcomeBanner({
    decisionName,
    pollIntervalMs,
    fallbackGradientTo = "#CDBDFF",
}: Props) {
    const [heroTitle, setHeroTitle] = useState<string | null>(null);
    const [heroBgUrl, setHeroBgUrl] = useState<string | null>(null);
    const [heroHtml, setHeroHtml] = useState<string | null>(null);

    const hasDynamic = !!heroHtml || !!heroTitle || !!heroBgUrl;

    useEffect(() => {
        if (typeof window !== "undefined" && window.SalesforceInteractions) {
            console.log("SalesforceInteractions detected:", window.SalesforceInteractions);
        }
    }, []);

    async function fetchHomeDecision(name: string) {
        if (!window.SalesforceInteractions?.mcis?.fetch) return;

        const req = { decisionName: name, items: [{ key: "home-hero" }] };
        const res: McisResponse = await window.SalesforceInteractions.mcis.fetch(req);

        const item = res?.items?.[0] ?? res;
        const html = item?.html ?? res?.html;
        const payload = item?.payload ?? item?.data ?? res?.payload ?? res?.data;

        if (html && typeof html === "string") {
            setHeroHtml(html);
            return;
        }
        if (payload && typeof payload === "object") {
            setHeroTitle(payload.title ?? payload.heading ?? null);
            setHeroBgUrl(payload.imageUrl ?? payload.image ?? null);
        }
    }

    useEffect(() => {
        if (!decisionName) return;
        fetchHomeDecision(decisionName);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [decisionName]);

    // Polling para tiempo real
    useEffect(() => {
        if (!decisionName || !pollIntervalMs) return;
        const id = window.setInterval(() => fetchHomeDecision(decisionName), pollIntervalMs);
        return () => window.clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [decisionName, pollIntervalMs]);

    // Emojis de TODAS las categorías (muro “al corte”)
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
    const emojiPool = useMemo(
        () => CATEGORY_SLUGS.map(getCategoryEmoji).filter(Boolean),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const BASE_POSITIONS = useMemo(
        () => [
            { left: "5%", top: "8%", rot: "-12deg", size: "clamp(56px, 9vw, 110px)" },
            { left: "22%", top: "-2%", rot: "10deg", size: "clamp(64px, 10vw, 128px)" },
            { left: "40%", top: "14%", rot: "-6deg", size: "clamp(52px, 8vw, 100px)" },
            { left: "62%", top: "0%", rot: "8deg", size: "clamp(66px, 10vw, 132px)" },
            { left: "82%", top: "12%", rot: "-14deg", size: "clamp(58px, 9vw, 116px)" },

            { left: "12%", top: "60%", rot: "12deg", size: "clamp(62px, 10vw, 128px)" },
            { left: "30%", top: "74%", rot: "-10deg", size: "clamp(50px, 8vw, 100px)" },
            { left: "48%", top: "56%", rot: "14deg", size: "clamp(70px, 11vw, 140px)" },
            { left: "68%", top: "70%", rot: "-8deg", size: "clamp(56px, 9vw, 112px)" },
            { left: "86%", top: "52%", rot: "6deg", size: "clamp(48px, 7.5vw, 96px)" },
        ],
        []
    );

    return (
        <Box
            role="banner"
            sx={(theme) => ({
                position: "relative",
                borderRadius: 1,
                overflow: "hidden",
                minHeight: { xs: 220, sm: 260, md: 300 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                px: 2,
                // Default: degradé secundario → lilac; Dinámico: imagen con overlay
                ...(hasDynamic
                    ? {
                        color: "common.white",
                        ...(heroBgUrl
                            ? {
                                backgroundImage: `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.35)), url(${heroBgUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }
                            : { bgcolor: "secondary.main" }),
                    }
                    : {
                        color: theme.palette.getContrastText(fallbackGradientTo),
                        background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${fallbackGradientTo} 100%)`,
                    }),
            })}
        >
            {/* HTML dinámico desde Salesforce (si la decision devuelve HTML) */}
            {heroHtml && hasDynamic ? (
                <Box
                    sx={{ position: "relative", zIndex: 1, width: "100%" }}
                    dangerouslySetInnerHTML={{ __html: heroHtml }}
                />
            ) : (
                <>
                    {/* Muro de emojis solo en default */}
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
                            {BASE_POSITIONS.map((p, i) => (
                                <Box
                                    // distribuimos los distintos emojis del pool
                                    key={`e-${i}`}
                                    component="span"
                                    sx={{
                                        position: "absolute",
                                        left: p.left,
                                        top: p.top,
                                        transform: `rotate(${p.rot})`,
                                        fontSize: p.size,
                                        opacity: 1, // pedido: opacidad total
                                        textShadow: "0 2px 8px rgba(0,0,0,.10)",
                                        userSelect: "none",
                                        filter: "saturate(115%)",
                                    }}
                                >
                                    {emojiPool[i % emojiPool.length]}
                                </Box>
                            ))}
                        </Box>
                    )}

                    {/* Texto principal */}
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
                        {heroTitle || "Bienvenido a MockMarket"}
                    </Typography>
                </>
            )}
        </Box>
    );
}
