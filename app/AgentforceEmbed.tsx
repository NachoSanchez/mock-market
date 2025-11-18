'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { useUser } from '@/hooks/useUser';

declare global {
    interface Window {
        embeddedservice_bootstrap?: {
            settings: any;
            init: (
                orgId: string,
                deployment: string,
                snippetUrl: string,
                options?: { scrt2URL?: string }
            ) => void;
            prechatAPI?: {
                setHiddenPrechatFields: (
                    fields: Record<string, { value: string; isEditableByEndUser: boolean }>
                ) => void;
                setVisiblePrechatFields?: (
                    fields: Record<string, { value: string; isEditableByEndUser: boolean }>
                ) => void;
            };
        };
    }
}

const ORG_ID = '00Dal00000YAcer';
const DEPLOYMENT = 'Hackforce_Customer_Service';
const SNIPPET_URL = 'https://devsunitedcore.my.site.com/ESWHackforceCustomerSer1763479558805';
const SCRT_URL = 'https://devsunitedcore.my.salesforce-scrt.com';
const BOOTSTRAP_SRC = 'https://devsunitedcore.my.site.com/ESWHackforceCustomerSer1763479558805/assets/js/bootstrap.min.js';

// Equivalente a tu function initEmbeddedMessaging() del snippet
function initEmbeddedMessaging() {
    try {
        const esb = window.embeddedservice_bootstrap;
        if (!esb) {
            console.error('[Agentforce] embeddedservice_bootstrap no está disponible todavía');
            return;
        }

        esb.settings.language = 'es_MX'; // mismo que el snippet

        esb.init(ORG_ID, DEPLOYMENT, SNIPPET_URL, {
            scrt2URL: SCRT_URL,
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

            const esb = window.embeddedservice_bootstrap;
            if (!esb?.prechatAPI) return;

            const fields: Record<
                string,
                { value: string; isEditableByEndUser: boolean }
            > = {};

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
        window.addEventListener('onEmbeddedMessagingReady', onReady);

        // Por si ya estaba listo (navegación interna)
        if (window.embeddedservice_bootstrap?.prechatAPI) {
            applyPrechatFromUser();
        }

        return () => {
            window.removeEventListener('onEmbeddedMessagingReady', onReady);
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
                    initEmbeddedMessaging();
                }}
            />
        </>
    );
}
