import React from 'react';
import { useGame } from '../context/GameContext';
import { getEffectiveStat, getPrimeStatus, calculateAge, getEffectiveLevel } from '../models/Wrestler';

const styleColors = {
  'Powerhouse': 'danger',
  'Technician': 'primary',
  'High Flyer': 'warning',
  'Brawler': 'secondary',
  'Submission Specialist': 'success',
};

const RosterView = () => {
  const { state } = useGame();
  const { currentYear, roster } = state;
  const active = roster.filter(w => w.status !== 'retired');

  return (
    <div className="container fade-in">
      <h2 className="mb-4 text-center text-uppercase fw-bold text-dark">
        Roster Activo ({currentYear})
        <span className="ms-3 fs-5 badge bg-secondary fw-normal">{active.length} luchadores</span>
      </h2>

      <div className="row g-3">
        {active.map(w => {
          const age = calculateAge(w, currentYear);
          const primeStatus = getPrimeStatus(age);
          const badgeColor = age < 28 ? 'info' : age <= 38 ? 'success' : 'warning';
          const styleColor = styleColors[w.style] || 'dark';
          const effLevel = getEffectiveLevel(w, currentYear);
          const lvlBg = effLevel >= 8 ? 'bg-success' : effLevel >= 5 ? 'bg-warning' : 'bg-danger';
          const lvlText = effLevel >= 5 && effLevel < 8 ? 'text-dark' : 'text-white';
          
          const primeBadge = {
             class: `bg-${badgeColor} ${badgeColor === 'warning' ? 'text-dark' : ''}`,
             text: primeStatus
          };

          const isUnavailable = w.status !== 'active';

          return (
            <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={w.id}>
              <div className={`card h-100 shadow-sm border-0 roster-card ${isUnavailable ? 'opacity-75 bg-light border border-warning' : ''}`} style={{borderTop: `3px solid var(--bs-${styleColor}) !important`}}>
                <div className="card-body py-3 px-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title fw-bold mb-0 text-dark d-flex align-items-center gap-2" style={{fontSize: '1.1rem'}}>
                      {w.name}
                      <span className={`badge ${lvlBg} ${lvlText}`} style={{fontSize:'0.65rem', fontWeight: 700}}>
                        LVL {effLevel}
                      </span>
                    </h5>
                    <span className={`badge bg-${styleColor} bg-opacity-10 text-${styleColor} border border-${styleColor}`}>
                      {w.style}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className={`badge ${primeBadge.class}`} style={{fontSize:'0.7rem'}}>
                      {primeBadge.text} ({age}a)
                    </span>
                    <span className={`badge bg-${w.weightClass === 'heavy' ? 'danger' : 'info text-dark'}`} style={{fontSize:'0.7rem'}}>
                      {w.weightClass.toUpperCase()}
                    </span>
                  </div>
                  
                  {isUnavailable ? (
                    <div className={`alert py-2 mb-3 small text-center fw-bold ${w.status === 'injured' ? 'alert-danger' : 'alert-warning'}`}>
                      {w.status === 'injured' ? '🏥 Lesionado' : '🚫 Suspendido'}
                       <br/><span className="fw-normal">Regresa: Mes {w.returnMonth}/{w.returnYear}</span>
                    </div>
                  ) : (
                    <div className="bg-light rounded p-2 mb-3 text-center border fw-bold text-dark">
                      PTS: {w.points || 0}
                    </div>
                  )}

                  <div className="row text-center g-0 border-top pt-2">
                    {[['power', 'POW', 'danger'], ['technique', 'TEC', 'primary'], ['speed', 'SPD', 'warning'], ['toughness', 'TOU', 'success']].map(([stat, label, color]) => (
                      <div className="col-3" key={stat}>
                        <div className={`fw-bold text-${color}`} style={{fontSize:'1.1rem'}}>
                          {getEffectiveStat(w, stat, currentYear)}
                        </div>
                        <div className="text-muted" style={{fontSize:'0.65rem'}}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {state.retiredRoster.length > 0 && (
        <div className="mt-5">
          <h5 className="text-muted text-uppercase fw-bold mb-3" style={{fontSize:'0.8rem', letterSpacing:'0.06em'}}>
            🏛️ Retirados ({state.retiredRoster.length})
          </h5>
          <div className="d-flex flex-wrap gap-2">
            {state.retiredRoster.map(w => (
              <span key={w.id} className="badge bg-secondary fw-normal px-3 py-2" style={{fontSize:'0.8rem'}}>
                {w.name} (ret. {w.retiredAt})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RosterView;
