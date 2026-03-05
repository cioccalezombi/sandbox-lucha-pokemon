import React from 'react';
import { useGame, useActivePromotion } from '../context/GameContext';
import { getEffectiveStat, getPrimeStatus, calculateAge } from '../models/Wrestler';

const styleColors = {
  'Powerhouse': 'danger', 'Technician': 'primary', 'High Flyer': 'warning',
  'Brawler': 'secondary', 'Submission Specialist': 'success',
};

const WorkerCard = ({ wrestler, onChoose }) => {
  const { state } = useGame();
  const { currentYear } = state;
  const age = calculateAge(wrestler, currentYear);
  const primeStatus = getPrimeStatus(age);
  const badgeColor = age < 28 ? 'info' : age <= 38 ? 'success' : 'warning';
  const styleColor = styleColors[wrestler.style] || 'dark';

  return (
    <div
      className="card h-100 shadow border-0"
      style={{ cursor: 'pointer', borderTop: `4px solid var(--bs-${styleColor})`, transition: 'transform 0.15s, box-shadow 0.15s' }}
      onClick={() => onChoose(wrestler.id)}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.22)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <div className="card-body py-3 px-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="card-title fw-bold mb-0 text-dark" style={{ fontSize: '1.05rem' }}>{wrestler.name}</h5>
          <span className={`badge bg-${styleColor} bg-opacity-10 text-${styleColor} border border-${styleColor}`}>{wrestler.style}</span>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className={`badge bg-${badgeColor} ${badgeColor === 'warning' ? 'text-dark' : ''}`} style={{ fontSize: '0.7rem' }}>
            {primeStatus} ({age}a)
          </span>
          <span className={`badge bg-${wrestler.weightClass === 'heavy' ? 'danger' : 'info text-dark'}`} style={{ fontSize: '0.7rem' }}>
            {wrestler.weightClass?.toUpperCase()}
          </span>
        </div>
        <div className="row text-center g-0 border-top pt-2">
          {[['power','POW','danger'],['technique','TEC','primary'],['speed','SPD','warning'],['toughness','TOU','success']].map(([stat, label, color]) => (
            <div className="col-3" key={stat}>
              <div className={`fw-bold text-${color}`} style={{ fontSize: '1.05rem' }}>{getEffectiveStat(wrestler, stat, currentYear)}</div>
              <div className="text-muted" style={{ fontSize: '0.65rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card-footer bg-transparent text-center border-0 pb-3">
        <button className="btn btn-success fw-bold px-4" onClick={e => { e.stopPropagation(); onChoose(wrestler.id); }}>
          Elegir
        </button>
      </div>
    </div>
  );
};

const WorkerSelectionModal = () => {
  const { state, dispatch } = useGame();
  const promo = useActivePromotion();
  const { workerSelectionActive, workerSelectionPool, workerSelectionOptions, workerSelectionCpuLastPick } = promo ?? {};

  if (!promo || !workerSelectionActive) return null;

  const playerPicks = workerSelectionPool.filter(w => w.pickedBy === 'player');
  const cpuPicks    = workerSelectionPool.filter(w => w.pickedBy === 'cpu');
  const total = 16;
  const chosen = workerSelectionPool.length;
  const progress = (chosen / total) * 100;
  const round = playerPicks.length + 1; // ronda actual del jugador

  const handleChoose = (id) => dispatch({ type: 'CHOOSE_WORKER', payload: { chosenId: id } });
  const handleCancel = () => dispatch({ type: 'CANCEL_WORKER_SELECTION' });

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.72)', zIndex: 1050 }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">

          {/* Header */}
          <div className="modal-header bg-dark text-white py-3">
            <div className="w-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h4 className="modal-title fw-bold mb-0" style={{ color: '#faf6ed' }}>
                  Selección de Workers
                </h4>
                <span className="badge text-dark fs-6" style={{ background: '#c8b890' }}>{chosen} / {total}</span>
              </div>
              <div className="progress" style={{ height: '6px' }}>
                <div className="progress-bar bg-success" style={{ width: `${progress}%`, transition: 'width 0.3s' }} />
              </div>
              <small style={{ color: 'rgba(255,255,255,0.55)' }} className="mt-1 d-block">
                Vos elegís 1 · La CPU elige 1 · Hasta juntar 16
              </small>
            </div>
          </div>

          {/* Body */}
          <div className="modal-body py-4" style={{ background: '#f5f6fa' }}>

            {/* CPU's last pick (shown after each player choice) */}
            {workerSelectionCpuLastPick && (
              <div className="alert alert-info d-flex align-items-center gap-2 mb-4 py-2">
                <span><strong>CPU eligió:</strong> {workerSelectionCpuLastPick.name} <small className="text-muted">({workerSelectionCpuLastPick.style})</small></span>
              </div>
            )}

            {/* Las 2 opciones del jugador */}
            <h6 className="fw-bold text-uppercase text-muted mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
              Tu turno — elegí uno:
            </h6>
            {workerSelectionOptions.length >= 2 ? (
              <div className="row g-4 justify-content-center mb-4">
                <div className="col-12 col-md-5">
                  <WorkerCard wrestler={workerSelectionOptions[0]} onChoose={handleChoose} />
                </div>
                <div className="col-12 col-md-2 d-flex align-items-center justify-content-center">
                  <div className="display-4 fw-bold text-muted fst-italic">VS</div>
                </div>
                <div className="col-12 col-md-5">
                  <WorkerCard wrestler={workerSelectionOptions[1]} onChoose={handleChoose} />
                </div>
              </div>
            ) : workerSelectionOptions.length === 1 ? (
              <div className="row g-4 justify-content-center mb-4">
                <div className="col-12 col-md-5">
                  <WorkerCard wrestler={workerSelectionOptions[0]} onChoose={handleChoose} />
                </div>
              </div>
            ) : null}

            {/* Picks finales separados por jugador y CPU */}
            {workerSelectionPool.length > 0 && (
              <div className="row g-3 border-top pt-3">
                <div className="col-md-6">
                  <div className="fw-bold mb-2" style={{ fontSize: '0.8rem', color: 'var(--ink)' }}>
                    Tus picks ({playerPicks.length})
                  </div>
                  <div className="d-flex flex-wrap gap-1">
                    {playerPicks.map(w => (
                      <span key={w.id} style={{ border: '1px solid var(--ink)', padding: '2px 8px', fontFamily: 'var(--serif)', fontSize: '0.75rem', color: 'var(--ink)', background: 'transparent' }}>{w.name}</span>
                    ))}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="fw-bold mb-2" style={{ fontSize: '0.8rem', color: 'var(--ink)' }}>
                    CPU picks ({cpuPicks.length})
                  </div>
                  <div className="d-flex flex-wrap gap-1">
                    {cpuPicks.map(w => (
                      <span key={w.id} style={{ border: '1px solid var(--ink-3)', padding: '2px 8px', fontFamily: 'var(--serif)', fontSize: '0.75rem', color: 'var(--ink-3)', background: 'transparent' }}>{w.name}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer bg-white">
            <button className="btn btn-outline-secondary" onClick={handleCancel}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerSelectionModal;
