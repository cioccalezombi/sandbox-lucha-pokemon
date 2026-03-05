import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getRosterForYear as getNJPWRoster, roster1980 as njpwRoster1980 } from '../data/njpw/index';
import { getRosterForYear as getAJPWRoster, roster1980 as ajpwRoster1980 } from '../data/ajpw/index';
import { getRosterForYear as getWWFRoster, roster1980 as wwfRoster1980 } from '../data/wwf/index';
import { PROMOTIONS, getActivePromotions, getPromotion, US_CITIES, getSeriesForYearMonth, getTitleName } from '../data/promotions';
import { getRosterForYear as getJCPRoster, roster1980 as jcpRoster1980 } from '../data/jcp/index';
import { calculateAge, getAgeModifier, getEffectiveLevel } from '../models/Wrestler';
import { generateEliminationTournament, generateRoundRobinTournament, generateTagRoundRobin } from '../models/TournamentModel';

// ─── Re-export for consumers who imported from here ─────────────────────────
export { PROMOTIONS, getActivePromotions, getPromotion };

// Keep back-compat exports for legacy imports (e.g. Navbar)
export const NJPW_SERIES = PROMOTIONS.find(p => p.id === 'njpw').series;
export const SPECIAL_MONTHS = PROMOTIONS.find(p => p.id === 'njpw').specialMonths;

// ─── Roster loaders per promotion ────────────────────────────────────────────
const ROSTER_LOADERS = {
  njpw: { getForYear: getNJPWRoster, base: njpwRoster1980 },
  ajpw: { getForYear: getAJPWRoster, base: ajpwRoster1980 },
  wwf:  { getForYear: getWWFRoster,  base: wwfRoster1980  },
  jcp:  { getForYear: getJCPRoster,  base: jcpRoster1980  },
};

// ─── Estado inicial de una sola promoción ────────────────────────────────────
const makePromoState = (promotionId) => {
  const loader = ROSTER_LOADERS[promotionId];
  const base = loader ? loader.base.map(w => ({ ...w, points: 0, monthlyPoints: 0 })) : [];
  return {
    roster: base,
    retiredRoster: [],
    champions: { world: null, secondary: null, junior: null, tag: null },
    monthlyWorkers: [],
    monthlyShows: [],
    currentShowIndex: 0,
    activeTournament: null,
    eventLog: [],
    matchLog: [],
    yearHistory: [],
    monthlyEventSeries: null,
    recentEvent: null,
    pendingMonthEvents: [],
    workerSelectionActive: false,
    workerSelectionPool: [],
    workerSelectionOptions: [],
    workerSelectionAvailable: [],
    workerSelectionCpuLastPick: null,
    g1DraftActive: false,
    g1DraftSelected: [],
    g1DraftOptions: [],
    g1DraftAvailable: [],
    g1DraftTarget: 10,
  };
};

