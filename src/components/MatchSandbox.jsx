import React from 'react';
import { useGame } from '../context/GameContext';

const MONTH_NAMES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const BELT_LABELS = {
  world:     'IWGP World Heavyweight',
  secondary: 'IWGP Intercontinental',
  junior:    'IWGP World Jr. Heavy',
  tag:       'World Tag Team',
};

/**
 * Historial de Combates — solo luchas por el título y finales de torneo.
 * Diseño en estilo periódico sin cards.
 */
const MatchSandbox = () => {
  const { state } = useGame();
  const { matchLog } = state;

  const importantLog = matchLog.filter(r => r.isTitleMatch || r.isTournamentFinal || r.isWON);

  return (
    <div className="container fade-in" style={{ maxWidth: '720px' }}>
      {/* Section masthead */}
      <div style={{ textAlign: 'center', borderBottom: '3px double var(--ink)', paddingBottom: '12px', marginBottom: '32px' }}>
        <div style={{ fontFamily: 'var(--display)', fontWeight: 900, fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Resultados Destacados
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '0.8rem', color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Títulos · Torneos · Premios anuales
        </div>
      </div>

      {importantLog.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: 'var(--display)', fontStyle: 'italic', color: 'var(--ink-3)', fontSize: '1.1rem' }}>
          Sin resultados destacados aún.<br />
          <small style={{ fontSize: '0.8rem' }}>Completá el Show Grande del mes para verlos aquí.</small>
        </div>
      ) : (
        importantLog.map((r, i) => {
          const beltLabel = r.belt ? (BELT_LABELS[r.belt] ?? r.belt) : null;
          const isTitle = r.isTitleMatch;
          const isWON = r.isWON;

          let section, headline, borderColor;
          if (isWON) {
            section = r.title;
            headline = `${r.winnerName} fue elegido Luchador del Año`;
            borderColor = '#8a6f00';
          } else if (isTitle) {
            section = `Campeonato ${beltLabel ?? ''}`;
            headline = r.loserName
              ? `${r.winnerName || r.winnerId} supera a ${r.loserName} por el Título ${beltLabel}`
              : `${r.winnerName || r.winnerId} retiene el Título`;
            borderColor = 'var(--ink)';
          } else {
            section = 'Final de Torneo';
            headline = r.loserName
              ? `${r.winnerName || r.winnerId} supera a ${r.loserName} en Gran Final`
              : `${r.winnerName || r.winnerId} gana el torneo`;
            borderColor = 'var(--accent)';
          }

          return (
            <div
              key={r.id}
              style={{
                paddingBottom: '20px',
                marginBottom: '20px',
                borderBottom: i < importantLog.length - 1 ? '1px solid #c8b890' : 'none',
                paddingLeft: '14px',
                borderLeft: `3px solid ${borderColor}`,
              }}
            >
              {/* Section label */}
              <div style={{
                fontFamily: 'var(--display)',
                fontWeight: 700,
                textTransform: 'uppercase',
                fontSize: '0.68rem',
                letterSpacing: '0.12em',
                color: borderColor,
                marginBottom: '4px',
              }}>
                {section}
              </div>

              {/* Headline */}
              <div style={{
                fontFamily: 'var(--display)',
                fontWeight: 900,
                fontSize: '1.15rem',
                lineHeight: 1.2,
                color: 'var(--ink)',
                marginBottom: '4px',
              }}>
                {headline}
              </div>

              {/* Dateline */}
              <div style={{ fontFamily: 'var(--serif)', fontSize: '0.78rem', color: 'var(--ink-3)', fontStyle: 'italic' }}>
                {MONTH_NAMES[r.month] ?? `Mes ${r.month}`}, {r.year}
                {r.title && r.isTitleMatch && ` — ${r.title}`}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MatchSandbox;
