'use client';

import Script from 'next/script';

declare global {
    interface Window {
        initEmbeddedMessaging?: () => void;
        embeddedservice_bootstrap?: any;
    }
}

export default function AgentforceEmbed() {
    return (
        <>
            {/* Define init en window */}
            <Script id="agentforce-init" strategy="afterInteractive">
                {`
          window.initEmbeddedMessaging = function () {
            try {
              embeddedservice_bootstrap.settings.language = 'es_MX';
              embeddedservice_bootstrap.init(
                '00Dal00000YAcer',
                'Hackforce_Customer_Support',
                'https://devsunitedcore.my.site.com/ESWHackforceCustomerSup1761334159792',
                { scrt2URL: 'https://devsunitedcore.my.salesforce-scrt.com' }
              );
            } catch (err) {
              console.error('Error loading Embedded Messaging: ', err);
            }
          };
        `}
            </Script>

            {/* Carga el bootstrap y llama a init al terminar */}
            <Script
                id="agentforce-bootstrap"
                src="https://devsunitedcore.my.site.com/ESWHackforceCustomerSup1761334159792/assets/js/bootstrap.min.js"
                strategy="afterInteractive"
                onLoad={() => {
                    if (typeof window !== 'undefined' && window.initEmbeddedMessaging) {
                        window.initEmbeddedMessaging();
                    }
                }}
            />
        </>
    );
}
