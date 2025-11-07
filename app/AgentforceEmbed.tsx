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
                setHiddenPrechatFields: (fields: Record<string, { value: string; isEditableByEndUser: boolean }>) => void;
                setVisiblePrechatFields?: (fields: Record<string, { value: string; isEditableByEndUser: boolean }>) => void;
            };
        };
    }
}

const ORG_ID = "00Dal00000YAcer";
const DEPLOYMENT = "Hackforce_Customer_Support'";
const SNIPPET_URL = "https://devsunitedcore.my.site.com/ESWHackforceCustomerSup1761334159792";
const SCRT_URL = 'https://devsunitedcore.my.salesforce-scrt.com';
const BOOTSTRAP_SRC = `${SNIPPET_URL}/assets/js/bootstrap.min.js`;

export default function AgentforceEmbed() {
    const { user } = useUser();

    // Aplica los datos del usuario al Pre-Chat API cuando el widget esté listo
    useEffect(() => {
        const applyPrechatFromUser = () => {
            if (!user) return;
            const esb = window.embeddedservice_bootstrap;
            if (!esb?.prechatAPI) return;

            const fields: Record<string, { value: string; isEditableByEndUser: boolean }> = {};
            if (user.firstName) fields._firstName = { value: user.firstName, isEditableByEndUser: false };
            if (user.lastName) fields._lastName = { value: user.lastName, isEditableByEndUser: false };
            if (user.email) fields._email = { value: user.email, isEditableByEndUser: false };

            if (Object.keys(fields).length > 0) {
                esb.prechatAPI.setHiddenPrechatFields(fields);
            }
        };

        const onReady = () => applyPrechatFromUser();
        window.addEventListener('onEmbeddedMessagingReady', onReady);

        // Si ya estaba listo al montar (navegación interna)
        if (window.embeddedservice_bootstrap) applyPrechatFromUser();

        return () => {
            window.removeEventListener('onEmbeddedMessagingReady', onReady);
        };
    }, [user]);

    return (
        <>
            {/* Bootstrap del widget */}
            <Script id="agentforce-bootstrap" src={BOOTSTRAP_SRC} strategy="afterInteractive" />

            {/* Init del widget */}
            <Script id="agentforce-init" strategy="afterInteractive">
                {`
          (function(){
            try {
              embeddedservice_bootstrap.settings.language = 'es_MX';
              embeddedservice_bootstrap.init(
                '${ORG_ID}',
                '${DEPLOYMENT}',
                '${SNIPPET_URL}',
                { scrt2URL: '${SCRT_URL}' }
              );
            } catch (err) {
              console.error('[Agentforce] Error loading Embedded Messaging:', err);
            }
          })();
        `}
            </Script>
        </>
    );
}
