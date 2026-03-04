import React from 'react';
import { useGame } from '../context/GameContext';

const MONTH_NAMES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const HistoryView = () => {
  const { state } = useGame();

  return (
    <div className="container fade-in" style={{ maxWidth: '720px' }}>
      {/* Newspaper masthead for the history section */}
      <div style={{ textAlign: 'center', borderBottom: '3px double var(--ink)', paddingBottom: '12px', marginBottom: '32px' }}>
        <div style={{ fontFamily: 'var(--display)', fontWeight: 900, fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Historial
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '0.8rem', color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Archivo de ediciones anteriores
        </div>
      </div>

      {state.yearHistory.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: 'var(--display)', fontStyle: 'italic', color: 'var(--ink-3)', fontSize: '1.1rem' }}>
          No hay ediciones anteriores.<br/>
          <small style={{ fontSize: '0.8rem' }}>Avanzá el año para registrar el primer anuario.</small>
        </div>
      ) : (
        [...state.yearHistory].reverse().map(yr => (
          <div key={yr.year} style={{ marginBottom: '40px' }}>
            {/* Year headline */}
            <div style={{
              fontFamily: 'var(--display)',
              fontWeight: 900,
              fontSize: '2rem',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              borderBottom: '2px solid var(--ink)',
              paddingBottom: '4px',
              marginBottom: '16px',
            }}>
              Año {yr.year}
            </div>

            {/* Retirements as a news item */}
            {yr.retirements.length > 0 && (
              <div style={{ marginBottom: '20px', paddingLeft: '14px', borderLeft: '3px solid var(--accent)' }}>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '4px' }}>
                  Retiros
                </div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>
                  {yr.retirements.length === 1
                    ? `${yr.retirements[0]} cuelga las botas`
                    : `${yr.retirements.length} luchadores se retiran del ring`}
                </div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '0.88rem', color: 'var(--ink-2)' }}>
                  {yr.retirements.join(', ')}
                </div>
              </div>
            )}

            {/* Match results as newspaper column items */}
            {yr.matchLog.length > 0 ? (
              <div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--ink-3)', marginBottom: '10px' }}>
                  Resultados del Año
                </div>
                <div style={{ columns: '2', columnGap: '24px', columnRule: '1px solid #c8b890' }}>
                  {yr.matchLog.map((r, i) => {
                    const winner = state.roster.find(w => w.id === r.winnerId)
                      || state.retiredRoster.find(w => w.id === r.winnerId);
                    const loser = state.roster.find(w => w.id === r.loserId)
                      || state.retiredRoster.find(w => w.id === r.loserId);
                    return (
                      <div
                        key={r.id}
                        style={{
                          padding: '6px 0',
                          borderBottom: '1px solid #e0d8c8',
                          breakInside: 'avoid',
                          fontFamily: 'var(--serif)',
                          fontSize: '0.82rem',
                        }}
                      >
                        <span style={{ color: 'var(--ink-3)', fontSize: '0.7rem', letterSpacing: '0.06em', display: 'block', fontFamily: 'var(--display)', textTransform: 'uppercase' }}>
                          {MONTH_NAMES[r.month] ?? `Mes ${r.month}`}
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{winner?.name ?? r.winnerId}</span>
                        <span style={{ color: 'var(--ink-3)', margin: '0 4px' }}>def.</span>
                        <span style={{ color: 'var(--ink-2)' }}>{loser?.name ?? r.loserId}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-3)', fontSize: '0.88rem' }}>
                No se registraron combates este año.
              </div>
            )}

            {/* Separator between years */}
            <div style={{ borderTop: '1px solid #c8b890', marginTop: '32px' }} />
          </div>
        ))
      )}
    </div>
  );
};

export default HistoryView;
