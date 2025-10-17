// app/IdentityEvents.tsx
"use client";
import { useEffect, useRef } from "react";
import { useUser } from "@/hooks/useUser"; // <- tu hook
// ^ asegura el path correcto según tu proyecto

export default function IdentityEvents() {
    const { user } = useUser();
    const lastEmailRef = useRef<string | null>(null);

    useEffect(() => {
        let alive = true;
        let t: ReturnType<typeof setTimeout> | null = null;

        const ready = () =>
            typeof window !== "undefined" &&
            (window as any).SalesforceInteractions &&
            (window as any).SalesforceInteractions.sendEvent;

        const send = () => {
            if (!alive) return;
            if (!ready()) { t = setTimeout(send, 40); return; }

            const SI = (window as any).SalesforceInteractions;

            // Evitar spam: si el email no cambió y ya enviamos, no re-emitimos
            const email = user?.email?.trim() || null;
            if (email && lastEmailRef.current === email) return;

            // 1) identity
            SI.sendEvent({
                user: {
                    attributes: {
                        eventType: "identity",
                        firstName: user?.firstName || undefined,
                        lastName: user?.lastName || undefined,
                        email: email || undefined,
                        // convención 1/0 como en tu ejemplo:
                        isAnonymous: email ? 0 : 1,
                        // opcional: fecha de nacimiento si la guardás (ISO yyyy-mm-dd)
                        dob: user?.dob || undefined,
                    },
                },
            });

            // 2) contactPointEmail (solo si tenemos email)
            if (email) {
                SI.sendEvent({
                    user: {
                        attributes: {
                            eventType: "contactPointEmail",
                            email,
                        },
                    },
                });
            }

            lastEmailRef.current = email;
        };

        send();
        return () => { alive = false; if (t) clearTimeout(t); };
    }, [user?.email, user?.firstName, user?.lastName, user?.dob]);

    return null;
}
