import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGame, SPECIAL_MONTHS } from '../context/GameContext';
import ConfirmModal from './ConfirmModal';
import { calculateAge } from '../models/Wrestler';

const MONTH_NAMES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const NAV_LINKS = [
  { to: '/',        label: 'Dashboard' },
  { to: '/roster',  label: 'Roster'    },
  { to: '/shows',   label: 'Shows'     },
  { to: '/sandbox', label: 'Historial' },
];

const Navbar = () => {
  const location = useLocation();
  const { state, dispatch } = useGame();
  const [confirm, setConfirm] = React.useState(null);
  const openConfirm = (opts) => setConfirm(opts);
  const closeConfirm = () => setConfirm(null);

  const handleAdvanceMonth = () => {
    if (state.currentMonth >= 12) return;
    openConfirm({
      title: `¿Avanzar a ${MONTH_NAMES[state.currentMonth + 1]}?`,
      message: 'Los shows y workers del mes actual se reiniciarán.',
      confirmLabel: 'Avanzar',
      confirmVariant: 'btn-dark',
      onConfirm: () => { dispatch({ type: 'ADVANCE_MONTH' }); closeConfirm(); },
    });
  };

  const handleAdvanceYear = () => {
    openConfirm({
      title: `¿Avanzar al año ${state.currentYear + 1}?`,
      message: 'Se procesarán retiros y eventos de fin de año. Esta acción no se puede deshacer.',
      confirmLabel: `Avanzar a ${state.currentYear + 1}`,
      confirmVariant: 'btn-dark',
      onConfirm: () => { dispatch({ type: 'ADVANCE_YEAR' }); closeConfirm(); },
    });
  };

  return (
    <>
      {confirm && (
        <ConfirmModal
          open={true}
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          confirmVariant={confirm.confirmVariant}
          onConfirm={confirm.onConfirm}
          onCancel={closeConfirm}
        />
      )}

      <header className="wo-header">
        <div className="wo-top-rule" />

        <div className="wo-masthead-row container">
          {/* Left: edition */}
          <div className="wo-edition">
            <span>Vol. {state.currentYear - 1979}</span>
            <span>Edición mensual</span>
            <span>Japón</span>
          </div>

          {/* Center: title */}
          <Link to="/" className="wo-title">Wrestling Observer</Link>

          {/* Right: clickable date */}
          <div className="wo-date">
            <span
              className="wo-date-month"
              onClick={handleAdvanceMonth}
              title={state.currentMonth < 12 ? `Avanzar a ${MONTH_NAMES[state.currentMonth + 1]}` : 'Diciembre — fin de año'}
              style={{ cursor: state.currentMonth < 12 ? 'pointer' : 'default', userSelect: 'none' }}
            >
              {MONTH_NAMES[state.currentMonth]}
            </span>
            <span
              className="wo-date-year"
              onClick={handleAdvanceYear}
              title={`Avanzar al año ${state.currentYear + 1}`}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              {state.currentYear}
            </span>
          </div>
        </div>

        <div className="wo-bottom-rule" />

        <nav className="wo-nav container">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`wo-nav-link ${location.pathname === to ? 'wo-nav-active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="wo-nav-rule" />
      </header>
    </>
  );
};

export default Navbar;
