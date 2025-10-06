"use client";

import * as React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Stack, Typography, Button, Divider, Avatar
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useCart, type Cart, type LineItem } from "@/hooks/useCart";
import { useUser } from "@/hooks/useUser";

type StoredOrder = Cart & { orderId: string };

export default function ThankYouModal({
    openInitially = false,
    orderId,
}: {
    openInitially?: boolean;
    orderId: string | null;
}) {
    const { clear } = useCart();
    const { user } = useUser();
    const router = useRouter();

    const [open, setOpen] = React.useState(false);
    const [order, setOrder] = React.useState<StoredOrder | null>(null);

    React.useEffect(() => {
        if (!openInitially || !orderId) return;
        try {
            const raw = sessionStorage.getItem(`mm_last_order_${orderId}`);
            if (raw) setOrder(JSON.parse(raw) as StoredOrder);
        } catch { }
        setOpen(true);
    }, [openInitially, orderId]);

    React.useEffect(() => clear(), []);

    const handleClose = () => {
        setOpen(false);
        try {
            if (orderId) sessionStorage.removeItem(`mm_last_order_${orderId}`);
        } catch { }
        clear(); // idempotente, por si quedó algo
        const url = new URL(window.location.href);
        url.searchParams.delete("thanks");
        router.replace(url.pathname + (url.search ? `?${url.searchParams.toString()}` : ""));
    };

    if (!open) return null;

    // helpers
    const lineItems: LineItem[] = order?.lineItems ?? [];
    const currency = lineItems[0]?.product.currency ?? "ARS";
    const total = lineItems.reduce((acc, li) => acc + (li.product.price ?? 0) * li.quantity, 0);

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: (theme) => ({
                    bgcolor: "background.paper",
                    //color: "primary.contrastText",
                    borderRadius: 1,
                    overflow: "hidden",
                    boxShadow: theme.shadows[24],
                }),
            }}
        >
            <DialogTitle sx={{ fontWeight: 800, display: "flex", flexDirection: "column" }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>¡Gracias por tu compra! 🎉</Typography>
                {order?.orderId && (
                    <Typography variant="subtitle2" sx={{ opacity: 0.9, mt: 0.5 }}>
                        Pedido <b>#{order.orderId}</b>
                    </Typography>
                )}
            </DialogTitle>

            <DialogContent dividers sx={{ borderColor: "rgba(255,255,255,0.15)" }}>
                <Typography sx={{ mb: 2 }}>
                    Tu compra estará llegando a la dirección en las próximas horas. Vamos a estar notificándote a{" "}
                    <b>{user?.email || "tu email"}</b> con más detalles.
                </Typography>

                <Box
                    sx={{
                        mt: 1,
                        maxHeight: { xs: '32vh', sm: '40vh' }, // altura razonable
                        overflowY: 'auto',
                        pr: 1, // un poco de espacio para que no tape la barra
                        // opcional: scroll suave y scrollbar sutil
                        scrollbarWidth: 'thin',
                        '&::-webkit-scrollbar': { width: 8 },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: (t) => t.palette.action.hover,
                            borderRadius: 8,
                        },
                    }}
                >
                    <Stack spacing={1.5} sx={{ mt: 1 }}>
                        {lineItems.map((li) => {
                            const p = li.product;
                            const sub = (p.price ?? 0) * li.quantity;
                            return (
                                <Box key={li.itemId}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar
                                            variant="rounded"
                                            src={p.image || undefined}
                                            alt={p.name}
                                            sx={{ width: 56, height: 56, bgcolor: "rgba(255,255,255,0.15)" }}
                                        />
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography noWrap fontWeight={700}>{p.name}</Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                                Cantidad: {li.quantity}
                                            </Typography>
                                        </Box>
                                        <Typography fontWeight={700}>
                                            $ {sub.toFixed(2)}
                                        </Typography>
                                    </Stack>
                                    <Divider sx={{ my: 1.5, borderColor: "rgba(255,255,255,0.12)" }} />
                                </Box>
                            );
                        })}
                    </Stack>
                </Box>

                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                    <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Total</Typography>
                    <Typography variant="h6" fontWeight={900}>
                         $ {total.toFixed(2)}
                    </Typography>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={handleClose}
                    variant="contained"
                    //color="secondary"
                    size="large"
                    sx={{ borderRadius: 2 }}
                >
                    Continuar Comprando
                </Button>
            </DialogActions>
        </Dialog>
    );
}
