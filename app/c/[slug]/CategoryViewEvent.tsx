// app/c/[slug]/CategoryViewEvent.tsx
"use client";
import { useEffect } from "react";

type Category = { id: number | string; name?: string | null; slug?: string | null };

export default function CategoryViewEvent({ category }: { category: Category }) {
    useEffect(() => {
        let alive = true;
        let t: ReturnType<typeof setTimeout> | null = null;

        const init = () => {
            const SI = (window as any).SalesforceInteractions;
            if (!alive) return;
            if (!SI?.sendEvent) { t = setTimeout(init, 40); return; }

            const name =
                SI?.CatalogObjectInteractionName?.ViewCatalogObject ?? "View Catalog Object";

            SI.sendEvent({
                interaction: {
                    name,
                    catalogObject: {
                        type: "Category",
                        // usá el slug si es estable; si preferís numérico, usa String(category.id)
                        id: category?.slug || String(category?.id),
                        attributes: {
                            name: category?.name ?? undefined,
                            url: typeof location !== "undefined" ? location.href : undefined,
                        },
                    },
                },
            });
        };

        init();
        return () => { alive = false; if (t) clearTimeout(t); };
    }, [category?.id, category?.slug]);

    return null;
}
