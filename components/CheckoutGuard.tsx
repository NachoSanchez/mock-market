// components/CheckoutGuard.tsx
"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useCart } from "@/hooks/useCart";

const CART_KEY = "mm_cart";

export default function CheckoutGuard({ children }: PropsWithChildren) {
    const { cart } = useCart();
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [allowed, setAllowed] = useState(false);

    // 1) Decidir con el carrito PERSISTIDO (evita el redirect por hidratación tardía)
    useEffect(() => {
        try {
            const raw = localStorage.getItem(CART_KEY);
            const persisted = raw ? JSON.parse(raw) : null;
            const hasItems = !!persisted?.lineItems?.length;
            if (hasItems) {
                setAllowed(true);
            } else {
                router.replace("/");
                return; // no marcamos ready: mostramos loader un instante hasta que redirija
            }
        } catch {
            router.replace("/");
            return;
        }
        setReady(true);
    }, [router]);

    useEffect(() => {
        if (!ready) return;
        if (cart.lineItems.length === 0) {
            router.replace("/");
        }
    }, [ready, cart.lineItems.length, router]);

    if (!allowed) {
        return (
            <Box sx={{ minHeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Redirigiendo…</Typography>
            </Box>
        );
    }

    return <>{children}</>;
}
