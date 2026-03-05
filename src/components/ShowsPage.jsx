import MonthlyShows from './MonthlyShows';
import { TournamentView } from './TournamentView';
import { useGame, useActivePromotion, useActivePromotionConfig } from '../context/GameContext';
import { getEffectiveLevel } from '../models/Wrestler';
import { Link } from 'react-router-dom';

const MONTH_NAMES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// ── G1 Draft UI ───────────────────────────────────────────────────────────────
const G1DraftView = () => {
  const { state, dispatch } = useGame();
  const promo = useActivePromotion();
  const { g1DraftOptions, g1DraftSelected, g1DraftTarget } = promo;
  const currentYear = state.currentYear;

  const choose = (id) => dispatch({ type: 'CHOOSE_G1_DRAFT', payload: { chosenId: id } });
  const cancel = () => dispatch({ type: 'CANCEL_G1_DRAFT' });

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
        <div>
          <h5 className="mb-0 fw-bold" style={{ color: '#faf6ed' }}>Draft de Participantes</h5>
          <small style={{ color: 'rgba(255,255,255,0.55)' }}>Elegí 1 de 3 — los otros vuelven al pool</small>
        </div>
        <span className="badge bg-warning text-dark fs-6">
          {g1DraftSelected.length} / {g1DraftTarget}
        </span>
      </div>

      <div className="card-body">
        <h6 className="text-muted text-uppercase fw-bold mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
          ¿Quién entra al torneo?
        </h6>
        <div className="row g-3 mb-4">
          {g1DraftOptions.map(w => {
            const effLevel = getEffectiveLevel(w, currentYear);
            const lvlBg   = effLevel >= 8 ? 'bg-success' : effLevel >= 5 ? 'bg-warning' : 'bg-danger';
            const lvlText = effLevel >= 5 && effLevel < 8 ? 'text-dark' : 'text-white';
            return (
              <div className="col-md-4" key={w.id}>
                <div
                  className="card border-0 shadow-sm h-100 text-center p-3 cursor-pointer"
                  style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  onClick={() => choose(w.id)}
                >
                  <div className="fw-bold fs-5 mb-1">{w.name}</div>
                  <div className="text-muted small mb-2">{w.style} · {w.weightClass}</div>
                  <span className={`badge ${lvlBg} ${lvlText} mx-auto`} style={{ fontSize: '0.8rem' }}>
                    LVL {effLevel}
                  </span>
                  <button className="btn btn-dark fw-bold mt-3 w-100">Elegir</button>
                </div>
              </div>
            );
          })}
        </div>

        {g1DraftSelected.length > 0 && (
          <div>
            <h6 className="text-muted text-uppercase fw-bold mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
              Participantes confirmados
            </h6>
            <div className="d-flex flex-wrap gap-2">
              {g1DraftSelected.map(w => {
                const effLevel = getEffectiveLevel(w, currentYear);
                return (
                  <span key={w.id} className="badge bg-dark text-white" style={{ fontSize: '0.8rem', padding: '0.4em 0.7em' }}>
                    {w.name} <span className="text-warning">LVL {effLevel}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-end mt-3">
          <button className="btn btn-sm btn-outline-secondary" onClick={cancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

const MonthlyRanking = () => {
  const promo = useActivePromotion();
  const ranking = [...(promo.roster || [])]
    .filter(w => w.status === 'active')
    .sort((a, b) => (b.monthlyPoints || 0) - (a.monthlyPoints || 0))
    .slice(0, 10);

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-2">
        <span className="fw-bold">Ranking Mensual</span>
      </div>
      <div className="card-body p-0">
        {ranking.length === 0 ? (
          <div className="text-muted text-center py-3 small">Sin puntos este mes.</div>
        ) : (
          <ul className="list-group list-group-flush">
            {ranking.map((w, i) => (
              <li key={w.id} className="list-group-item d-flex justify-content-between align-items-center py-2">
                <div>
                  <span className="text-muted me-2" style={{ fontSize: '0.8rem', minWidth: '20px', display: 'inline-block' }}>
                    {i === 0 ? 'I.' : i === 1 ? 'II.' : i === 2 ? 'III.' : `${i + 1}.`}
                  </span>
                  <span className="fw-medium">{w.name}</span>
                  <small className="text-muted ms-2">{w.style}</small>
                </div>
                <span className="badge bg-dark">{w.monthlyPoints || 0} pts</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const ShowsPage = () => {
  const { state, dispatch } = useGame();
  const promo = useActivePromotion();
  const promoConfig = useActivePromotionConfig();
  const { currentYear, currentMonth } = state;
  const { monthlyWorkers, activeTournament, monthlyEventSeries, g1DraftActive } = promo;

  const specialMonthConfig = promoConfig?.specialMonths?.[currentMonth];

  const handleSelectWorkers = () => dispatch({ type: 'ADVANCE_MONTH_AND_SELECT' });

  return (
    <div className="container fade-in">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-uppercase fw-bold text-dark mb-1 d-flex align-items-center gap-2">
          {MONTH_NAMES[currentMonth]} {currentYear}
          {specialMonthConfig && (
            <span className="badge bg-dark fs-6 ms-2">
              {specialMonthConfig.name}
            </span>
          )}
        </h2>
        <p className="text-muted mb-0">
          {monthlyWorkers.length > 0
            ? `${monthlyWorkers.length} workers seleccionados para este mes`
            : specialMonthConfig ? 'Torneo especial este mes' : 'Seleccioná los workers del mes para comenzar'}
        </p>
      </div>

      <div className="row g-4">
        {/* Columna principal */}
        <div className={activeTournament ? 'col-12' : 'col-lg-8'}>
          {activeTournament ? (
            <TournamentView />
          ) : g1DraftActive ? (
            <G1DraftView />
          ) : specialMonthConfig ? (
            <div className="text-center py-5">
              <div className="display-1 mb-3">{specialMonthConfig.icon}</div>
              <h3 className="fw-bold fs-2">{specialMonthConfig.name}</h3>
              <p className="text-muted mb-4 fs-5">
                Este mes alberga el torneo especial.<br/>
                <small>(Reemplaza a los shows semanales regulares)</small>
              </p>
              <button
                className="btn btn-warning btn-lg fw-bold px-5 py-3 shadow"
                onClick={() => dispatch({ type: 'GENERATE_TOURNAMENT' })}
              >
                🎲 {specialMonthConfig.key === 'g1' ? 'Iniciar Draft G1 Climax' : `Generar ${specialMonthConfig.name}`}
              </button>
            </div>
          ) : monthlyWorkers.length === 0 ? (
            <div style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ fontFamily: 'var(--serif)', color: 'var(--ink-2)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                No hay workers seleccionados para este mes.
              </div>
              <button
                className="btn btn-dark"
                onClick={() => dispatch({ type: 'SELECT_MONTHLY_WORKERS' })}
              >
                Seleccionar Workers del Mes
              </button>
            </div>
          ) : (
            <MonthlyShows />
          )}
        </div>

        {/* Sidebar: ranking mensual */}
        {!activeTournament && !g1DraftActive && (
          <div className="col-lg-4">
            <MonthlyRanking />
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowsPage;
