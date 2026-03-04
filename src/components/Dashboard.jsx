import YearPanel from './YearPanel';
import ChampionsPanel from './ChampionsPanel';
import { useGame } from '../context/GameContext';
import { Link } from 'react-router-dom';
import { getEffectiveLevel } from '../models/Wrestler';

const MONTH_NAMES = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const Dashboard = () => {
  const { state } = useGame();

  // Top 10 por puntos anuales
  const ranking = [...state.roster]
    .filter(w => w.status === 'active')
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, 10);

  // Últimos eventos del año
  const recentEvents = (state.eventLog || []).slice(0, 8);

  const eventSeverity = (type) => {
    if (type === 'danger')  return { label: 'BAJA',   style: { color: 'var(--accent)', fontWeight: 700 } };
    if (type === 'warning') return { label: 'AVISO',  style: { color: '#7a4f00', fontWeight: 700 } };
    if (type === 'success') return { label: 'OK',     style: { color: '#2a5e1a', fontWeight: 700 } };
    return                         { label: 'INFO',   style: { color: 'var(--ink-3)', fontWeight: 700 } };
  };

  return (
    <div className="container fade-in">
      <YearPanel />
      <ChampionsPanel />

      <div className="row g-4">
        {/* Ranking */}
        <div className="col-md-7">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <span className="fw-bold" style={{ color: '#faf6ed' }}>WON Wrestler of the Year</span>
              <Link to="/roster" className="btn btn-sm btn-outline-light">Ver Roster</Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Luchador</th>
                    <th>Estilo</th>
                    <th>Clase</th>
                    <th className="text-center">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.length === 0 && (
                    <tr><td colSpan={5} className="text-center text-muted py-4">Sin combates registrados.</td></tr>
                  )}
                  {ranking.map((w, i) => {
                    const effLevel = getEffectiveLevel(w, state.currentYear);
                    const lvlBg = effLevel >= 8 ? 'bg-success' : effLevel >= 5 ? 'bg-warning' : 'bg-danger';
                    const lvlText = effLevel >= 5 && effLevel < 8 ? 'text-dark' : 'text-white';
                    return (
                    <tr key={w.id}>
                      <td className="fw-bold text-muted">{i + 1}</td>
                      <td className="fw-medium">
                        {i === 0 && <strong className="me-1" style={{color:'var(--accent)'}}>I.</strong>}
                        {i === 1 && <strong className="me-1" style={{color:'var(--ink-2)'}}>II.</strong>}
                        {i === 2 && <strong className="me-1" style={{color:'var(--ink-2)'}}>III.</strong>}
                        {w.name}
                        <span className={`ms-2 badge ${lvlBg} ${lvlText}`} style={{fontSize:'0.6rem', fontWeight: 700}}>
                          LVL {effLevel}
                        </span>
                      </td>
                      <td><small className="text-muted">{w.style}</small></td>
                      <td>
                        <span className={`badge ${w.weightClass === 'heavy' ? 'bg-danger' : 'bg-info text-dark'}`}>
                          {w.weightClass}
                        </span>
                      </td>
                      <td className="text-center"><span className="badge bg-dark">{w.points || 0}</span></td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Últimos Eventos */}
        <div className="col-md-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <span className="fw-bold" style={{ color: '#faf6ed' }}>Últimos Eventos</span>
              <Link to="/sandbox" className="btn btn-sm btn-outline-light">Historial</Link>
            </div>
            <ul className="list-group list-group-flush">
              {recentEvents.length === 0 && (
                <li className="list-group-item text-muted text-center py-5">
                  <div style={{ fontFamily: 'var(--display)', fontSize: '1rem', letterSpacing: '0.1em', textTransform:'uppercase' }}>Sin eventos</div>
                  <small>Los eventos aparecen al avanzar mes o año.</small>
                </li>
              )}
              {recentEvents.map(ev => {
                const sev = eventSeverity(ev.type);
                return (
                <li key={ev.id} className="list-group-item py-3">
                  <div className="d-flex gap-2 align-items-start">
                    <span style={{ ...sev.style, fontSize:'0.65rem', letterSpacing:'0.08em', minWidth:'36px', paddingTop:'2px' }}>{sev.label}</span>
                    <div>
                      <div className="fw-medium" style={{ fontSize: '0.9rem' }}>{ev.text}</div>
                      {ev.month && (
                        <small className="text-muted">
                          {ev.year} — {MONTH_NAMES[ev.month] || `Mes ${ev.month}`}
                        </small>
                      )}
                    </div>
                  </div>
                </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
