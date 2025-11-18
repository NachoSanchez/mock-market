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

export default function AgentforceEmbed() {
    const { user } = useUser();

    // Aplica los datos del usuario al Pre-Chat API cuando el widget esté listo
    useEffect(() => {
        const applyPrechatFromUser = () => {
            if (!user) return;
            const esb = window.embeddedservice_bootstrap;
            if (!esb?.prechatAPI) return;

            const fields: Record<string, { value: string; isEditableByEndUser: boolean }> = {};
            if (user.firstName) fields.FirstName = { value: user.firstName, isEditableByEndUser: false };
            if (user.lastName) fields.LastName = { value: user.lastName, isEditableByEndUser: false };
            if (user.email) fields.Email = { value: user.email, isEditableByEndUser: false };

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
            <Script id="agentforce-bootstrap" src="https://devsunitedcore.my.site.com/ESWHackforceCustomerSer1763479558805/assets/js/bootstrap.min.js" strategy="afterInteractive" />

            {/* Init del widget */}
            <Script id="agentforce-init" strategy="afterInteractive">
                {`
            (function(){
                try {
                    embeddedservice_bootstrap.settings.language = 'es_MX';
                    embeddedservice_bootstrap.init(
                        '00Dal00000YAcer',
                        'Hackforce_Customer_Service',
                        'https://devsunitedcore.my.site.com/ESWHackforceCustomerSer1763479558805',
                        {
                            scrt2URL: 'https://devsunitedcore.my.salesforce-scrt.com'
                        }
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
