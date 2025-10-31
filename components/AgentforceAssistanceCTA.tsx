'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  message?: string;
  offsetY?: number;     // extra hacia arriba
  offsetX?: number;     // extra hacia la izquierda
  zIndex?: number;
  rememberDismissDays?: number;
  chatButtonSelector?: string;
  bgBase?: string;      // ej: 'rgb(156, 39, 176)'
  bgTo?: string;        // ej: '#CDBDFF'
  emojis?: string[];    // decorativos “al corte”
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
  const [pos, setPos] = useState<{ right: number; bottom: number }>({ right: 30 + offsetX, bottom: 25 + offsetY });
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const intRef = useRef<number | null>(null);
  const moRef = useRef<MutationObserver | null>(null);

  // Lee bottom/right REALES del botón (CSS computed), evita flicker.
  const measureByCSS = (btn: HTMLElement) => {
    const cs = getComputedStyle(btn);
    const right = parseFloat(cs.right || '30');
    const bottom = parseFloat(cs.bottom || '25');
    setPos(prev => {
      const nr = { right: Math.max(right + offsetX, 0), bottom: Math.max(bottom + offsetY, 0) };
      return (prev.right !== nr.right || prev.bottom !== nr.bottom) ? nr : prev;
    });
  };

  useEffect(() => {
    // respetar “recordar cierre”
    if (rememberDismissDays > 0) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && Date.now() - Number(raw) < rememberDismissDays * 864e5) return;
    }

    const findBtn = () => {
      const btn = document.querySelector(chatButtonSelector) as HTMLButtonElement | null;
      if (!btn) return false;
      btnRef.current = btn;
      measureByCSS(btn);
      setVisible(true);
      return true;
    };

    if (!findBtn()) {
      // observa DOM hasta que aparezca
      const mo = new MutationObserver(() => {
        if (findBtn()) mo.disconnect();
      });
      mo.observe(document.documentElement, { childList: true, subtree: true });
      moRef.current = mo;
    }

    // re-medición estable
    const tick = () => {
      const b = btnRef.current;
      if (b) measureByCSS(b);
    };
    intRef.current = window.setInterval(tick, 500);
    window.addEventListener('resize', tick);

    return () => {
      if (intRef.current) clearInterval(intRef.current);
      window.removeEventListener('resize', tick);
      moRef.current?.disconnect();
    };
  }, [chatButtonSelector, offsetX, offsetY, rememberDismissDays]);

  const handleOpen = () => {
    btnRef.current?.click();
    setVisible(false);
    if (rememberDismissDays > 0) localStorage.setItem(STORAGE_KEY, String(Date.now()));
  };

  const handleDismiss = () => {
    setVisible(false);
    if (rememberDismissDays > 0) localStorage.setItem(STORAGE_KEY, String(Date.now()));
  };

  if (!visible) return null;

  return (
    <>
      <div
        role="dialog"
        aria-live="polite"
        aria-label="Asistente virtual disponible"
        className="agentforce-cta"
        style={{
          right: `${pos.right}px`,
          bottom: `${pos.bottom}px`,
          zIndex,
          ['--af-bg-base' as any]: bgBase,
          ['--af-bg-to' as any]: bgTo,
        }}
      >
        <div className="agentforce-cta__bubble" onClick={handleOpen}>
          {/* Emojis “al corte” DENTRO de la burbuja, detrás del texto */}
          <span className="emoji emoji--tl" aria-hidden>{emojis[0 % emojis.length]}</span>
          <span className="emoji emoji--tr" aria-hidden>{emojis[1 % emojis.length]}</span>
          <span className="emoji emoji--bl" aria-hidden>{emojis[2 % emojis.length]}</span>
          <span className="emoji emoji--br" aria-hidden>{emojis[3 % emojis.length]}</span>

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
          animation: af-in 220ms ease-out;
          overflow: visible;
          isolation: isolate; /* stacking propio */
        }

        /* Burbuja con degradé violeta */
        .agentforce-cta__bubble {
          max-width: min(78vw, 420px);
          background: linear-gradient(135deg, var(--af-bg-base) 0%, var(--af-bg-to) 100%);
          color: #fff;
          border-radius: 16px;
          padding: 16px 20px;
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28);
          cursor: pointer;
          line-height: 1.3;
          font-size: 17px;     /* más grande */
          font-weight: 800;    /* más negrita */
          border: 1px solid rgba(255, 255, 255, 0.12);
          position: relative;   /* para posicionar emojis */
          overflow: visible;    /* deja asomar los emojis */
          z-index: 2;
        }
        .agentforce-cta__bubble:hover { filter: brightness(1.05); }

        .agentforce-cta__msg {
          display: inline-block;
          user-select: none;
          position: relative;
          z-index: 3;  /* texto por encima de los emojis */
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

        /* Emojis decorativos — detrás del texto pero dentro de la burbuja */
        .emoji {
          position: absolute;
          font-size: clamp(28px, 6.5vw, 40px);
          user-select: none;
          text-shadow: 0 2px 10px rgba(0,0,0,.18);
          filter: saturate(115%);
          pointer-events: none;
          z-index: 1;   /* debajo del texto, encima del fondo */
        }
        .emoji--tl { left: -14px; top: -14px; transform: rotate(-12deg); }
        .emoji--tr { right: 12px; top: -18px; transform: rotate(9deg); }
        .emoji--bl { left: -10px; bottom: -16px; transform: rotate(12deg); }
        .emoji--br { right: -8px; bottom: -12px; transform: rotate(-8deg); }

        @keyframes af-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 480px) {
          .agentforce-cta__bubble { max-width: 86vw; font-size: 16px; }
          .emoji { font-size: clamp(24px, 8vw, 36px); }
        }
      `}</style>
    </>
  );
}
