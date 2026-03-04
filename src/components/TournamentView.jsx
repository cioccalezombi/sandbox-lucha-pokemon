import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { getEffectiveLevel } from '../models/Wrestler';

// ── helpers ───────────────────────────────────────────────────────────────────
const lvlBadge = (effLevel) => (
  <span style={{ border: '1px solid currentColor', padding: '1px 5px', fontSize: '0.58rem', fontWeight: 700, fontFamily: 'var(--display)', marginLeft: '4px', letterSpacing: '0.05em' }}>
    LVL {effLevel}
  </span>
);

// ── MatchCard ─────────────────────────────────────────────────────────────────
const MatchCard = ({ match, onResolve, hideWinnerButton = false, currentYear }) => {
  if (!match || (!match.wrestlerA && !match.teamA) && !match.winnerId)
    return <div className="card p-3 mb-2 text-center text-muted" style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>A definirse</div>;

  const isTag    = match.type === 'tag';
  const resolved = isTag ? match.winningSide !== null : match.winnerId !== null;

  const WrestlerLabel = ({ w }) => {
    if (!w) return <span style={{ fontStyle: 'italic', color: 'var(--ink-3)' }}>TBD</span>;
    const effLevel = getEffectiveLevel(w, currentYear);
    const isWinner = resolved && !isTag && match.winnerId === w.id;
    return (
      <span style={{ fontWeight: isWinner ? 700 : 400 }}>
        {w.name}{lvlBadge(effLevel)}
      </span>
    );
  };

  const TagLabel = ({ team }) => {
    if (!team || team.length === 0) return <span style={{ fontStyle: 'italic', color: 'var(--ink-3)' }}>TBD</span>;
    const combinedLvl = team.reduce((sum, w) => sum + (w ? getEffectiveLevel(w, currentYear) : 0), 0);
    return (
      <span>
        {team.map(w => w?.name).filter(Boolean).join(' & ')}
        <span style={{ border: '1px solid currentColor', padding: '1px 5px', fontSize: '0.58rem', fontWeight: 700, fontFamily: 'var(--display)', marginLeft: '4px', letterSpacing: '0.05em' }}>
          TEAM LVL {combinedLvl}
        </span>
      </span>
    );
  };

  const getLabelA = () => isTag ? <TagLabel team={match.teamA} /> : <WrestlerLabel w={match.wrestlerA} />;
  const getLabelB = () => isTag ? <TagLabel team={match.teamB} /> : <WrestlerLabel w={match.wrestlerB} />;

  const getTextA = () => isTag ? match.teamA.map(w => w?.name).filter(Boolean).join(' & ') : match.wrestlerA?.name;
  const getTextB = () => isTag ? match.teamB.map(w => w?.name).filter(Boolean).join(' & ') : match.wrestlerB?.name;

  return (
    <div style={{
      border: '1px solid #c8b890',
      background: resolved ? 'var(--paper-2)' : 'var(--paper-2)',
      marginBottom: '8px',
      padding: '10px 14px',
      opacity: resolved ? 0.82 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', fontFamily: 'var(--serif)', fontSize: '0.88rem' }}>
        <div style={{ flex: 1, textAlign: 'right' }}>{getLabelA()}</div>
        <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--ink-3)', padding: '0 8px' }}>vs</div>
        <div style={{ flex: 1, textAlign: 'left' }}>{getLabelB()}</div>
      </div>

      {resolved ? (
        <div style={{ textAlign: 'center', fontFamily: 'var(--display)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', color: 'var(--ink-2)', marginTop: '6px', textTransform: 'uppercase' }}>
          Ganador: {isTag
            ? (match.winningSide === 'A' ? getTextA() : getTextB())
            : (match.winnerId === 'draw' ? 'Empate' : (match.winnerId === match.wrestlerA?.id ? getTextA() : getTextB()))}
        </div>
      ) : !hideWinnerButton && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
          <button
            style={{ background: 'transparent', border: '1.5px solid var(--ink)', color: 'var(--ink)', padding: '4px 18px', fontFamily: 'var(--display)', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', letterSpacing: '0.1em' }}
            onClick={() => onResolve(isTag ? null : match.wrestlerA?.id, isTag ? 'A' : null)}
          >
            X
          </button>
          <button
            style={{ background: 'transparent', border: '1.5px solid var(--ink)', color: 'var(--ink)', padding: '4px 18px', fontFamily: 'var(--display)', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', letterSpacing: '0.1em' }}
            onClick={() => onResolve(isTag ? null : match.wrestlerB?.id, isTag ? 'B' : null)}
          >
            X
          </button>
        </div>
      )}
    </div>
  );
};

const NextMonthButton = () => {
  const { state, dispatch } = useGame();
  return (
    <div style={{ textAlign: 'center', marginTop: '32px' }}>
      {state.currentMonth < 12 ? (
        <button
          className="btn btn-dark px-5 py-2"
          onClick={() => dispatch({ type: 'ADVANCE_MONTH_AND_SELECT' })}
        >
          Siguiente Mes
        </button>
      ) : (
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-3)', fontSize: '0.9rem' }}>
          Usá "Avanzar Año" en el Dashboard para continuar.
        </div>
      )}
    </div>
  );
};

export const EliminationView = ({ tournament }) => {
  const { state, dispatch } = useGame();
  const currentYear = state.currentYear;

  // Find the first round that has unresolved matches (current active round)
  const firstUnfinishedRoundId = tournament.rounds.find(
    r => r.matches.some(m => m.winnerId === null && m.wrestlerA && m.wrestlerB)
  )?.id || tournament.rounds[tournament.rounds.length - 1]?.id;

  const [activeRound, setActiveRound] = useState(firstUnfinishedRoundId || tournament.rounds[0]?.id);

  const resolveMatch = (roundId, matchId, winnerId, winningSide) => {
    dispatch({ type: 'RESOLVE_TOURNAMENT_MATCH', payload: { tournamentType: 'elimination', roundId, matchId, winnerId, winningSide } });
  };

  const tabStyle = (id) => ({
    background: activeRound === id ? 'var(--ink)' : 'transparent',
    color: activeRound === id ? 'var(--paper)' : 'var(--ink)',
    border: '1px solid var(--ink)',
    padding: '5px 14px',
    fontFamily: 'var(--display)',
    fontWeight: 700,
    fontSize: '0.72rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  });

  const roundComplete = (round) =>
    round.matches.every(m => m.winnerId !== null || (!m.wrestlerA && !m.wrestlerB));

  return (
    <div className="elimination-bracket">
      {tournament.winnerId && (
        <div style={{
          fontFamily: 'var(--display)', fontWeight: 900, fontSize: '1.6rem',
          textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink)',
          borderLeft: '5px solid var(--ink)', paddingLeft: '16px',
          marginBottom: '24px',
        }}>
          Campeón del torneo:<br />
          <span style={{ fontSize: '2rem' }}>
            {tournament.participants.find(p => p.id === tournament.winnerId)?.name}
          </span>
        </div>
      )}

      {/* Round tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {tournament.rounds.map((round) => {
          const done = roundComplete(round);
          return (
            <button
              key={round.id}
              style={{
                ...tabStyle(round.id),
                background: done && activeRound !== round.id
                  ? 'var(--paper-2)'
                  : (activeRound === round.id ? 'var(--ink)' : 'transparent'),
              }}
              onClick={() => setActiveRound(round.id)}
            >
              {done ? '+ ' : ''}{round.name}
            </button>
          );
        })}
      </div>

      {/* Active round matches */}
      <div className="row justify-content-center">
        <div className="col-md-8">
          {tournament.rounds.find(r => r.id === activeRound)?.matches.map(m => (
            <MatchCard
              key={m.id}
              match={m}
              currentYear={currentYear}
              onResolve={(wId, wSide) => resolveMatch(activeRound, m.id, wId, wSide)}
            />
          ))}
        </div>
      </div>

      {tournament.winnerId && <NextMonthButton />}
    </div>
  );
};

export const RoundRobinView = ({ tournament }) => {
  const { state, dispatch } = useGame();
  const currentYear = state.currentYear;
  const [activeTab, setActiveTab] = useState(tournament.days[0]?.id || 'standings');

  const resolveMatch = (dayId, matchId, winnerId, winningSide) => {
    dispatch({ type: 'RESOLVE_TOURNAMENT_MATCH', payload: { tournamentType: tournament.type, dayId, matchId, winnerId, winningSide } });
  };

  const resolveFinal = (winnerId, winningSide) => {
    dispatch({ type: 'RESOLVE_TOURNAMENT_MATCH', payload: { tournamentType: tournament.type, matchId: 't_final', winnerId, winningSide } });
  };

  const isTag = tournament.type === 'tagRoundRobin';
  const participantsList = isTag ? tournament.teams : tournament.participants;

  const allDaysComplete = tournament.days.length > 0 &&
    tournament.days.every(d => d.matches.every(m => m.winnerId != null || m.winningSide != null));

  const sortedStandings = Object.keys(tournament.standings)
    .sort((a, b) => tournament.standings[b].points - tournament.standings[a].points);

  // Tab pill style
  const tabStyle = (id) => ({
    background: activeTab === id ? 'var(--ink)' : 'transparent',
    color: activeTab === id ? 'var(--paper)' : 'var(--ink)',
    border: '1px solid var(--ink)',
    padding: '5px 14px',
    fontFamily: 'var(--display)',
    fontWeight: 700,
    fontSize: '0.72rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  });

  return (
    <div>
      {tournament.winnerId && (
        <div style={{
          background: 'var(--ink)',
          color: 'var(--paper)',
          padding: '16px 24px',
          textAlign: 'center',
          fontFamily: 'var(--display)',
          fontWeight: 900,
          fontSize: '1.3rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: '24px',
        }}>
          Ganador: {isTag
            ? tournament.teams.find(t => t.id === tournament.winnerId)?.name
            : tournament.participants.find(p => p.id === tournament.winnerId)?.name}
        </div>
      )}

      {/* TABS */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button style={tabStyle('standings')} onClick={() => setActiveTab('standings')}>
          Posiciones
        </button>
        {tournament.days.map((day) => {
          const done = day.matches.every(m => m.winnerId !== null || m.winningSide !== null);
          return (
            <button
              key={day.id}
              style={{
                ...tabStyle(day.id),
                background: done && activeTab !== day.id ? 'var(--paper-2)' : (activeTab === day.id ? 'var(--ink)' : 'transparent'),
              }}
              onClick={() => setActiveTab(day.id)}
            >
              {done ? '+ ' : ''}{day.name}
            </button>
          );
        })}
        {/* Gran Final tab */}
        <button
          style={{
            ...tabStyle('final'),
            opacity: allDaysComplete ? 1 : 0.45,
            cursor: allDaysComplete ? 'pointer' : 'not-allowed',
          }}
          onClick={() => allDaysComplete && setActiveTab('final')}
          disabled={!allDaysComplete}
          title={!allDaysComplete ? 'Completá todos los días primero' : ''}
        >
          Gran Final
        </button>
      </div>

      {/* STANDINGS */}
      {activeTab === 'standings' && (
        <div style={{ border: '1px solid #c8b890' }}>
          <div className="table-responsive">
            <table className="table table-hover mb-0 text-center align-middle">
              <thead style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
                <tr>
                  <th className="text-start ps-3" style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>#</th>
                  <th className="text-start" style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{isTag ? 'Equipo' : 'Luchador'}</th>
                  <th style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>LVL</th>
                  <th style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>PJ</th>
                  <th style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>PTS</th>
                </tr>
              </thead>
              <tbody>
                {sortedStandings.map((id, index) => {
                  const part = participantsList.find(p => String(p.id) === String(id));
                  const stats = tournament.standings[id];
                  let lvlText;
                  if (isTag && part?.members) {
                    const combinedLvl = part.members.reduce((s, w) => s + getEffectiveLevel(w, currentYear), 0);
                    lvlText = combinedLvl;
                  } else if (part && !isTag) {
                    lvlText = getEffectiveLevel(part, currentYear);
                  } else {
                    lvlText = '—';
                  }
                  return (
                    <tr key={id} style={{ fontFamily: 'var(--serif)', fontWeight: index < 2 ? 700 : 400, background: index < 2 ? 'var(--paper-2)' : 'var(--paper-2)' }}>
                      <td className="text-start ps-3">{index + 1}</td>
                      <td className="text-start">{part?.name}</td>
                      <td>{lvlText}</td>
                      <td>{stats.matchesPlayed}</td>
                      <td>{stats.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DAYS */}
      {activeTab.startsWith('day_') && (
        <div className="row justify-content-center">
          <div className="col-md-8">
            {tournament.days.find(d => d.id === activeTab)?.matches.map(m => (
              <MatchCard key={m.id} match={m} currentYear={currentYear} onResolve={(wId, wSide) => resolveMatch(activeTab, m.id, wId, wSide)} />
            ))}
          </div>
        </div>
      )}

      {/* FINAL */}
      {activeTab === 'final' && tournament.finalMatch && (
        <div className="row justify-content-center mt-4">
          <div className="col-md-8">
            <div style={{
              fontFamily: 'var(--display)',
              fontWeight: 700,
              textTransform: 'uppercase',
              fontSize: '0.72rem',
              letterSpacing: '0.12em',
              color: 'var(--ink-3)',
              textAlign: 'center',
              marginBottom: '12px',
            }}>
              Gran Final
            </div>
            <MatchCard match={tournament.finalMatch} currentYear={currentYear} onResolve={(wId, wSide) => resolveFinal(wId, wSide)} />
          </div>
        </div>
      )}

      {tournament.winnerId && <NextMonthButton />}
    </div>
  );
};

export const TournamentView = () => {
  const { state } = useGame();
  const t = state.activeTournament;

  if (!t) return null;

  return (
    <div className="tournament-container fade-in mt-4">
      {/* Tournament masthead — no emoji */}
      <div style={{
        background: 'var(--ink)',
        color: 'var(--paper)',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        fontFamily: 'var(--display)',
      }}>
        <div style={{ fontWeight: 900, fontSize: '1.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {t.name}
        </div>
        <div style={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.7 }}>
          {t.type === 'elimination' ? 'Eliminación Directa' : 'Round Robin'}
        </div>
      </div>

      {t.type === 'elimination' && <EliminationView tournament={t} />}
      {(t.type === 'roundrobin' || t.type === 'tagRoundRobin') && <RoundRobinView tournament={t} />}
    </div>
  );
};
