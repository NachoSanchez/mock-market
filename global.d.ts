declare global {
    interface Window {
        initEmbeddedMessaging?: () => void;
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
export { };
