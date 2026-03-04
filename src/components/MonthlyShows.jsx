import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import ConfirmModal from './ConfirmModal';
import { getEffectiveLevel } from '../models/Wrestler';

// Belt display names
const BELT_DISPLAY = {
  world:     'IWGP World Heavyweight Championship',
  secondary: 'IWGP Intercontinental Championship',
  junior:    'IWGP World Jr. Heavy Championship',
  tag:       'World Tag Team Championship',
};

// ─── Newspaper-style wrestling card match row ────────────────────────────────
const MatchRow = ({ match, showIndex, isGrande, currentYear }) => {
  const { dispatch } = useGame();
  const resolved = match.type === 'tag' ? match.winningSide !== null : match.winnerId !== null;

  const resolveWith = (winnerId = null, winningSide = null) => {
    dispatch({ type: 'RESOLVE_SHOW_MATCH', payload: { showIndex, matchId: match.id, winnerId, winningSide } });
  };

  const isTag = match.type === 'tag';

  const nameA = isTag
    ? match.teamA?.map(w => w?.name).filter(Boolean).join(' & ') ?? 'TBD'
    : match.wrestlerA?.name ?? 'TBD';
  const nameB = isTag
    ? match.teamB?.map(w => w?.name).filter(Boolean).join(' & ') ?? 'TBD'
    : match.wrestlerB?.name ?? 'TBD';

  const lvlA = isTag
    ? match.teamA?.reduce((s, w) => s + (w ? getEffectiveLevel(w, currentYear) : 0), 0)
    : (match.wrestlerA ? getEffectiveLevel(match.wrestlerA, currentYear) : 0);
  const lvlB = isTag
    ? match.teamB?.reduce((s, w) => s + (w ? getEffectiveLevel(w, currentYear) : 0), 0)
    : (match.wrestlerB ? getEffectiveLevel(match.wrestlerB, currentYear) : 0);

  const winnerName = resolved
    ? (isTag
        ? (match.winningSide === 'A' ? nameA : nameB)
        : (match.winnerId === match.wrestlerA?.id ? nameA : nameB))
    : null;

  const isTitle = match.type === 'title' || !!match.title;
  const beltTitle = match.title
    ? match.title
    : (isTitle && match.belt ? BELT_DISPLAY[match.belt] : null);

  return (
    <div style={{
      borderBottom: '1px solid #c8b890',
      padding: '10px 0',
      opacity: resolved ? 0.85 : 1,
    }}>
      {/* Belt / match type label */}
      {(isGrande || isTitle) && beltTitle && (
        <div style={{
          fontFamily: 'var(--display)',
          fontWeight: 700,
          fontSize: '0.62rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          textAlign: 'center',
          color: '#ccc',
          marginBottom: '4px',
        }}>
          {beltTitle}
        </div>
      )}

      {/* Match row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Fighter A */}
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--display)',
            fontWeight: 900,
            fontSize: isGrande ? '1rem' : '0.88rem',
            textTransform: 'uppercase',
            color: resolved && winnerName === nameA ? 'var(--ink)' : 'var(--ink)',
          }}>
            {nameA}
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '0.68rem', color: 'var(--ink)', fontWeight: resolved && winnerName === nameA ? 700 : 400 }}>
            LVL {lvlA}
          </div>
        </div>

        {/* VS column */}
        <div style={{
          width: '36px',
          textAlign: 'center',
          fontFamily: 'var(--display)',
          fontWeight: 900,
          fontSize: '0.72rem',
          letterSpacing: '0.1em',
          color: 'var(--ink)',
          flexShrink: 0,
        }}>
          vs
        </div>

        {/* Fighter B */}
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{
            fontFamily: 'var(--display)',
            fontWeight: 900,
            fontSize: isGrande ? '1rem' : '0.88rem',
            textTransform: 'uppercase',
            color: 'var(--ink)',
          }}>
            {nameB}
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '0.68rem', color: 'var(--ink)', fontWeight: resolved && winnerName === nameB ? 700 : 400 }}>
            LVL {lvlB}
          </div>
        </div>
      </div>

      {/* Result or action buttons */}
      {resolved ? (
        <div style={{
          textAlign: 'center',
          fontFamily: 'var(--display)',
          fontWeight: 700,
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--ink)',
          marginTop: '4px',
        }}>
          Ganador: {winnerName}
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '8px' }}>
          <button
            style={{
              background: 'transparent',
              border: '1.5px solid var(--ink)',
              color: 'var(--ink)',
              padding: '4px 18px',
              fontFamily: 'var(--display)',
              fontWeight: 900,
              fontSize: '1rem',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              minWidth: '48px',
            }}
            onClick={() => isTag ? resolveWith(null, 'A') : resolveWith(match.wrestlerA?.id)}
          >
            X
          </button>
          <button
            style={{
              background: 'transparent',
              border: '1.5px solid var(--ink)',
              color: 'var(--ink)',
              padding: '4px 18px',
              fontFamily: 'var(--display)',
              fontWeight: 900,
              fontSize: '1rem',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              minWidth: '48px',
            }}
            onClick={() => isTag ? resolveWith(null, 'B') : resolveWith(match.wrestlerB?.id)}
          >
            X
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Vista completa del show actual ─────────────────────────────────────────
const MonthlyShows = () => {
  const { state, dispatch } = useGame();
  const { monthlyShows, currentShowIndex } = state;
  const [confirmAdv, setConfirmAdv] = useState(false);

  const currentShow = monthlyShows.find(s => s.index === currentShowIndex);
  const isGrandeNext = currentShowIndex === 6;
  const isGrande     = currentShow?.isGrande;
  const totalShows   = 8;

  const allResolved = currentShow
    ? currentShow.matches.every(m => m.type === 'tag' ? m.winningSide !== null : m.winnerId !== null)
    : false;

  const handleAdvance = () => {
    setConfirmAdv(false);
    dispatch({ type: 'ADVANCE_SHOW' });
  };

  if (monthlyShows.length === 0) {
    return (
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-3)', padding: '32px 0', textAlign: 'center' }}>
        Los shows se generan automáticamente al terminar de elegir los workers.
      </div>
    );
  }

  return (
    <div>
      {/* ── Wrestling card style show header ── */}
      <div style={{
        background: 'var(--paper)',
        color: 'var(--ink)',
        padding: '20px 24px 16px',
        marginBottom: '0',
        textAlign: 'center',
        borderBottom: '2px solid var(--ink)',
      }}>
        {/* Show number */}
        <div style={{
          fontFamily: 'var(--display)',
          fontWeight: 700,
          fontSize: '0.65rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
          marginBottom: '4px',
        }}>
          Show {currentShowIndex + 1} de {totalShows}
        </div>

        {/* Event name */}
        <div style={{
          fontFamily: 'var(--display)',
          fontWeight: 900,
          fontSize: isGrande ? '1.6rem' : '1.1rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          lineHeight: 1.1,
        }}>
          {currentShow?.label}
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
          {Array.from({ length: totalShows }, (_, i) => {
            const s = monthlyShows.find(sh => sh.index === i);
            const done = s?.matches.every(m => m.type === 'tag' ? m.winningSide !== null : m.winnerId !== null);
            const isCurrent = i === currentShowIndex;
            return (
              <div
                key={i}
                style={{
                  width: isCurrent ? 12 : 8, height: isCurrent ? 12 : 8,
                  borderRadius: '50%',
                  background: isCurrent ? 'var(--ink)' : done ? 'var(--ink-3)' : 'rgba(26,26,26,0.15)',
                  border: isCurrent ? '2px solid var(--ink-2)' : 'none',
                  transition: 'all 0.2s',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ── Match card list ── */}
      <div style={{
        background: 'var(--paper)',
        padding: '0 24px',
        marginBottom: '0',
      }}>
        {currentShow && currentShow.matches.map(m => (
          <MatchRow key={m.id} match={m} showIndex={currentShow.index} isGrande={isGrande} currentYear={state.currentYear} />
        ))}
      </div>

      {/* ── Navigation ── */}
      <div style={{
        background: 'var(--paper)',
        padding: '14px 24px',
        borderTop: '1px solid #c8b890',
        display: 'flex',
        justifyContent: 'flex-end',
      }}>
        {currentShowIndex < 7 ? (
          <button
            style={{
              background: allResolved ? 'var(--ink)' : 'transparent',
              border: '1.5px solid var(--ink)',
              color: allResolved ? 'var(--paper)' : 'var(--ink-3)',
              padding: '8px 28px',
              fontFamily: 'var(--display)',
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: allResolved ? 'pointer' : 'not-allowed',
              opacity: allResolved ? 1 : 0.5,
            }}
            disabled={!allResolved}
            onClick={() => isGrandeNext ? setConfirmAdv(true) : handleAdvance()}
          >
            {isGrandeNext ? 'Continuar' : 'Siguiente Show'}
          </button>
        ) : (
          state.currentMonth < 12 ? (
            <button
              style={{
                background: allResolved ? '#fff' : 'transparent',
                border: '1.5px solid #fff',
                color: allResolved ? '#111' : '#555',
                padding: '8px 28px',
                fontFamily: 'var(--display)',
                fontWeight: 700,
                fontSize: '0.78rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: allResolved ? 'pointer' : 'not-allowed',
                opacity: allResolved ? 1 : 0.5,
              }}
              disabled={!allResolved}
              onClick={() => dispatch({ type: 'ADVANCE_MONTH_AND_SELECT' })}
            >
              Siguiente Mes
            </button>
          ) : (
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-3)', fontSize: '0.88rem' }}>
              Diciembre completo. Avanzá el año desde el header.
            </div>
          )
        )}
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        open={confirmAdv}
        title="Pasar al Show Grande"
        message="Se generará la cartelera basada en el ranking mensual actual."
        confirmLabel="Continuar"
        onConfirm={handleAdvance}
        onCancel={() => setConfirmAdv(false)}
      />
    </div>
  );
};

export default MonthlyShows;
