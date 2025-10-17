"use client";
import { useEffect } from "react";

type Category = { id: number; name: string; slug: string };
type Product = {
    id: string;
    name: string;
    brand: string | null;
    price: number | null;
    currency: string;
    image: string | null;
    category?: Category | null;
};

export default function ProductViewEvent({ product }: { product: Product }) {
    useEffect(() => {
        let alive = true;
        let t: ReturnType<typeof setTimeout> | null = null;

        const init = () => {
            const SI = (window as any).SalesforceInteractions;
            if (!alive) return;
            if (!SI?.sendEvent) { t = setTimeout(init, 40); return; }

            // Usar el enum si existe; si no, caer al string
            const name =
                SI?.CatalogObjectInteractionName?.ViewCatalogObject ??
                "View Catalog Object";

            SI.sendEvent({
                interaction: {
                    name,
                    catalogObject: {
                        type: "Product",
                        id: product.id,
                    },
                },
            });
        };

        init();
        return () => { alive = false; if (t) clearTimeout(t); };
    }, [product.id]); // se dispara al cambiar de producto (navegación interna)

    return null;
}
