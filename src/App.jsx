import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import RosterView from './components/RosterView';
import MatchSandbox from './components/MatchSandbox';
import ShowsPage from './components/ShowsPage';
import StartScreen from './components/StartScreen';
import WorkerSelectionModal from './components/WorkerSelectionModal';
import EventAlert from './components/EventAlert';
import MonthlyNewsModal from './components/MonthlyNewsModal';
import './index.css';

const SAVE_KEY = 'wrestling_observer_state';

const hasSavedGame = () => {
  try { return !!localStorage.getItem(SAVE_KEY); } catch (_) { return false; }
};

// AppInner tiene acceso al contexto (debe estar dentro de GameProvider)
const AppInner = ({ onNewGame }) => {
  return (
    <BrowserRouter>
      {/* Modales y alertas globales — visibles en cualquier página */}
      <WorkerSelectionModal />
      <EventAlert />
      <MonthlyNewsModal />

      <div className="app-container bg-light min-vh-100 pb-5">
        <Navbar onNewGame={onNewGame} />
        <Routes>
          <Route path="/"        element={<Dashboard />} />
          <Route path="/roster"  element={<RosterView />} />
          <Route path="/shows"   element={<ShowsPage />} />
          <Route path="/sandbox" element={<MatchSandbox />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

function App() {
  const [screen, setScreen] = useState('start');

  const handleNewGameStart = () => {
    localStorage.removeItem(SAVE_KEY);
    setScreen('game');
  };

  const handleLoadGame = () => {
    if (!hasSavedGame()) return;
    setScreen('game');
  };

  if (screen === 'start') {
    return (
      <StartScreen
        hasSave={hasSavedGame()}
        onNewGame={handleNewGameStart}
        onLoadGame={handleLoadGame}
      />
    );
  }

  return (
    <GameProvider>
      <AppInner onNewGame={() => setScreen('start')} />
    </GameProvider>
  );
}

export default App;
