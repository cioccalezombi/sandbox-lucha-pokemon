import React from 'react';
import { useGame } from '../context/GameContext';

const EventLogPanel = () => {
  const { state } = useGame();
  const { eventLog } = state;

  if (!eventLog || eventLog.length === 0) return null;

  return (
    <div className="card shadow-sm border-0 mb-4 fade-in">
      <div className="card-header bg-dark text-white fw-bold py-3">
        📰 Últimas Noticias y Eventos
      </div>
      <div className="card-body bg-light p-0" style={{ maxHeight: '250px', overflowY: 'auto' }}>
        <ul className="list-group list-group-flush">
          {eventLog.slice(0, 5).map(event => (
            <li key={event.id} className={`list-group-item list-group-item-${event.type || 'light'} d-flex align-items-center`}>
              <div>{event.text}</div>
            </li>
          ))}
        </ul>
        {eventLog.length > 5 && (
          <div className="text-center p-2 small text-muted bg-white border-top">
            Muestra los últimos 5 eventos.
          </div>
        )}
      </div>
    </div>
  );
};

export default EventLogPanel;
