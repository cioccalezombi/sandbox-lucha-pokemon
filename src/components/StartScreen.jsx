import React from 'react';

const StartScreen = ({ onNewGame, onLoadGame, hasSave }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#faf6ed',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Libre Baskerville', Georgia, serif",
    }}>
      <div style={{ maxWidth: '520px', width: '100%', padding: '0 24px', textAlign: 'center' }}>

        {/* Top rule */}
        <div style={{ borderTop: '3px double #1a1a1a', marginBottom: '24px' }} />

        {/* Vol / edition dateline */}
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '0.72rem',
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          color: '#888',
          marginBottom: '12px',
        }}>
          Vol. I &nbsp;·&nbsp; Edición Mensual &nbsp;·&nbsp; Japón
        </div>

        {/* Masthead title */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 900,
          fontSize: 'clamp(2.4rem, 8vw, 4.2rem)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: '#1a1a1a',
          lineHeight: 1,
          margin: '0 0 6px',
        }}>
          Wrestling Observer
        </h1>

        {/* Subtitle */}
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 400,
          fontStyle: 'italic',
          fontSize: '1rem',
          color: '#555',
          marginBottom: '8px',
        }}>
          Simulador de Booking — Modo Carrera
        </div>

        {/* Double rule */}
        <div style={{ borderBottom: '3px double #1a1a1a', marginBottom: '40px' }} />

        {/* Headline */}
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: '0.68rem',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: '#888',
          marginBottom: '10px',
        }}>
          Nueva edición disponible
        </div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 900,
          fontSize: '1.5rem',
          lineHeight: 1.1,
          color: '#1a1a1a',
          marginBottom: '8px',
        }}>
          ¿Estás listo para tomar el control del booking?
        </div>
        <p style={{
          fontFamily: "'Libre Baskerville', Georgia, serif",
          fontSize: '0.88rem',
          color: '#555',
          lineHeight: 1.65,
          marginBottom: '36px',
        }}>
          Supervisá carreras, organizá shows mensuales y guiá a la próxima generación de campeones a través de los años.
        </p>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #c8b890', marginBottom: '28px' }} />

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <button
            onClick={onNewGame}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              background: '#1a1a1a',
              color: '#faf6ed',
              border: '1.5px solid #1a1a1a',
              padding: '14px 32px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Nueva Partida
          </button>

          <button
            onClick={onLoadGame}
            disabled={!hasSave}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              background: 'transparent',
              color: hasSave ? '#1a1a1a' : '#aaa',
              border: `1.5px solid ${hasSave ? '#1a1a1a' : '#ccc'}`,
              padding: '14px 32px',
              cursor: hasSave ? 'pointer' : 'not-allowed',
              width: '100%',
              opacity: hasSave ? 1 : 0.55,
            }}
          >
            Cargar Partida
            {!hasSave && (
              <div style={{ fontSize: '0.68rem', fontWeight: 400, marginTop: '2px', letterSpacing: '0.06em' }}>
                Sin guardado disponible
              </div>
            )}
          </button>
        </div>

        {/* Bottom footnote */}
        <div style={{ borderTop: '1px solid #c8b890', marginTop: '36px', paddingTop: '14px' }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.7rem', color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            La partida se guarda automáticamente en el navegador.
          </p>
        </div>

        {/* Bottom rule */}
        <div style={{ borderBottom: '3px double #1a1a1a' }} />

      </div>
    </div>
  );
};

export default StartScreen;
