// app/SfInit.tsx
"use client";
import { useEffect } from "react";

export default function SfInit() {
    useEffect(() => {
        let alive = true;
        let t: ReturnType<typeof setTimeout> | null = null;

        const init = () => {
            const SI = (window as any).SalesforceInteractions;
            if (!alive) return;
            if (!SI) { t = setTimeout(init, 40); return; }

            SI.init();

            // Consent (ajustá según tu CMP)
            SI.Consent?.set?.({ web: { consent: "OptIn" } });

            // Logs (número o string, según tu versión)
            SI.setLoggingLevel?.(4); // o "debug"
        };

        init();
        return () => { alive = false; if (t) clearTimeout(t); };
    }, []);

    return null;
}