// ─── Estado global inicial ────────────────────────────────────────────────────
const INITIAL_STATE = {
  currentYear: 1980,
  currentMonth: 1,
  phase: 'booking',
  activePromotionId: null,   // null = vista global (portada)
  globalNewsFeed: [],        // noticias persistentes de todas las promociones
  promotions: {
    njpw: makePromoState('njpw'),
    ajpw: makePromoState('ajpw'),
    wwf:  makePromoState('wwf'),
    jcp:  makePromoState('jcp'),
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandom = (arr, n) => {
  const copy = [...arr];
  const picked = [];
  while (picked.length < n && copy.length > 0) {
    const idx = randomInt(0, copy.length - 1);
    picked.push(copy.splice(idx, 1)[0]);
  }
  return picked;
};

const shouldRetire = (wrestler, currentYear) => {
  const age = calculateAge(wrestler, currentYear);
  if (age >= 50) return true;
  if (age >= 45 && Math.random() < 0.25) return true;
  if (wrestler.retirementYear && wrestler.retirementYear <= currentYear) return true;
  return false;
};

// ─── Plantillas de eventos ────────────────────────────────────────────────────
const m = (x) => `${x} ${x === 1 ? 'mes' : 'meses'}`;

const INJURY_LEVE = [
  (n,x)=>`${n} se torció el tobillo y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una distensión muscular en el muslo y estará fuera ${m(x)}.`,
  (n,x)=>`${n} se lastimó la rodilla durante un combate y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una contractura en la espalda y estará fuera ${m(x)}.`,
  (n,x)=>`${n} se golpeó el hombro y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió un tirón en el bíceps y estará fuera ${m(x)}.`,
  (n,x)=>`${n} se lesionó el cuello durante un entrenamiento y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una contusión en las costillas y estará fuera ${m(x)}.`,
  (n,x)=>`${n} se lastimó la muñeca y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una distensión en el gemelo y estará fuera ${m(x)}.`,
];

const INJURY_MODERADA = [
  (n,x)=>`${n} sufrió un esguince de rodilla y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una luxación de hombro y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una lesión en los ligamentos del tobillo y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una fisura en una costilla y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una distensión severa en el muslo y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una lesión en el manguito rotador y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una lesión en la espalda que requerirá rehabilitación y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió un desgarro muscular en el cuádriceps y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una lesión en el cuello tras un mal aterrizaje y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una fractura menor en la mano y estará fuera ${m(x)}.`,
];

const INJURY_GRAVE = [
  (n,x)=>`${n} sufrió una rotura de ligamentos en la rodilla y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una fractura de brazo y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una fractura de pierna y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una lesión grave en la espalda y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una rotura del tendón de Aquiles y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una rotura del manguito rotador y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una lesión grave en el cuello y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una fractura en varias costillas y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una rotura de ligamentos cruzados y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una lesión grave en la cadera y estará fuera ${m(x)}.`,
];

const INJURY_GRAVISIMA = [
  (n,x)=>`${n} sufrió graves lesiones tras un accidente automovilístico y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} sufrió múltiples fracturas en un choque de moto y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} sufrió graves lesiones tras ser apuñalado en una pelea callejera y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} sufrió daños severos tras ser atropellado por un automóvil y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
];

const SUSPENSION_TEMPLATES = [
  (n,x)=>`${n} fue suspendido por conducta antideportiva y estará fuera ${m(x)}.`,
  (n,x)=>`${n} fue suspendido tras protagonizar un altercado backstage y estará fuera ${m(x)}.`,
  (n,x)=>`${n} fue suspendido por incumplir el reglamento de la empresa y estará fuera ${m(x)}.`,
  (n,x)=>`${n} fue suspendido tras un incidente con un árbitro y estará fuera ${m(x)}.`,
  (n,x)=>`${n} fue suspendido por conducta inapropiada fuera del ring y estará fuera ${m(x)}.`,
  (n,x)=>`${n} fue suspendido tras una pelea con otro luchador y estará fuera ${m(x)}.`,
  (n,x)=>`${n} fue suspendido por indisciplina y estará fuera ${m(x)}.`,
  (n,x)=>`${n} fue suspendido por comportamiento inapropiado durante un evento y estará fuera ${m(x)}.`,
  (n,x)=>`${n} fue suspendido tras causar disturbios en backstage y estará fuera ${m(x)}.`,
  (n,x)=>`${n} fue suspendido por ignorar instrucciones oficiales y estará fuera ${m(x)}.`,
];

const CAREER_END_TEMPLATES = [
  (n)=>`${n} fue arrestado por sus vínculos con la yakuza. Su carrera ha terminado.`,
  (n)=>`${n} fue condenado por un caso grave de violencia doméstica. Su carrera ha terminado.`,
  (n)=>`${n} fue declarado culpable en un caso de homicidio. Su carrera ha terminado.`,
  (n)=>`${n} fue arrestado tras un violento incidente armado en un bar. Su carrera ha terminado.`,
  (n)=>`${n} fue condenado por participar en actividades del crimen organizado. Su carrera ha terminado.`,
  (n)=>`${n} fue arrestado por intento de asesinato tras una pelea fuera del ring. Su carrera ha terminado.`,
];

const pick = (arr) => arr[randomInt(0, arr.length - 1)];

// ─── Procesador de eventos (aplica a un estado de promoción) ─────────────────
const processEvents = (currentRoster, currentChampions, eventLog, nextMonth, nextYear) => {
  let newRoster = [...currentRoster];
  let newEvents = [];
  let newChampions = { ...currentChampions };
  let careerEnded = [];

  newRoster = newRoster.map(w => {
    if (w.status !== 'active' && w.returnMonth === nextMonth && w.returnYear === nextYear) {
      newEvents.push({ id: Date.now()+Math.random(), text: `${w.name} regresó a la acción tras su ausencia.`, type: 'success', eventType: 'return', year: nextYear, month: nextMonth });
      return { ...w, status: 'active', returnMonth: null, returnYear: null };
    }
    return w;
  });

  const vacateChampion = (victim) => {
    Object.keys(newChampions).forEach(belt => {
      if (newChampions[belt]?.id === victim.id) {
        newChampions[belt] = null;
        newEvents.push({ id: Date.now()+Math.random(), text: `El Campeonato ${belt.toUpperCase()} ha sido declarado VACANTE por la baja de ${victim.name}.`, type: 'warning', eventType: 'titleVacant', year: nextYear, month: nextMonth });
      }
    });
  };

  const setInjured = (wrestler, duration, extraFields = {}) => {
    let rMonth = nextMonth + duration, rYear = nextYear;
    while (rMonth > 12) { rMonth -= 12; rYear += 1; }
    newRoster = newRoster.map(w => w.id === wrestler.id
      ? { ...w, status: 'injured', returnMonth: rMonth, returnYear: rYear, ...extraFields }
      : w);
  };

  const activeWrestlers = newRoster.filter(w => w.status === 'active');
  if (Math.random() < 0.20 && activeWrestlers.length > 0) {
    const victim = pick(activeWrestlers);
    const roll = Math.random();

    if (roll < 0.30) {
      const dur = randomInt(1, 3);
      newEvents.push({ id: Date.now()+Math.random(), text: pick(INJURY_LEVE)(victim.name, dur), type: 'warning', eventType: 'leve', year: nextYear, month: nextMonth });
      setInjured(victim, dur);
    } else if (roll < 0.55) {
      const dur = randomInt(2, 5);
      newEvents.push({ id: Date.now()+Math.random(), text: pick(INJURY_MODERADA)(victim.name, dur), type: 'warning', eventType: 'moderada', year: nextYear, month: nextMonth });
      setInjured(victim, dur);
      if (dur >= 3) vacateChampion(victim);
    } else if (roll < 0.73) {
      const dur = randomInt(4, 8);
      newEvents.push({ id: Date.now()+Math.random(), text: pick(INJURY_GRAVE)(victim.name, dur), type: 'danger', eventType: 'grave', year: nextYear, month: nextMonth });
      setInjured(victim, dur);
      vacateChampion(victim);
    } else if (roll < 0.80) {
      const dur = randomInt(6, 12);
      newEvents.push({ id: Date.now()+Math.random(), text: pick(INJURY_GRAVISIMA)(victim.name, dur), type: 'danger', eventType: 'gravisima', year: nextYear, month: nextMonth });
      const existingPenalty = victim.permanentPenalty ?? 1.0;
      setInjured(victim, dur, { permanentPenalty: Math.round(existingPenalty * 0.85 * 100) / 100 });
      vacateChampion(victim);
    } else if (roll < 0.95) {
      const dur = randomInt(1, 4);
      newEvents.push({ id: Date.now()+Math.random(), text: pick(SUSPENSION_TEMPLATES)(victim.name, dur), type: 'warning', eventType: 'suspension', year: nextYear, month: nextMonth });
      let rMonth = nextMonth + dur, rYear = nextYear;
      while (rMonth > 12) { rMonth -= 12; rYear += 1; }
      newRoster = newRoster.map(w => w.id === victim.id ? { ...w, status: 'suspended', returnMonth: rMonth, returnYear: rYear } : w);
      if (dur >= 3) vacateChampion(victim);
    } else {
      newEvents.push({ id: Date.now()+Math.random(), text: pick(CAREER_END_TEMPLATES)(victim.name), type: 'danger', eventType: 'careerEnd', year: nextYear, month: nextMonth });
      careerEnded.push({ ...victim, retiredAt: nextYear });
      newRoster = newRoster.filter(w => w.id !== victim.id);
      vacateChampion(victim);
    }
  }

  const allEvents = [...newEvents, ...(eventLog || [])].slice(0, 50);
  return { newRoster, careerEnded, newChampions, newLog: allEvents, newEvents };
};

// ─── Show generation ─────────────────────────────────────────────────────────
const generateShows = (workers, series) => {
  const shuffled = [...workers].sort(() => Math.random() - 0.5);
  const shows = [];
  for (let i = 0; i < 7; i++) {
    const pool = [...shuffled].sort(() => Math.random() - 0.5);
    let idx = 0;
    const next = () => { const w = pool[idx % pool.length]; idx++; return w; };
    const matches = [];
    for (let t = 0; t < 2; t++) {
      const a1 = next(), a2 = next(), b1 = next(), b2 = next();
      matches.push({ id: `show${i}_tag${t}`, type: 'tag', teamA: [a1, a2], teamB: [b1, b2], winningSide: null });
    }
    for (let s = 0; s < 4; s++) {
      const wA = next(), wB = next();
      matches.push({ id: `show${i}_single${s}`, type: 'singles', wrestlerA: wA, wrestlerB: wB, winnerId: null });
    }
    const pickCity = () => US_CITIES[Math.floor(Math.random() * US_CITIES.length)];
    const label = series?.locationBased
      ? `${series.weeklyPrefix} in ${pickCity()}`
      : series ? `${series.weeklyPrefix} Tag ${i + 1}` : `Show ${i + 1}`;
    shows.push({ index: i, label, matches });
  }
  return shows;
};

const generateShowGrande = (roster, champions, series, promotionId, year, month) => {
  const promo = getPromotion(promotionId);
  const ranking = [...roster]
    .filter(w => w.status === 'active')
    .sort((a, b) => (b.monthlyPoints || 0) - (a.monthlyPoints || 0));

  const champIds = Object.values(champions).filter(Boolean).map(c => c.id);
  const challengers = ranking.filter(w => !champIds.includes(w.id));

  const usedIds = new Set();
  const nextChallenger = () => {
    const c = challengers.find(w => !usedIds.has(w.id));
    if (c) usedIds.add(c.id);
    return c ?? null;
  };

  // Use getTitleName so belts update when JCP→WCW or WWF→WWE renames happen
  const worldTitle     = getTitleName(promo, 'world',     year ?? 2000, month ?? 1);
  const secondaryTitle = getTitleName(promo, 'secondary', year ?? 2000, month ?? 1);

  let worldMatch = null;
  if (champions.world) {
    const c1 = nextChallenger();
    if (c1) worldMatch = { id: 'sg_world', type: 'title', belt: 'world', title: worldTitle, wrestlerA: champions.world, wrestlerB: c1, winnerId: null };
  } else {
    const c1 = nextChallenger(), c2 = nextChallenger();
    if (c1 && c2) worldMatch = { id: 'sg_world', type: 'title', belt: 'world', title: `${worldTitle} (Vacante)`, wrestlerA: c1, wrestlerB: c2, winnerId: null };
  }

  let secondaryMatch = null;
  if (champions.secondary) {
    const c1 = nextChallenger();
    if (c1) secondaryMatch = { id: 'sg_secondary', type: 'title', belt: 'secondary', title: secondaryTitle, wrestlerA: champions.secondary, wrestlerB: c1, winnerId: null };
  } else {
    const c1 = nextChallenger(), c2 = nextChallenger();
    if (c1 && c2) secondaryMatch = { id: 'sg_secondary', type: 'title', belt: 'secondary', title: `${secondaryTitle} (Vacante)`, wrestlerA: c1, wrestlerB: c2, winnerId: null };
  }

  const s1 = nextChallenger(), s2 = nextChallenger();
  const semiMain = (s1 && s2)
    ? { id: 'sg_semimain', type: 'singles', title: 'Semi-Estelar', wrestlerA: s1, wrestlerB: s2, winnerId: null }
    : null;

  const t1 = nextChallenger(), t2 = nextChallenger(), t3 = nextChallenger(), t4 = nextChallenger();
  const tagMatch = (t1 && t2 && t3 && t4)
    ? { id: 'sg_tag', type: 'tag', title: 'Lucha Tag', teamA: [t1, t2], teamB: [t3, t4], winningSide: null }
    : null;

  const label = series ? series.grandeLabel : 'Show Grande';
  return {
    index: 7,
    label,
    isGrande: true,
    matches: [worldMatch, secondaryMatch, semiMain, tagMatch].filter(Boolean),
  };
};

// ─── Helper para mutar el estado de una promoción dentro del state global ─────
// Retorna un nuevo state con la promoción `id` actualizada con `newPromoState`.
const withPromo = (state, id, newPromoState) => ({
  ...state,
  promotions: {
    ...state.promotions,
    [id]: newPromoState,
  },
});

// Shortcut: get current active promo state
const activePromo = (state) => state.promotions[state.activePromotionId];

// ─── Reducer ─────────────────────────────────────────────────────────────────
function gameReducer(state, action) {
  // Actions that affect a specific promotion use action.promotionId (defaults to active)
  const pid = action.promotionId ?? state.activePromotionId;
  const promo = state.promotions[pid];

  switch (action.type) {
    case 'LOAD_STATE':
      return { ...action.payload };

    case 'SET_ACTIVE_PROMOTION': {
      const { promotionId } = action.payload;
      // Toggle: si ya es la activa, deselecciona (null = vista global)
      if (promotionId === state.activePromotionId) {
        return { ...state, activePromotionId: null };
      }
      // null explícito = forzar vista global
      if (promotionId === null) {
        return { ...state, activePromotionId: null };
      }
      if (!state.promotions[promotionId]) return state;
      return { ...state, activePromotionId: promotionId };
    }

    case 'LOG_RESULT': {
      const { winnerId, loserId, matchType, month, year } = action.payload;
      const newLog = [{ id: Date.now(), year: year ?? state.currentYear, month: month ?? state.currentMonth, winnerId, loserId, matchType: matchType ?? 'singles', time: new Date().toLocaleTimeString() }, ...promo.matchLog];
      const newRoster = promo.roster.map(w =>
        w.id === winnerId ? { ...w, points: (w.points || 0) + 1, monthlyPoints: (w.monthlyPoints || 0) + 1 } : w
      );
      return withPromo(state, pid, { ...promo, matchLog: newLog, roster: newRoster });
    }

    case 'START_WORKER_SELECTION':
    case 'SELECT_MONTHLY_WORKERS': {
      const champExcludeIds = new Set(
        ['world', 'secondary'].map(k => promo.champions[k]?.id).filter(Boolean)
      );
      const available = promo.roster.filter(w => w.status === 'active' && !champExcludeIds.has(w.id));
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      const options = shuffled.slice(0, Math.min(2, shuffled.length));
      const remaining = shuffled.slice(options.length);
      return withPromo(state, pid, {
        ...promo,
        workerSelectionActive: true,
        workerSelectionPool: [],
        workerSelectionOptions: options,
        workerSelectionAvailable: remaining,
        workerSelectionCpuLastPick: null,
        monthlyWorkers: [],
        monthlyShows: [],
        currentShowIndex: 0,
        monthlyEventSeries: null,
      });
    }

    case 'CHOOSE_WORKER': {
      const { chosenId } = action.payload;
      const chosen = promo.workerSelectionOptions.find(w => w.id === chosenId);
      const rejected = promo.workerSelectionOptions.find(w => w.id !== chosenId);

      const champExcludeIds = new Set(
        ['world', 'secondary'].map(k => promo.champions[k]?.id).filter(Boolean)
      );

      let newAvailable = [...promo.workerSelectionAvailable];
      if (rejected && !champExcludeIds.has(rejected.id)) {
        const insertAt = randomInt(0, newAvailable.length);
        newAvailable.splice(insertAt, 0, rejected);
      }

      let cpuPick = null;
      if (newAvailable.length > 0) {
        const cpuIdx = randomInt(0, newAvailable.length - 1);
        cpuPick = newAvailable[cpuIdx];
        newAvailable.splice(cpuIdx, 1);
      }

      const newPool = [
        ...promo.workerSelectionPool,
        { ...chosen, pickedBy: 'player' },
        ...(cpuPick ? [{ ...cpuPick, pickedBy: 'cpu' }] : []),
      ];

      const targetCount = 16;

      if (newPool.length >= targetCount || newAvailable.length === 0) {
        const workers = newPool.slice(0, targetCount);
        const cleanWorkers = workers.map(({ pickedBy: _, ...w }) => w);
        const promoConfig = getPromotion(pid);
        const pool = getSeriesForYearMonth(promoConfig, state.currentYear, state.currentMonth);
        const series = pool[randomInt(0, pool.length - 1)];
        const shows = generateShows(cleanWorkers, series);
        return withPromo(state, pid, {
          ...promo,
          workerSelectionActive: false,
          workerSelectionPool: [],
          workerSelectionOptions: [],
          workerSelectionAvailable: [],
          workerSelectionCpuLastPick: cpuPick,
          monthlyWorkers: cleanWorkers,
          monthlyEventSeries: series,
          monthlyShows: shows,
          currentShowIndex: 0,
        });
      }

      const nextOptions = newAvailable.slice(0, Math.min(2, newAvailable.length));
      const nextAvailable = newAvailable.slice(nextOptions.length);

      return withPromo(state, pid, {
        ...promo,
        workerSelectionPool: newPool,
        workerSelectionOptions: nextOptions,
        workerSelectionAvailable: nextAvailable,
        workerSelectionCpuLastPick: cpuPick,
      });
    }

    case 'CANCEL_WORKER_SELECTION': {
      return withPromo(state, pid, {
        ...promo,
        workerSelectionActive: false,
        workerSelectionPool: [],
        workerSelectionOptions: [],
        workerSelectionAvailable: [],
        workerSelectionCpuLastPick: null,
      });
    }

    case 'GENERATE_SHOWS': {
      if (promo.monthlyWorkers.length < 4) return state;
      const series = promo.monthlyEventSeries;
      const shows = generateShows(promo.monthlyWorkers, series);
      return withPromo(state, pid, { ...promo, monthlyShows: shows, currentShowIndex: 0 });
    }

    case 'ADVANCE_SHOW': {
      const nextIndex = promo.currentShowIndex + 1;
      if (nextIndex === 7) {
        const sg = generateShowGrande(promo.roster, promo.champions, promo.monthlyEventSeries, pid, state.currentYear, state.currentMonth);
        return withPromo(state, pid, {
          ...promo,
          currentShowIndex: 7,
          monthlyShows: [...promo.monthlyShows.filter(s => !s.isGrande), sg],
        });
      }
      return withPromo(state, pid, { ...promo, currentShowIndex: nextIndex });
    }

    case 'GENERATE_SHOW_GRANDE': {
      const sg = generateShowGrande(promo.roster, promo.champions, promo.monthlyEventSeries, pid, state.currentYear, state.currentMonth);

      return withPromo(state, pid, {
        ...promo,
        monthlyShows: [...promo.monthlyShows.filter(s => !s.isGrande), sg],
        currentShowIndex: 7,
      });
    }

    case 'SET_CURRENT_SHOW':
      return withPromo(state, pid, { ...promo, currentShowIndex: action.payload });

    case 'RESOLVE_SHOW_MATCH': {
      const { showIndex, matchId, winnerId, winningSide } = action.payload;

      const origShow = promo.monthlyShows.find(s => s.index === showIndex);
      const origMatch = origShow?.matches.find(m => m.id === matchId);

      const updatedShows = promo.monthlyShows.map(show => {
        if (show.index !== showIndex) return show;
        return {
          ...show,
          matches: show.matches.map(m => {
            if (m.id !== matchId) return m;
            return m.type === 'tag' ? { ...m, winningSide } : { ...m, winnerId };
          }),
        };
      });

      let newRoster = [...promo.roster];
      if (winnerId) {
        newRoster = newRoster.map(w =>
          w.id === winnerId ? { ...w, points: (w.points || 0) + 1, monthlyPoints: (w.monthlyPoints || 0) + 1 } : w
        );
      }
      if (winningSide) {
        const match = origMatch;
        if (match) {
          const team = winningSide === 'A' ? match.teamA : match.teamB;
          team.forEach(member => {
            if (!member) return;
            newRoster = newRoster.map(w =>
              w.id === member.id ? { ...w, points: (w.points || 0) + 1, monthlyPoints: (w.monthlyPoints || 0) + 1 } : w
            );
          });
        }
      }

      let newChampions = { ...promo.champions };
      let recentEvent = promo.recentEvent;
      if (origMatch?.belt && winnerId) {
        const champWrestler = newRoster.find(w => w.id === winnerId);
        if (champWrestler) {
          const wasChamp = promo.champions[origMatch.belt];
          newChampions[origMatch.belt] = champWrestler;
          recentEvent = wasChamp && wasChamp.id === champWrestler.id
            ? { type: 'title', message: ` ${champWrestler.name} defiende exitosamente su título.` }
            : { type: 'title', message: ` ¡${champWrestler.name} se convierte en el nuevo Campeón!` };
        }
      }

      const getWinnerName = () => {
        if (winnerId) return newRoster.find(w => w.id === winnerId)?.name ?? 'Desconocido';
        if (winningSide && origMatch) {
          const team = winningSide === 'A' ? origMatch.teamA : origMatch.teamB;
          return team?.map(w => w?.name).filter(Boolean).join(' & ') ?? 'Equipo';
        }
        return 'Desconocido';
      };
      const getLoserName = () => {
        if (winnerId && origMatch?.wrestlerA && origMatch?.wrestlerB) {
          const loser = origMatch.wrestlerA?.id === winnerId ? origMatch.wrestlerB : origMatch.wrestlerA;
          return loser?.name ?? '';
        }
        if (winningSide && (origMatch?.type === 'tag' || origMatch?.teamA)) {
          const team = winningSide === 'A' ? origMatch.teamB : origMatch.teamA;
          return team?.map(w => w?.name).filter(Boolean).join(' & ') ?? '';
        }
        return '';
      };

      const logEntry = {
        id: Date.now()+Math.random(),
        year: state.currentYear, month: state.currentMonth,
        isTitleMatch: !!origMatch?.belt,
        isTournamentFinal: false,
        belt: origMatch?.belt ?? null,
        title: origMatch?.title ?? null,
        winnerName: getWinnerName(),
        loserName: getLoserName(),
        showIndex, matchId,
        winnerId: winnerId||null, winningSide: winningSide||null,
        time: new Date().toLocaleTimeString(),
      };

      // Push title match results to the global news feed
      let newGlobalFeed = state.globalNewsFeed || [];
      if (origMatch?.belt) {
        const promoConfig = getPromotion(pid);
        const promoShortName = promoConfig?.shortName ?? pid.toUpperCase();
        const beltLabel = promoConfig?.titles?.[origMatch.belt] ?? origMatch.title ?? origMatch.belt;
        const winnerN = logEntry.winnerName;
        const loserN = logEntry.loserName;
        const newsText = loserN
          ? `${winnerN} vence a ${loserN} por el ${beltLabel}`
          : `${winnerN} retiene el ${beltLabel}`;
        const newsEntry = {
          id: logEntry.id,
          eventType: 'titleMatch',
          text: newsText,
          month: state.currentMonth,
          year: state.currentYear,
          promoId: pid,
          promoShortName,
        };
        newGlobalFeed = [newsEntry, ...newGlobalFeed].slice(0, 200);
      }

      const stateWithPromo = withPromo(state, pid, {
        ...promo,
        monthlyShows: updatedShows,
        roster: newRoster,
        champions: newChampions,
        recentEvent,
        matchLog: [logEntry, ...promo.matchLog],
      });
      return { ...stateWithPromo, globalNewsFeed: newGlobalFeed };
    }


    case 'GENERATE_TOURNAMENT': {
      const month = state.currentMonth;
      const promoConfig = getPromotion(pid);
      const config = promoConfig?.specialMonths?.[month];
      if (!config || promo.activeTournament) return state;

      if (config.key === 'g1' || config.key === 'cc') {
        const eligible = promo.roster
          .filter(w => w.status === 'active')
          .sort(() => Math.random() - 0.5);
        const options = eligible.slice(0, 3);
        const available = eligible.slice(3);
        return withPromo(state, pid, {
          ...promo,
          g1DraftActive: true,
          g1DraftSelected: [],
          g1DraftOptions: options,
          g1DraftAvailable: available,
          g1DraftTarget: config.participants,
        });
      }

      let tournament = null;
      if (config.type === 'elimination') tournament = generateEliminationTournament(config, promo.roster);
      else if (config.type === 'roundrobin') tournament = generateRoundRobinTournament(config, promo.roster);
      else if (config.type === 'tagRoundRobin') tournament = generateTagRoundRobin(config, promo.roster);
      return withPromo(state, pid, { ...promo, activeTournament: tournament });
    }

    case 'CHOOSE_G1_DRAFT': {
      const { chosenId } = action.payload;
      const chosen = promo.g1DraftOptions.find(w => w.id === chosenId);
      if (!chosen) return state;

      const newSelected = [...promo.g1DraftSelected, chosen];
      const rejected = promo.g1DraftOptions.filter(w => w.id !== chosenId);

      let newAvailable = [...promo.g1DraftAvailable];
      rejected.forEach(w => {
        const insertAt = Math.floor(Math.random() * (newAvailable.length + 1));
        newAvailable.splice(insertAt, 0, w);
      });

      if (newSelected.length >= promo.g1DraftTarget || newAvailable.length === 0) {
        const finalParticipants = newSelected.slice(0, promo.g1DraftTarget);
        const promoConfig = getPromotion(pid);
        const config = promoConfig?.specialMonths?.[state.currentMonth];
        const fakeRoster = finalParticipants.map(w => ({ ...w, status: 'active', points: 9999 }));
        const tournament = generateRoundRobinTournament({ ...config, participants: finalParticipants.length }, fakeRoster);
        tournament.participants = finalParticipants;
        return withPromo(state, pid, {
          ...promo,
          g1DraftActive: false,
          g1DraftSelected: [],
          g1DraftOptions: [],
          g1DraftAvailable: [],
          activeTournament: tournament,
        });
      }

      const nextOptions = newAvailable.slice(0, 3);
      const nextAvailable = newAvailable.slice(3);
      return withPromo(state, pid, {
        ...promo,
        g1DraftSelected: newSelected,
        g1DraftOptions: nextOptions,
        g1DraftAvailable: nextAvailable,
      });
    }

    case 'CANCEL_G1_DRAFT': {
      return withPromo(state, pid, {
        ...promo,
        g1DraftActive: false,
        g1DraftSelected: [],
        g1DraftOptions: [],
        g1DraftAvailable: [],
      });
    }

    case 'RESOLVE_TOURNAMENT_MATCH': {
      const { tournamentType, matchId, winnerId, winningSide, roundId, dayId } = action.payload;
      const t = JSON.parse(JSON.stringify(promo.activeTournament));
      let newRoster = [...promo.roster];
      let recentEvent = promo.recentEvent;

      if (tournamentType === 'elimination') {
        const round = t.rounds.find(r => r.id === roundId);
        const match = round.matches.find(m => m.id === matchId);
        match.winnerId = winnerId;
        newRoster = newRoster.map(w => w.id === winnerId ? { ...w, points: (w.points||0)+1, monthlyPoints: (w.monthlyPoints||0)+1 } : w);

        const allResolved = round.matches.every(m => m.winnerId !== null);
        const getWinner = (m) => m.winnerId === m.wrestlerA?.id ? m.wrestlerA : m.wrestlerB;

        if (allResolved) {
          if (roundId === 'r32') {
            const r16 = t.rounds.find(r => r.id === 'r16');
            for (let i = 0; i < r16.matches.length; i++) {
              r16.matches[i].wrestlerA = getWinner(round.matches[i * 2]);
              r16.matches[i].wrestlerB = getWinner(round.matches[i * 2 + 1]);
            }
          } else if (roundId === 'r16') {
            const qf = t.rounds.find(r => r.id === 'qf');
            for (let i = 0; i < qf.matches.length; i++) {
              qf.matches[i].wrestlerA = getWinner(round.matches[i * 2]);
              qf.matches[i].wrestlerB = getWinner(round.matches[i * 2 + 1]);
            }
          } else if (roundId === 'qf') {
            const sf = t.rounds.find(r => r.id === 'sf');
            sf.matches[0].wrestlerA = getWinner(round.matches[0]);
            sf.matches[0].wrestlerB = getWinner(round.matches[1]);
            sf.matches[1].wrestlerA = getWinner(round.matches[2]);
            sf.matches[1].wrestlerB = getWinner(round.matches[3]);
          } else if (roundId === 'sf') {
            const f = t.rounds.find(r => r.id === 'f');
            f.matches[0].wrestlerA = getWinner(round.matches[0]);
            f.matches[0].wrestlerB = getWinner(round.matches[1]);
          } else if (roundId === 'f') {
            t.winnerId = winnerId;
            const finalMatch = round.matches[0];
            const winnerWrestler = t.participants.find(p => p.id === winnerId);
            const loserWrestler  = [finalMatch.wrestlerA, finalMatch.wrestlerB].find(p => p && p.id !== winnerId);
            const winnerName = winnerWrestler?.name ?? 'Ganador';
            const loserName  = loserWrestler?.name ?? '';
            recentEvent = { type: 'tournament', message: `🏆 ¡${winnerName} es el ganador del ${t.name}!` };
            const logEntry = {
              id: Date.now() + Math.random(),
              year: state.currentYear, month: state.currentMonth,
              isTitleMatch: false, isTournamentFinal: true,
              belt: null, title: `Final — ${t.name}`,
              winnerName, loserName,
              winnerId, winningSide: null,
              time: new Date().toLocaleTimeString(),
            };
            const promoConfig = getPromotion(pid);
            const promoSN = promoConfig?.shortName ?? pid.toUpperCase();
            // Award title for elimination tournaments
            let newChampElim = { ...promo.champions };
            if (t.key === 'ajt' || t.key === 'kotr') {
              const winnerWrestler = t.participants.find(p => p.id === winnerId);
              if (winnerWrestler) newChampElim.junior = winnerWrestler;
            } else if (t.key === 'njc') {

              // NJC winner gets a world title shot — award if vacant
              const winnerWrestler = t.participants.find(p => p.id === winnerId);
              if (winnerWrestler && !newChampElim.world) newChampElim.world = winnerWrestler;
            }
            const newsEntry = { id: logEntry.id, eventType: 'tournamentFinal', text: `${winnerName} gana el ${t.name}`, month: state.currentMonth, year: state.currentYear, promoId: pid, promoShortName: promoSN };
            const newFeed = [newsEntry, ...(state.globalNewsFeed||[])].slice(0, 200);
            const s2 = withPromo(state, pid, { ...promo, activeTournament: t, roster: newRoster, recentEvent, champions: newChampElim, matchLog: [logEntry, ...promo.matchLog] });
            return { ...s2, globalNewsFeed: newFeed };
          }
        }
      } else if (tournamentType === 'roundrobin' || tournamentType === 'tagRoundRobin') {
        if (matchId === 't_final') {
          t.finalMatch.winnerId = winnerId;
          t.finalMatch.winningSide = winningSide;
          t.winnerId = winnerId || winningSide;

          const isTag = tournamentType === 'tagRoundRobin';

          let winnerName, loserName;
          if (isTag) {
            const winnerTeam = t.teams.find(tm => tm.id === t.winnerId);
            const loserTeam  = t.teams.find(tm => tm.id !== t.winnerId && (t.finalMatch.teamAId === tm.id || t.finalMatch.teamBId === tm.id));
            winnerName = winnerTeam?.name ?? 'Equipo ganador';
            loserName  = loserTeam?.name ?? '';
          } else {
            const winnerP = t.participants.find(p => String(p.id) === String(t.winnerId));
            const loserP  = [t.finalMatch.wrestlerA, t.finalMatch.wrestlerB].find(p => p && String(p.id) !== String(t.winnerId));
            winnerName = winnerP?.name ?? 'Ganador';
            loserName  = loserP?.name ?? '';
          }

          recentEvent = { type: 'tournament', message: `🏆 ¡${winnerName} es el ganador del ${t.name}!` };

          let newChampions = { ...promo.champions };
          if (t.key === 'bosj') {
            const winnerWrestler = t.participants.find(p => String(p.id) === String(t.winnerId));
            if (winnerWrestler) newChampions.junior = winnerWrestler;
          } else if (t.key === 'wtl' || t.key === 'rwtl') {
            const winnerTeam = t.teams.find(tm => tm.id === t.winnerId);
            if (winnerTeam) {
              newChampions.tag = { id: winnerTeam.id, name: winnerTeam.name, style: 'Tag Team', members: winnerTeam.members };
            }
          } else if (t.key === 'nwa_jr_rr') {
            // NWA Jr Round Robin winner becomes Jr champion
            const winnerWrestler = t.participants.find(p => String(p.id) === String(t.winnerId));
            if (winnerWrestler) newChampions.junior = winnerWrestler;
          } else if (t.key === 'nwa_tl' || t.key === 'wwf_tl') {
            // Tag league winner becomes tag champion
            const winnerTeam = t.teams.find(tm => tm.id === t.winnerId);
            if (winnerTeam) newChampions.tag = { id: winnerTeam.id, name: winnerTeam.name, style: 'Tag Team', members: winnerTeam.members };
          } else if (t.key === 'cc') {
            // Champion Carnival winner becomes PWF World Heavyweight Champion
            const winnerWrestler = t.participants.find(p => String(p.id) === String(t.winnerId));
            if (winnerWrestler) newChampions.world = winnerWrestler;
          }

          const newMatchLog = [{
            id: Date.now() + Math.random(),
            year: state.currentYear, month: state.currentMonth,
            isTitleMatch: false, isTournamentFinal: true,
            belt: null, title: `Final — ${t.name}`,
            winnerName, loserName,
            winnerId: winnerId || null, winningSide: winningSide || null,
            time: new Date().toLocaleTimeString(),
          }, ...promo.matchLog];

          const promoConfig2 = getPromotion(pid);
          const promoSN2 = promoConfig2?.shortName ?? pid.toUpperCase();
          const newsEntry2 = { id: Date.now()+Math.random(), eventType: 'tournamentFinal', text: `${winnerName} gana el ${t.name}`, month: state.currentMonth, year: state.currentYear, promoId: pid, promoShortName: promoSN2 };
          const newFeed2 = [newsEntry2, ...(state.globalNewsFeed||[])].slice(0, 200);
          const s3 = withPromo(state, pid, { ...promo, activeTournament: t, roster: newRoster, recentEvent, champions: newChampions, matchLog: newMatchLog });
          return { ...s3, globalNewsFeed: newFeed2 };
        } else {
          const day = t.days.find(d => d.id === dayId);
          const match = day.matches.find(m => m.id === matchId);
          if (tournamentType === 'roundrobin') {
            match.winnerId = winnerId;
            const wId = winnerId === 'draw' ? null : winnerId;
            if (wId) {
              if (t.standings[String(wId)]) t.standings[String(wId)].points += 2;
              newRoster = newRoster.map(w => w.id === wId ? { ...w, points: (w.points||0)+1, monthlyPoints: (w.monthlyPoints||0)+1 } : w);
            } else if (winnerId === 'draw') {
              if (t.standings[String(match.wrestlerA.id)]) t.standings[String(match.wrestlerA.id)].points += 1;
              if (t.standings[String(match.wrestlerB.id)]) t.standings[String(match.wrestlerB.id)].points += 1;
            }
            if (t.standings[String(match.wrestlerA.id)]) t.standings[String(match.wrestlerA.id)].matchesPlayed += 1;
            if (t.standings[String(match.wrestlerB.id)]) t.standings[String(match.wrestlerB.id)].matchesPlayed += 1;
          } else {
            match.winningSide = winningSide;
            const wId = winningSide === 'draw' ? null : (winningSide === 'A' ? match.teamAId : match.teamBId);
            if (wId) {
              if (t.standings[wId]) t.standings[wId].points += 2;
              const team = winningSide === 'A' ? match.teamA : match.teamB;
              team.forEach(w => { newRoster = newRoster.map(r => r.id === w.id ? { ...r, points: (r.points||0)+1, monthlyPoints: (r.monthlyPoints||0)+1 } : r); });
            } else if (winningSide === 'draw') {
              if (t.standings[match.teamAId]) t.standings[match.teamAId].points += 1;
              if (t.standings[match.teamBId]) t.standings[match.teamBId].points += 1;
            }
            if (t.standings[match.teamAId]) t.standings[match.teamAId].matchesPlayed += 1;
            if (t.standings[match.teamBId]) t.standings[match.teamBId].matchesPlayed += 1;
          }
          const allDaysDone = t.days.every(d => d.matches.every(m => m.winnerId != null || m.winningSide != null));
          if (allDaysDone && !t.finalMatch && t.days.length > 0) {
            const sortedIds = Object.keys(t.standings).sort((a, b) => t.standings[b].points - t.standings[a].points);
            if (tournamentType === 'roundrobin') {
              const pA = t.participants.find(p => String(p.id) === sortedIds[0]);
              const pB = t.participants.find(p => String(p.id) === sortedIds[1]);
              t.finalMatch = { id: 't_final', type: 'singles', wrestlerA: pA, wrestlerB: pB, winnerId: null };
            } else {
              const tA = t.teams.find(tm => tm.id === sortedIds[0]);
              const tB = t.teams.find(tm => tm.id === sortedIds[1]);
              if (tA && tB) {
                t.finalMatch = { id: 't_final', type: 'tag', teamA: tA.members, teamAId: tA.id, teamB: tB.members, teamBId: tB.id, winningSide: null };
              }
            }
          }
        }
      }
      return withPromo(state, pid, { ...promo, activeTournament: t, roster: newRoster, recentEvent });
    }

    case 'RESET_STATE': {
      const freshPromos = {};
      Object.keys(state.promotions).forEach(id => { freshPromos[id] = makePromoState(id); });
      return { ...INITIAL_STATE, promotions: freshPromos };
    }

    case 'CLEAR_RECENT_EVENT':
      return withPromo(state, pid, { ...promo, recentEvent: null });

    case 'ADVANCE_YEAR': {
      const nextYear = state.currentYear + 1;
      let newPromos = { ...state.promotions };

      // Process each active promotion
      const active = getActivePromotions(nextYear);
      // Also include promotions that were active last year (for folding)
      const allKeys = Object.keys(newPromos);

      for (const promoId of allKeys) {
        const p = newPromos[promoId];
        const promoConfig = getPromotion(promoId);
        const loader = ROSTER_LOADERS[promoId];

        const retirements = [];
        let nextRoster = [];
        p.roster.forEach(w => {
          if (shouldRetire(w, nextYear)) retirements.push({ ...w, retiredAt: nextYear });
          else nextRoster.push({ ...w, points: 0, monthlyPoints: 0 });
        });

        if (loader) {
          const newYearRoster = loader.getForYear(nextYear);
          const existingIds = new Set(nextRoster.map(w => w.id));
          const newArrivals = [];
          newYearRoster.forEach(w => {
            if (!existingIds.has(w.id)) {
              nextRoster.push({ ...w, points: 0, monthlyPoints: 0 });
              newArrivals.push(w);
            }
          });

          let nextChampions = { ...p.champions };
          retirements.forEach(r => {
            Object.keys(nextChampions).forEach(belt => { if (nextChampions[belt]?.id === r.id) nextChampions[belt] = null; });
          });

          const { newRoster, careerEnded: evtCareerEnded, newChampions, newLog, newEvents } = processEvents(nextRoster, nextChampions, p.eventLog, 1, nextYear);

          const arrivalEvents = newArrivals.map(w => {
            const age = nextYear - w.birthYear;
            const ageMod = getAgeModifier(age);
            const juniorMod = w.weightClass === 'junior' ? 0.7 : 1.0;
            const effLevel = Math.max(1, Math.round(w.level * ageMod * juniorMod));
            const weightLabel = w.weightClass === 'junior' ? 'Junior' : 'Pesado';
            return {
              id: Date.now() + Math.random(),
              year: nextYear, month: 1,
              type: 'success', eventType: 'return',
              text: `🆕 ${w.name} (${weightLabel} · ${w.style}) se incorpora al roster. LVL ${effLevel}.`,
            };
          });
          const finalLog = [...arrivalEvents, ...newLog].slice(0, 50);

          const wonWinner = [...p.roster]
            .filter(w => w.status === 'active' && (w.points || 0) > 0)
            .sort((a, b) => (b.points || 0) - (a.points || 0))[0];
          const wonEntry = wonWinner ? {
            id: `won_${promoId}_${state.currentYear}`,
            year: state.currentYear, month: 12,
            isTitleMatch: false, isTournamentFinal: false, isWON: true,
            winnerName: wonWinner.name, loserName: null, belt: null,
            title: `WON Wrestler of the Year ${state.currentYear} (${promoConfig?.shortName ?? promoId.toUpperCase()})`,
          } : null;
          const finalMatchLog = wonEntry ? [...p.matchLog, wonEntry] : p.matchLog;

          const yearRecord = { year: state.currentYear, retirements: retirements.map(r => r.name), matchLog: p.matchLog.filter(m => m.year === state.currentYear) };
          const allNewEvents = [...newEvents, ...arrivalEvents];

          newPromos[promoId] = {
            ...p,
            roster: newRoster,
            retiredRoster: [...p.retiredRoster, ...retirements, ...evtCareerEnded],
            champions: newChampions, monthlyWorkers: [], monthlyShows: [], activeTournament: null,
            currentShowIndex: 0, eventLog: finalLog, matchLog: finalMatchLog,
            yearHistory: [...p.yearHistory, yearRecord],
            monthlyEventSeries: null,
            pendingMonthEvents: allNewEvents,
            workerSelectionActive: false, workerSelectionPool: [], workerSelectionOptions: [], workerSelectionAvailable: [], workerSelectionCpuLastPick: null,
          };
        }
      }

      return {
        ...state,
        currentYear: nextYear,
        currentMonth: 1,
        phase: 'booking',
        promotions: newPromos,
      };
    }

    case 'SET_CHAMPION': {
      const { belt, wrestlerId } = action.payload;
      const wrestler = promo.roster.find(w => w.id === wrestlerId) || null;
      return withPromo(state, pid, { ...promo, champions: { ...promo.champions, [belt]: wrestler } });
    }

    case 'CLEAR_MONTH_EVENTS':
      if (!promo) return state;
      return withPromo(state, pid, { ...promo, pendingMonthEvents: [] });

    case 'ADVANCE_MONTH': {
      const next = state.currentMonth + 1;
      if (next > 12) return state;

      let newPromos = { ...state.promotions };
      let newGlobalFeedMonth = [...(state.globalNewsFeed || [])];
      for (const promoId of Object.keys(newPromos)) {
        const p = newPromos[promoId];
        const { newRoster, careerEnded, newChampions, newLog, newEvents } = processEvents(p.roster, p.champions, p.eventLog, next, state.currentYear);
        const rosterReset = newRoster.map(w => ({ ...w, monthlyPoints: 0 }));
        // Tag events with promotion and push to global feed
        const promoConfig = getPromotion(promoId);
        const taggedEvents = newEvents.map(ev => ({ ...ev, promoId, promoShortName: promoConfig?.shortName ?? promoId.toUpperCase() }));
        newGlobalFeedMonth = [...taggedEvents, ...newGlobalFeedMonth].slice(0, 200);
        newPromos[promoId] = {
          ...p,
          roster: rosterReset, champions: newChampions, eventLog: newLog,
          retiredRoster: [...p.retiredRoster, ...careerEnded],
          pendingMonthEvents: newEvents,
          monthlyWorkers: [], monthlyShows: [], currentShowIndex: 0, activeTournament: null,
          monthlyEventSeries: null,
          workerSelectionActive: false, workerSelectionPool: [], workerSelectionOptions: [], workerSelectionAvailable: [], workerSelectionCpuLastPick: null,
        };
      }

      // Check for promotion rename events and extraEvents
      for (const promoId of Object.keys(newPromos)) {
        const pc = getPromotion(promoId);
        if (pc?.rename) {
          const r = pc.rename;
          if (state.currentYear === r.year && next === r.month) {
            newGlobalFeedMonth = [{
              id: Date.now() + Math.random(),
              eventType: 'titleMatch',
              text: r.newsText,
              month: next,
              year: state.currentYear,
              promoId,
              promoShortName: r.shortName,
            }, ...newGlobalFeedMonth].slice(0, 200);
          }
        }
        // Extra one-off news events (e.g. Turner buyout 1988)
        if (pc?.extraEvents) {
          for (const ev of pc.extraEvents) {
            if (state.currentYear === ev.year && next === ev.month) {
              const curShortName = getPromotion(promoId)?.shortName ?? promoId.toUpperCase();
              newGlobalFeedMonth = [{
                id: Date.now() + Math.random(),
                eventType: 'tournamentFinal',
                text: ev.text,
                month: next,
                year: state.currentYear,
                promoId,
                promoShortName: curShortName,
              }, ...newGlobalFeedMonth].slice(0, 200);
            }
          }
        }
      }

      return {
        ...state,
        currentMonth: next,
        globalNewsFeed: newGlobalFeedMonth,
        promotions: newPromos,
      };
    }

    case 'ADVANCE_MONTH_AND_SELECT': {
      const next = state.currentMonth + 1;
      if (next > 12) return state;

      let newPromos = { ...state.promotions };
      let newGlobalFeedSelect = [...(state.globalNewsFeed || [])];
      for (const promoId of Object.keys(newPromos)) {
        const p = newPromos[promoId];
        const { newRoster, careerEnded: sel_careerEnded, newChampions, newLog, newEvents: sel_newEvents } = processEvents(p.roster, p.champions, p.eventLog, next, state.currentYear);
        const rosterReset = newRoster.map(w => ({ ...w, monthlyPoints: 0 }));

        const promoConfig = getPromotion(promoId);
        const taggedEvents = sel_newEvents.map(ev => ({ ...ev, promoId, promoShortName: promoConfig?.shortName ?? promoId.toUpperCase() }));
        newGlobalFeedSelect = [...taggedEvents, ...newGlobalFeedSelect].slice(0, 200);

        const isSpecial = !!(promoConfig?.specialMonths?.[next]);
        let selectionState = {
          workerSelectionActive: false, workerSelectionPool: [], workerSelectionOptions: [],
          workerSelectionAvailable: [], workerSelectionCpuLastPick: null,
        };

        if (!isSpecial && promoId === state.activePromotionId) {
          const champExcludeIds = new Set(
            ['world', 'secondary'].map(k => newChampions[k]?.id).filter(Boolean)
          );
          const available = rosterReset.filter(w => w.status === 'active' && !champExcludeIds.has(w.id));
          const shuffled = [...available].sort(() => Math.random() - 0.5);
          const options = shuffled.slice(0, Math.min(2, shuffled.length));
          const remaining = shuffled.slice(options.length);
          selectionState = {
            workerSelectionActive: true,
            workerSelectionPool: [],
            workerSelectionOptions: options,
            workerSelectionAvailable: remaining,
            workerSelectionCpuLastPick: null,
          };
        }

        newPromos[promoId] = {
          ...p,
          roster: rosterReset, champions: newChampions, eventLog: newLog,
          retiredRoster: [...p.retiredRoster, ...sel_careerEnded],
          pendingMonthEvents: sel_newEvents,
          monthlyWorkers: [], monthlyShows: [], currentShowIndex: 0, activeTournament: null,
          monthlyEventSeries: null,
          ...selectionState,
        };
      }

      return {
        ...state,
        currentMonth: next,
        globalNewsFeed: newGlobalFeedSelect,
        promotions: newPromos,
      };
    }

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
const GameContext = createContext(null);

const SAVE_KEY = 'wrestling_observer_state';
const SAVE_VERSION = 2; // Bump when state shape changes

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE, (init) => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Version check: discard old single-promotion saves
        if (!parsed.version || parsed.version < SAVE_VERSION || !parsed.promotions) {
          console.info('[GameContext] Incompatible save format, starting fresh.');
          return init;
        }
        // Restore with safe defaults for new fields
        const restoredPromos = {};
        Object.keys(parsed.promotions).forEach(id => {
          restoredPromos[id] = {
            ...makePromoState(id),
            ...parsed.promotions[id],
            workerSelectionActive: false,
            workerSelectionCpuLastPick: null,
          };
        });
        return {
          ...init,
          ...parsed,
          promotions: restoredPromos,
        };
      }
    } catch (_) {}
    return init;
  });

  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, version: SAVE_VERSION }));
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame debe usarse dentro de GameProvider');
  return ctx;
};

/** Convenience hook: returns the currently active promotion's state, or null */
export const useActivePromotion = () => {
  const { state } = useGame();
  if (!state.activePromotionId) return null;
  return state.promotions[state.activePromotionId] ?? null;
};

/** Convenience hook: returns the config object of the active promotion, or null */
export const useActivePromotionConfig = () => {
  const { state } = useGame();
  if (!state.activePromotionId) return null;
  return getPromotion(state.activePromotionId) ?? null;
};
