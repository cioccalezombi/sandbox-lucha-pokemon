import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGame, getActivePromotions } from '../context/GameContext';
import { getPromoShortName, getPromoName } from '../data/promotions';
import ConfirmModal from './ConfirmModal';

const MONTH_NAMES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const [confirm, setConfirm] = React.useState(null);
  const openConfirm = (opts) => setConfirm(opts);
  const closeConfirm = () => setConfirm(null);

  const activePromotions = getActivePromotions(state.currentYear);
  const hasPromo = !!state.activePromotionId;

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

  const handleSelectPromotion = (id) => {
    dispatch({ type: 'SET_ACTIVE_PROMOTION', payload: { promotionId: id } });
    // If deselecting (going to global), redirect to portada
    if (id === state.activePromotionId) {
      navigate('/');
    }
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
          <Link to="/" className="wo-title" onClick={() => dispatch({ type: 'SET_ACTIVE_PROMOTION', payload: { promotionId: null } })}>
            Wrestling Observer
          </Link>

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

        {/* Nav + promo tabs combined */}
        <nav className="wo-nav container">
          {/* Portada — siempre visible, lleva a la portada global */}
          <Link
            to="/"
            className={`wo-nav-link ${location.pathname === '/' && !hasPromo ? 'wo-nav-active' : ''}`}
            onClick={() => dispatch({ type: 'SET_ACTIVE_PROMOTION', payload: { promotionId: null } })}
          >
            Portada
          </Link>

          {/* Separador visual */}
          <div className="wo-nav-sep" />

          {/* Promo tabs en la misma fila */}
          {activePromotions.map(promo => {
            const tabName = getPromoShortName(promo, state.currentYear, state.currentMonth);
            const fullName = getPromoName(promo, state.currentYear, state.currentMonth);
            return (
              <button
                key={promo.id}
                className={`wo-nav-link wo-promo-inline ${state.activePromotionId === promo.id ? 'wo-nav-active' : ''}`}
                onClick={() => handleSelectPromotion(promo.id)}
                title={state.activePromotionId === promo.id ? `Deseleccionar ${tabName}` : `Ver ${fullName}`}
              >
                {tabName}
              </button>
            );
          })}

          {/* Links contextuales — solo cuando hay promo activa */}
          {hasPromo && (
            <>
              <div className="wo-nav-sep" />
              <Link
                to="/roster"
                className={`wo-nav-link ${location.pathname === '/roster' ? 'wo-nav-active' : ''}`}
              >
                Roster
              </Link>
              <Link
                to="/shows"
                className={`wo-nav-link ${location.pathname === '/shows' ? 'wo-nav-active' : ''}`}
              >
                Shows
              </Link>
              <Link
                to="/sandbox"
                className={`wo-nav-link ${location.pathname === '/sandbox' ? 'wo-nav-active' : ''}`}
              >
                Historial
              </Link>
            </>
          )}
        </nav>

        <div className="wo-nav-rule" />
      </header>
    </>
  );
};

export default Navbar;
