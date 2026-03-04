import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const BELT_LABELS = {
  world:     'IWGP World Heavyweight',
  secondary: 'IWGP Intercontinental',
  junior:    'IWGP World Jr. Heavy',
  tag:       'World Tag Team',
};

const ChampionModal = ({ belt, onClose }) => {
  const { state, dispatch } = useGame();
  const [selected, setSelected] = useState(state.champions[belt]?.id ?? '');

  const handleAssign = () => {
    dispatch({ type: 'SET_CHAMPION', payload: { belt, wrestlerId: selected || null } });
    onClose();
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title" style={{ color: '#faf6ed' }}>Editar — {BELT_LABELS[belt]}</h5>
            <button className="btn-close btn-close-white" onClick={onClose} />
          </div>
          <div className="modal-body">
            <label className="form-label fw-bold">Seleccionar campeón:</label>
            <select
              className="form-select form-select-lg mb-3"
              value={selected}
              onChange={e => setSelected(e.target.value)}
            >
              <option value="">— Vacante —</option>
              {state.roster
                .filter(w => w.status === 'active')
                .map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.style})</option>
                ))
              }
            </select>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-dark" onClick={onClose}>Cancelar</button>
            <button className="btn btn-dark fw-bold" onClick={handleAssign}>Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChampionsPanel = () => {
  const { state } = useGame();
  const [editingBelt, setEditingBelt] = useState(null);

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-dark text-white fw-bold py-3">
        Campeones Actuales
      </div>
      <div className="card-body">
        <div className="row g-3">
          {Object.entries(BELT_LABELS).map(([belt, label]) => {
            const champ = state.champions[belt];
            return (
              <div className="col-6 col-md-3" key={belt}>
                <div
                  style={{
                    cursor: 'pointer',
                    borderLeft: '3px solid var(--ink)',
                    paddingLeft: '12px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    transition: 'background 0.15s',
                  }}
                  onClick={() => setEditingBelt(belt)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    fontFamily: 'var(--display)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.68rem',
                    letterSpacing: '0.1em',
                    color: 'var(--ink-3)',
                    marginBottom: '3px',
                  }}>
                    {label}
                  </div>
                  {champ ? (
                    <>
                      <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>{champ.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)', fontStyle: 'italic' }}>{champ.style}</div>
                    </>
                  ) : (
                    <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '1rem', color: 'var(--accent)' }}>Vacante</div>
                  )}
                  <div style={{ fontSize: '0.6rem', color: 'var(--ink-3)', marginTop: '3px', letterSpacing: '0.06em' }}>
                    clic para editar
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {editingBelt && (
        <ChampionModal belt={editingBelt} onClose={() => setEditingBelt(null)} />
      )}
    </div>
  );
};

export default ChampionsPanel;
