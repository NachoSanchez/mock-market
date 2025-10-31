'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
    /** Texto a mostrar en el CTA */
    message?: string;
    /** Offset respecto al botón nativo del chat */
    offsetY?: number; // px hacia arriba
    offsetX?: number; // px hacia la izquierda (positivo = más a la izquierda)
    /** Z-index del CTA */
    zIndex?: number;
    /** Recordar cierre del CTA en localStorage (en días). Usa 0 para no recordar. */
    rememberDismissDays?: number;
    /** Id del botón nativo (por si cambia en el futuro) */
    chatButtonSelector?: string;
};

const STORAGE_KEY = 'agentforceCtaDismissedAt';

export default function AgentforceAssistantCTA({
    message = 'Hola, soy tu asistente virtual. ¡Hablame cuando me necesites!',
    offsetY = 84,
    offsetX = 0,
    zIndex = 9999,
    rememberDismissDays = 7,
    chatButtonSelector = '#embeddedMessagingConversationButton',
}: Props) {
    const [visible, setVisible] = useState(false);
    const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const observerRef = useRef<MutationObserver | null>(null);
    const resizeObsRef = useRef<ResizeObserver | null>(null);

    // Comprueba si debemos mantener oculto por recordatorio de cierre
    useEffect(() => {
        if (rememberDismissDays > 0) {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const closedAt = Number(raw);
                const ms = rememberDismissDays * 24 * 60 * 60 * 1000;
                if (Date.now() - closedAt < ms) return; // sigue recordando el cierre
            }
        }
        // Intento inmediato
        const tryFind = () => {
            const btn = document.querySelector(chatButtonSelector) as HTMLButtonElement | null;
            if (btn) {
                buttonRef.current = btn;
                setButtonRect(btn.getBoundingClientRect());
                setVisible(true);

                // Observa cambios de tamaño/posición del botón (p.ej. cambios de viewport)
                if ('ResizeObserver' in window) {
                    const ro = new ResizeObserver(() => {
                        setButtonRect(btn.getBoundingClientRect());
                    });
                    ro.observe(btn);
                    resizeObsRef.current = ro;
                }

                // También actualiza en resize/scroll
                const onWinChange = () => setButtonRect(btn.getBoundingClientRect());
                window.addEventListener('resize', onWinChange);
                window.addEventListener('scroll', onWinChange, true);

                return () => {
                    window.removeEventListener('resize', onWinChange);
                    window.removeEventListener('scroll', onWinChange, true);
                    resizeObsRef.current?.disconnect();
                };
            }
            return undefined;
        };

        const cleanup = tryFind();
        if (cleanup) return cleanup;

        // Si aún no existe, observa el DOM hasta que aparezca
        const mo = new MutationObserver(() => {
            const done = tryFind();
            if (done) {
                observerRef.current?.disconnect();
            }
        });
        mo.observe(document.documentElement, { childList: true, subtree: true });
        observerRef.current = mo;

        return () => {
            observerRef.current?.disconnect();
            resizeObsRef.current?.disconnect();
        };
    }, [chatButtonSelector, rememberDismissDays]);

    const handleOpen = () => {
        const btn = buttonRef.current;
        if (btn) {
            btn.click();
            // oculta el CTA al abrir el chat (evita duplicación de foco visual)
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

    // Calcula posición anclada a la esquina inf. derecha (como el botón nativo)
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
                }}
            >
                <div className="agentforce-cta__bubble" onClick={handleOpen}>
                    <span className="agentforce-cta__msg">{message}</span>
                </div>
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
        }

        .agentforce-cta__bubble {
          max-width: min(72vw, 340px);
          background: #111;         /* combina con --eswButtonColor por defecto */
          color: #fff;
          border-radius: 14px;
          padding: 10px 14px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
          cursor: pointer;
          line-height: 1.25;
          font-size: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .agentforce-cta__bubble:hover {
          filter: brightness(1.05);
        }

        .agentforce-cta__msg {
          display: inline-block;
          user-select: none;
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
        }

        .agentforce-cta__close:hover {
          background: #f3f3f3;
        }

        @keyframes af-slide-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 480px) {
          .agentforce-cta__bubble {
            max-width: 82vw;
            font-size: 13px;
          }
        }
      `}</style>
        </>
    );
}
