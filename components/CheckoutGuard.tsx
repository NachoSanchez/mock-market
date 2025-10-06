"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useCart } from "@/hooks/useCart";

export default function CheckoutGuard({ children }: PropsWithChildren) {
    const { cart } = useCart();
    const router = useRouter();
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        if (cart.lineItems.length === 0) {
            router.replace("/");
        } else {
            setAllowed(true);
        }
    }, [cart.lineItems.length, router]);

    if (!allowed) {
        return (
            <Box sx={{ minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Redirigiendo…</Typography>
            </Box>
        );
    }

    return <>{children}</>;
}
