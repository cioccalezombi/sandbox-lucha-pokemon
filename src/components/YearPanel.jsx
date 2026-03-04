import React from 'react';
import { useGame, SPECIAL_MONTHS } from '../context/GameContext';
import { Link } from 'react-router-dom';

const BELT_LABELS = {
  world:     'IWGP World Heavyweight',
  secondary: 'IWGP Intercontinental',
  junior:    'IWGP World Jr. Heavy',
  tag:       'World Tag Team',
};

const MONTH_NAMES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * YearPanel — solo muestra noticias de tapa.
 * Si no hay torneo especial ni cambio de título reciente: no renderiza nada.
 */
const YearPanel = () => {
  const { state } = useGame();
  const isTournamentMonth = !!SPECIAL_MONTHS[state.currentMonth];
  const tourConfig = SPECIAL_MONTHS[state.currentMonth];

  // Last title match in the current month
  const recentTitleWin = [...(state.matchLog || [])]
    .reverse()
    .find(r => r.isTitleMatch && r.month === state.currentMonth && r.year === state.currentYear);

  if (!isTournamentMonth && !recentTitleWin) return null;

  return (
    <div style={{ marginBottom: '32px', borderBottom: '2px solid var(--ink)', paddingBottom: '24px' }}>

      {/* ── Tournament front-page headline ── */}
      {isTournamentMonth && (
        <div style={{ marginBottom: recentTitleWin ? '28px' : 0 }}>
          <div style={{
            fontFamily: 'var(--display)',
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '0.68rem',
            letterSpacing: '0.14em',
            color: 'var(--ink-3)',
            marginBottom: '4px',
          }}>
            Torneo Especial · {MONTH_NAMES[state.currentMonth]} {state.currentYear}
          </div>
          <h1 style={{
            fontFamily: 'var(--display)',
            fontWeight: 900,
            fontSize: '2.2rem',
            lineHeight: 1.05,
            color: 'var(--ink)',
            margin: '0 0 8px',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
          }}>
            Comienza la {tourConfig.name}
          </h1>
          <p style={{
            fontFamily: 'var(--serif)',
            fontSize: '0.92rem',
            color: 'var(--ink-2)',
            lineHeight: 1.6,
            margin: '0 0 12px',
          }}>
            Este mes los shows semanales son reemplazados por el torneo especial.
            Las plazas aún están por confirmarse.
          </p>
          <Link to="/shows" className="btn btn-dark btn-sm">
            Ir a Shows
          </Link>
        </div>
      )}

      {/* ── Title change headline ── */}
      {recentTitleWin && (
        <div style={{ borderLeft: '4px solid var(--ink)', paddingLeft: '16px' }}>
          <div style={{
            fontFamily: 'var(--display)',
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '0.68rem',
            letterSpacing: '0.14em',
            color: 'var(--ink-3)',
            marginBottom: '4px',
          }}>
            Resultado · Campeonato {BELT_LABELS[recentTitleWin.belt] ?? recentTitleWin.belt}
          </div>
          <h1 style={{
            fontFamily: 'var(--display)',
            fontWeight: 900,
            fontSize: '2rem',
            lineHeight: 1.05,
            color: 'var(--ink)',
            margin: '0 0 8px',
          }}>
            {recentTitleWin.loserName
              ? `${recentTitleWin.winnerName} vence a ${recentTitleWin.loserName} por el Título ${BELT_LABELS[recentTitleWin.belt] ?? ''}`
              : `${recentTitleWin.winnerName} retiene el Título ${BELT_LABELS[recentTitleWin.belt] ?? ''}`}
          </h1>
          <p style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: '0.85rem',
            color: 'var(--ink-3)',
            margin: 0,
          }}>
            {MONTH_NAMES[recentTitleWin.month] ?? `Mes ${recentTitleWin.month}`}, {recentTitleWin.year}
          </p>
        </div>
      )}

    </div>
  );
};

export default YearPanel;
