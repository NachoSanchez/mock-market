'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { useUser } from '@/hooks/useUser';

/* ---------- Tipos locales ---------- */

type PrechatField = {
    value: string;
    isEditableByEndUser: boolean;
};

interface EmbeddedServiceBootstrap {
    settings: any;
    init: (
        orgId: string,
        deployment: string,
        snippetUrl: string,
        options?: {
            scrt2URL?: string;
            context?: {
                Email?: string | null;
                [key: string]: unknown;
            };
        }
    ) => void;
    prechatAPI?: {
        setHiddenPrechatFields: (fields: Record<string, PrechatField>) => void;
        setVisiblePrechatFields?: (fields: Record<string, PrechatField>) => void;
    };
}

/* ---------- Constantes de configuración ---------- */

const ORG_ID = '00Dal00000YAcer';
const DEPLOYMENT = 'Hackforce_Customer_Service';
const SNIPPET_URL = 'https://devsunitedcore.my.site.com/ESWHackforceCustomerSer1763479558805';
const SCRT_URL = 'https://devsunitedcore.my.salesforce-scrt.com';
const BOOTSTRAP_SRC =
    'https://devsunitedcore.my.site.com/ESWHackforceCustomerSer1763479558805/assets/js/bootstrap.min.js';

/* ---------- Init equivalente al snippet ---------- */

function initEmbeddedMessaging(email?: string) {
    try {
        const esb = (window as any)
            .embeddedservice_bootstrap as EmbeddedServiceBootstrap | undefined;

        if (!esb) {
            console.error(
                '[Agentforce] embeddedservice_bootstrap no está disponible todavía'
            );
            return;
        }

        esb.settings.language = 'es_MX'; // mismo que el snippet

        esb.init(ORG_ID, DEPLOYMENT, SNIPPET_URL, {
            scrt2URL: SCRT_URL,
            // extendemos con context.Email para que llegue al backend de Agentforce
            context: {
                Email: email ?? undefined,
            },
        });
    } catch (err) {
        console.error('[Agentforce] Error loading Embedded Messaging: ', err);
    }
}

export default function AgentforceEmbed() {
    const { user } = useUser();

    // Aplica los datos del usuario al Pre-Chat API cuando el widget esté listo
    useEffect(() => {
        const applyPrechatFromUser = () => {
            if (!user) return;

            const esb = (window as any)
                .embeddedservice_bootstrap as EmbeddedServiceBootstrap | undefined;

            if (!esb?.prechatAPI) return;

            const fields: Record<string, PrechatField> = {};

            if (user.firstName) {
                fields.FirstName = {
                    value: user.firstName,
                    isEditableByEndUser: false,
                };
            }
            if (user.lastName) {
                fields.LastName = {
                    value: user.lastName,
                    isEditableByEndUser: false,
                };
            }
            if (user.email) {
                fields.Email = {
                    value: user.email,
                    isEditableByEndUser: false,
                };
            }

            if (Object.keys(fields).length > 0) {
                esb.prechatAPI.setHiddenPrechatFields(fields);
            }
        };

        const onReady = () => applyPrechatFromUser();

        // Evento que dispara Salesforce cuando el widget está listo
        window.addEventListener('onEmbeddedMessagingReady', onReady as EventListener);

        // Por si ya estaba listo (navegación interna)
        const esb = (window as any)
            .embeddedservice_bootstrap as EmbeddedServiceBootstrap | undefined;
        if (esb?.prechatAPI) {
            applyPrechatFromUser();
        }

        return () => {
            window.removeEventListener(
                'onEmbeddedMessagingReady',
                onReady as EventListener
            );
        };
    }, [user]);

    return (
        <>
            {/* Script de bootstrap del widget (equivalente al <script src=... onload="initEmbeddedMessaging()">) */}
            <Script
                id="agentforce-bootstrap"
                src={BOOTSTRAP_SRC}
                strategy="afterInteractive"
                onLoad={() => {
                    initEmbeddedMessaging(user?.email);
                }}
            />
        </>
    );
}
