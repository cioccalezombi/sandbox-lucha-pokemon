import React from 'react';
import { useGame, useActivePromotion, useActivePromotionConfig } from '../context/GameContext';

const MONTH_NAMES = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// Newspaper-style event configs — no emojis, no colored backgrounds
const EVENT_CONFIG = {
  leve:        { label: 'LESIÓN LEVE',          accent: '#555' },
  moderada:    { label: 'LESIÓN MODERADA',       accent: '#333' },
  grave:       { label: 'BAJA GRAVE',            accent: '#1a1a1a' },
  gravisima:   { label: 'LESIÓN CATASTRÓFICA',   accent: '#1a1a1a' },
  suspension:  { label: 'SUSPENSIÓN',            accent: '#333' },
  careerEnd:   { label: 'FIN DE CARRERA',        accent: '#1a1a1a' },
  return:      { label: 'REGRESO AL ROSTER',     accent: '#555' },
  titleVacant: { label: 'CAMPEONATO VACANTE',    accent: '#333' },
};

const S = {
  modal: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.72)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px',
  },
  paper: {
    background: '#faf6ed',
    color: '#1a1a1a',
    maxWidth: '780px', width: '100%',
    maxHeight: '88vh',
    overflowY: 'auto',
    padding: '28px 32px 24px',
    borderTop: '5px solid #1a1a1a',
    boxShadow: '0 8px 40px rgba(0,0,0,0.55)',
    fontFamily: "'Libre Baskerville', Georgia, serif",
    border: '1px solid #c8b07a',
  },
};

const Article = ({ evt, large }) => {
  const cfg = EVENT_CONFIG[evt.eventType] || EVENT_CONFIG.leve;
  const isMajor = ['grave', 'gravisima', 'careerEnd'].includes(evt.eventType);

  return (
    <div style={{
      borderLeft: `3px solid ${cfg.accent}`,
      paddingLeft: '12px',
      marginBottom: '14px',
    }}>
      {/* Section label */}
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 700,
        textTransform: 'uppercase',
        fontSize: '0.62rem',
        letterSpacing: '0.14em',
        color: '#888',
        marginBottom: '3px',
      }}>
        {cfg.label}
      </div>
      {/* Headline */}
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: large ? 900 : 700,
        fontSize: large ? '1.1rem' : '0.88rem',
        lineHeight: 1.25,
        color: '#1a1a1a',
        marginBottom: '4px',
        fontStyle: isMajor ? 'normal' : 'normal',
      }}>
        {evt.text}
      </div>
    </div>
  );
};

const MonthlyNewsModal = () => {
  const { state, dispatch } = useGame();
  const promo = useActivePromotion();
  const promoConfig = useActivePromotionConfig();
  const { currentYear, currentMonth } = state;
  const pendingMonthEvents = promo?.pendingMonthEvents;

  if (!promo || !pendingMonthEvents || pendingMonthEvents.length === 0) return null;

  const close = () => dispatch({ type: 'CLEAR_MONTH_EVENTS' });

  const severity = { careerEnd: 0, gravisima: 1, grave: 2, suspension: 3, moderada: 4, leve: 5, titleVacant: 6, return: 7 };
  const sorted = [...pendingMonthEvents].sort(
    (a, b) => (severity[a.eventType] ?? 8) - (severity[b.eventType] ?? 8)
  );

  const [headline, ...rest] = sorted;
  const leftCol  = rest.filter((_, i) => i % 2 === 0);
  const rightCol = rest.filter((_, i) => i % 2 === 1);

  return (
    <div style={S.modal} onClick={close}>
      <div style={S.paper} onClick={e => e.stopPropagation()}>

        {/* Masthead */}
        <div style={{ textAlign: 'center', borderBottom: '3px double #1a1a1a', borderTop: '3px double #1a1a1a', padding: '10px 0', marginBottom: '6px' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '2.4rem', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1, color: '#1a1a1a' }}>
            Wrestling Observer
          </div>
        </div>

        {/* Dateline */}
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', borderBottom: '1px solid #999', paddingBottom: '6px', marginBottom: '18px', textAlign: 'center' }}>
          Tokio, Japón &mdash; {MONTH_NAMES[currentMonth]} de {currentYear}
          &nbsp;&nbsp;·&nbsp;&nbsp;
          {pendingMonthEvents.length} {pendingMonthEvents.length === 1 ? 'noticia' : 'noticias'}
        </div>

        {/* Headline article */}
        <Article evt={headline} large />

        {/* Rest in 2 columns */}
        {rest.length > 0 && (
          <>
            <div style={{ borderTop: '2px solid #1a1a1a', borderBottom: '1px solid #ccc', margin: '8px 0 14px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>{leftCol.map(evt => <Article key={evt.id} evt={evt} />)}</div>
              <div style={{ borderLeft: '1px solid #ccc', paddingLeft: '16px' }}>
                {rightCol.map(evt => <Article key={evt.id} evt={evt} />)}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div style={{ borderTop: '2px solid #1a1a1a', marginTop: '20px', paddingTop: '14px', textAlign: 'center' }}>
          <button
            onClick={close}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              background: 'transparent',
              color: '#1a1a1a',
              border: '1.5px solid #1a1a1a',
              padding: '8px 32px',
              cursor: 'pointer',
            }}
          >
            Cerrar Edición
          </button>
        </div>

      </div>
    </div>
  );
};

export default MonthlyNewsModal;
