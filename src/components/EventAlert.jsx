import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';

/**
 * Newspaper front-page flash when a title changes hands or a tournament ends.
 * Appears for 5 seconds and can be dismissed by click.
 * Styled like the MonthlyNewsModal — paper background, ink text, Playfair Display.
 */
const EventAlert = () => {
  const { state, dispatch } = useGame();
  const { recentEvent } = state;

  useEffect(() => {
    if (!recentEvent) return;
    const timer = setTimeout(() => dispatch({ type: 'CLEAR_RECENT_EVENT' }), 5000);
    return () => clearTimeout(timer);
  }, [recentEvent, dispatch]);

  if (!recentEvent) return null;

  const isTournament = recentEvent.type === 'tournament';

  return (
    <>
      <style>{`
        @keyframes alertSlide {
          from { opacity: 0; transform: translateX(-50%) translateY(-24px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          top: '76px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 4000,
          animation: 'alertSlide 0.35s ease',
          minWidth: '340px',
          maxWidth: '500px',
          width: '90vw',
          cursor: 'pointer',
          /* Paper drop shadow */
          boxShadow: '0 6px 32px rgba(0,0,0,0.28)',
        }}
        onClick={() => dispatch({ type: 'CLEAR_RECENT_EVENT' })}
      >
        {/* Top rule */}
        <div style={{ height: '4px', background: 'var(--ink)' }} />

        <div style={{
          background: 'var(--paper-2)',
          border: '1px solid #c8b890',
          borderTop: 'none',
          padding: '14px 20px 16px',
          fontFamily: 'var(--serif)',
        }}>
          {/* Section label */}
          <div style={{
            fontFamily: 'var(--display)',
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '0.62rem',
            letterSpacing: '0.16em',
            color: 'var(--ink-3)',
            marginBottom: '5px',
          }}>
            {isTournament ? 'Final de Torneo' : 'Resultado de Título'}
          </div>

          {/* Headline */}
          <div style={{
            fontFamily: 'var(--display)',
            fontWeight: 900,
            fontSize: '1.05rem',
            lineHeight: 1.2,
            color: 'var(--ink)',
          }}>
            {recentEvent.message}
          </div>

          {/* Dismiss hint */}
          <div style={{
            fontFamily: 'var(--display)',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            marginTop: '8px',
            textAlign: 'right',
          }}>
            clic para cerrar
          </div>
        </div>

        {/* Bottom rule */}
        <div style={{ height: '2px', background: 'var(--ink)' }} />
      </div>
    </>
  );
};

export default EventAlert;
