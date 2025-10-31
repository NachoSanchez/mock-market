'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
    message?: string;
    offsetY?: number; // px hacia arriba
    offsetX?: number; // px hacia la izquierda
    zIndex?: number;
    rememberDismissDays?: number;
    chatButtonSelector?: string;
    bgBase?: string; // ej: 'rgb(156, 39, 176)'
    bgTo?: string;   // ej: '#CDBDFF'
    emojis?: string[];
};

const STORAGE_KEY = 'agentforceCtaDismissedAt';

export default function AgentforceAssistantCTA({
    message = 'Hola, soy tu asistente virtual. ¡Hablame cuando me necesites!',
    offsetY = 84,
    offsetX = 0,
    zIndex = 2147483000,
    rememberDismissDays = 7,
    chatButtonSelector = '#embeddedMessagingConversationButton',
    bgBase = 'rgb(156, 39, 176)',
    bgTo = '#CDBDFF',
    emojis = ['🛒', '🥐', '🧃', '🍫'],
}: Props) {
    const [visible, setVisible] = useState(false);
    const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const observerRef = useRef<MutationObserver | null>(null);
    const resizeObsRef = useRef<ResizeObserver | null>(null);
    const rafIdRef = useRef<number | null>(null);

    // helper: setRect solo si cambió (evita re-renders innecesarios/flicker)
    const setRectIfChanged = (rect: DOMRect) => {
        setButtonRect(prev => {
            if (!prev) return rect;
            const same =
                Math.round(prev.top) === Math.round(rect.top) &&
                Math.round(prev.left) === Math.round(rect.left) &&
                Math.round(prev.right) === Math.round(rect.right) &&
                Math.round(prev.bottom) === Math.round(rect.bottom);
            return same ? prev : rect;
        });
    };

    useEffect(() => {
        // respeta "recordar cierre"
        if (rememberDismissDays > 0) {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const closedAt = Number(raw);
                const ms = rememberDismissDays * 24 * 60 * 60 * 1000;
                if (Date.now() - closedAt < ms) return; // mantener oculto
            }
        }

        const scheduleMeasure = (btn: HTMLElement) => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = requestAnimationFrame(() => {
                setRectIfChanged(btn.getBoundingClientRect());
            });
        };

        const tryFind = () => {
            const btn = document.querySelector(chatButtonSelector) as HTMLButtonElement | null;
            if (btn) {
                buttonRef.current = btn;
                scheduleMeasure(btn);
                setVisible(true);

                // Observa cambios de tamaño/posición
                if ('ResizeObserver' in window) {
                    const ro = new ResizeObserver(() => scheduleMeasure(btn));
                    ro.observe(btn);
                    resizeObsRef.current = ro;
                }

                const onWinChange = () => scheduleMeasure(btn);
                window.addEventListener('resize', onWinChange);
                window.addEventListener('scroll', onWinChange, { capture: true, passive: true });

                return () => {
                    window.removeEventListener('resize', onWinChange);
                    window.removeEventListener('scroll', onWinChange, { capture: true } as any);
                    resizeObsRef.current?.disconnect();
                    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
                };
            }
            return undefined;
        };

        const cleanup = tryFind();
        if (cleanup) return cleanup;

        // Si aún no existe el botón, observa el DOM hasta que aparezca
        const mo = new MutationObserver(() => {
            const done = tryFind();
            if (done) observerRef.current?.disconnect();
        });
        mo.observe(document.documentElement, { childList: true, subtree: true });
        observerRef.current = mo;

        return () => {
            observerRef.current?.disconnect();
            resizeObsRef.current?.disconnect();
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        };
    }, [chatButtonSelector, rememberDismissDays]);

    const handleOpen = () => {
        const btn = buttonRef.current;
        if (btn) {
            btn.click();
            setVisible(false);
            if (rememberDismissDays > 0) {
                localStorage.setItem(STORAGE_KEY, String(Date.now()));
            }
        }
    };

    const handleDismiss = () => {
        setVisible(false);
        if (rememberDismissDays > 0) {
            localStorage.setItem(STORAGE_KEY, String(Date.now()));
        }
    };

    if (!visible || !buttonRect) return null;

    // anclado a la esquina inferior derecha (igual que el botón nativo)
    const right = Math.max(window.innerWidth - buttonRect.right + offsetX, 0);
    const bottom = Math.max(window.innerHeight - buttonRect.bottom + offsetY, 0);

    return (
        <>
            <div
                role="dialog"
                aria-live="polite"
                aria-label="Asistente virtual disponible"
                className="agentforce-cta"
                style={{
                    right: `${right}px`,
                    bottom: `${bottom}px`,
                    zIndex,
                    ['--af-bg-base' as any]: bgBase,
                    ['--af-bg-to' as any]: bgTo,
                }}
            >
                {/* Emojis “al corte” (debajo de la burbuja/texto) */}
                <span className="emoji emoji--tl" aria-hidden>{emojis[0 % emojis.length]}</span>
                <span className="emoji emoji--tr" aria-hidden>{emojis[1 % emojis.length]}</span>
                <span className="emoji emoji--bl" aria-hidden>{emojis[2 % emojis.length]}</span>
                <span className="emoji emoji--br" aria-hidden>{emojis[3 % emojis.length]}</span>

                {/* Burbuja CTA */}
                <div className="agentforce-cta__bubble" onClick={handleOpen}>
                    <span className="agentforce-cta__msg">{message}</span>
                </div>

                {/* Cerrar */}
                <button
                    type="button"
                    className="agentforce-cta__close"
                    aria-label="Cerrar mensaje del asistente"
                    onClick={handleDismiss}
                >
                    ×
                </button>
            </div>

            <style jsx>{`
        .agentforce-cta {
          position: fixed;
          display: flex;
          align-items: center;
          gap: 8px;
          pointer-events: auto;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, 'Helvetica Neue', Arial, 'Noto Sans',
            'Apple Color Emoji', 'Segoe UI Emoji';
          animation: af-slide-in 240ms ease-out;
          overflow: visible;
          isolation: isolate; /* stacking context limpio */
        }

        /* Burbuja con degradé violeta */
        .agentforce-cta__bubble {
          max-width: min(76vw, 400px);
          background: linear-gradient(135deg, var(--af-bg-base) 0%, var(--af-bg-to) 100%);
          color: #fff;
          border-radius: 16px;
          padding: 14px 18px;
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28);
          cursor: pointer;
          line-height: 1.3;
          font-size: 16px;         /* ⬆️ más grande */
          font-weight: 700;        /* ⬆️ negrita */
          border: 1px solid rgba(255, 255, 255, 0.12);
          position: relative;
          z-index: 2;              /* por encima de los emojis */
        }

        .agentforce-cta__bubble:hover { filter: brightness(1.05); }

        .agentforce-cta__msg {
          display: inline-block;
          user-select: none;
          position: relative;
          z-index: 3;              /* texto sobre todo */
        }

        .agentforce-cta__close {
          appearance: none;
          background: #fff;
          color: #111;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 999px;
          width: 28px;
          height: 28px;
          line-height: 26px;
          text-align: center;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
          z-index: 4;
        }
        .agentforce-cta__close:hover { background: #f3f3f3; }

        /* Emojis decorativos “al corte” — detrás de la burbuja */
        .emoji {
          position: absolute;
          font-size: clamp(28px, 6.5vw, 40px);
          user-select: none;
          text-shadow: 0 2px 10px rgba(0,0,0,.18);
          filter: saturate(115%);
          pointer-events: none;
          z-index: 1;              /* debajo de la burbuja y del texto */
        }
        .emoji--tl { left: -14px; top: -14px; transform: rotate(-12deg); }
        .emoji--tr { right: 52px; top: -18px; transform: rotate(9deg); }
        .emoji--bl { left: -10px; bottom: -16px; transform: rotate(12deg); }
        .emoji--br { right: 36px; bottom: -12px; transform: rotate(-8deg); }

        @keyframes af-slide-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 480px) {
          .agentforce-cta__bubble { max-width: 84vw; font-size: 15px; }
          .emoji { font-size: clamp(24px, 8vw, 36px); }
        }
      `}</style>
        </>
    );
}
