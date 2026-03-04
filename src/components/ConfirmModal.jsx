import React from 'react';

const MONTH_NAMES_SHORT = [
  '', 'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'
];

/**
 * Modal de confirmación estilo periódico.
 */
const ConfirmModal = ({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  // Get in-game date for newspaper dateline if available
  const now = new Date();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(26,26,26,0.72)',
        backdropFilter: 'blur(2px)',
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#faf6ed',
          border: '1px solid #c8b890',
          borderTop: '5px solid #1a1a1a',
          maxWidth: '400px',
          width: '90%',
          fontFamily: "'Libre Baskerville', Georgia, serif",
          animation: 'slideUp 0.18s ease',
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header rule */}
        <div style={{
          background: '#1a1a1a',
          color: '#faf6ed',
          padding: '10px 20px',
          fontFamily: "'Playfair Display', 'Times New Roman', serif",
          fontWeight: 900,
          fontSize: '0.72rem',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>Wrestling Observer</span>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', color: '#faf6ed', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px' }}>
          {/* Double rule */}
          <div style={{ borderTop: '3px double #1a1a1a', marginBottom: '16px' }} />

          {/* Title as headline */}
          <div style={{
            fontFamily: "'Playfair Display', 'Times New Roman', serif",
            fontWeight: 900,
            fontSize: '1.4rem',
            lineHeight: 1.15,
            color: '#1a1a1a',
            marginBottom: '10px',
          }}>
            {title}
          </div>

          {message && (
            <p style={{
              fontFamily: "'Libre Baskerville', Georgia, serif",
              fontSize: '0.88rem',
              color: '#555',
              marginBottom: '20px',
              lineHeight: 1.6,
            }}>
              {message}
            </p>
          )}

          <div style={{ borderTop: '1px solid #c8b890', paddingTop: '16px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={onCancel}
              style={{
                background: 'transparent',
                border: '1.5px solid #1a1a1a',
                color: '#1a1a1a',
                padding: '7px 20px',
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              style={{
                background: '#1a1a1a',
                border: '1.5px solid #1a1a1a',
                color: '#faf6ed',
                padding: '7px 20px',
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
