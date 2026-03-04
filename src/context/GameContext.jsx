import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getRosterForYear, roster1980 } from '../data/njpw/index';
import { calculateAge, getAgeModifier, getEffectiveLevel } from '../models/Wrestler';
import { generateEliminationTournament, generateRoundRobinTournament, generateTagRoundRobin } from '../models/TournamentModel';

// ─── Series de eventos NJPW ────────────────────────────────────────────────
export const NJPW_SERIES = [
  { weeklyPrefix: 'NJPW Road To King Of Pro-Wrestling', grandeLabel: 'King Of Pro-Wrestling' },
  { weeklyPrefix: 'NJPW Road To Destruction',           grandeLabel: 'Destruction' },
  { weeklyPrefix: 'NJPW Road To Wrestling Dontaku',     grandeLabel: 'Wrestling Dontaku' },
  { weeklyPrefix: 'NJPW Road To Sakura Genesis',        grandeLabel: 'Sakura Genesis' },
  { weeklyPrefix: 'NJPW Road To The New Beginning',     grandeLabel: 'The New Beginning' },
  { weeklyPrefix: 'NJPW Road To Power Struggle',        grandeLabel: 'Power Struggle' },
  { weeklyPrefix: 'NJPW Road To Dominion',              grandeLabel: 'Dominion' },
  { weeklyPrefix: 'New Japan Brave',                    grandeLabel: 'New Japan Brave Tag 8' },
  { weeklyPrefix: 'New Japan ISM',                      grandeLabel: 'New Japan ISM Tag 8' },
  { weeklyPrefix: 'NJPW Battle Final',                  grandeLabel: 'NJPW Battle Final Tag 8' },
  { weeklyPrefix: 'NJPW Toukon Series',                 grandeLabel: 'NJPW Toukon Series Tag 8' },
  { weeklyPrefix: 'NJPW Golden Fight Series',           grandeLabel: 'NJPW Golden Fight Series Tag 8' },
  { weeklyPrefix: 'NJPW Big Fight Series',              grandeLabel: 'NJPW Big Fight Series Tag 8' },
  { weeklyPrefix: 'NJPW Strong Energy',                 grandeLabel: 'NJPW Strong Energy Tag 8' },
  { weeklyPrefix: 'Exciting Battle In Naeba',           grandeLabel: 'Exciting Battle In Naeba Tag 8' },
  { weeklyPrefix: 'NJPW Hyper Battle',                  grandeLabel: 'NJPW Hyper Battle Tag 8' },
  { weeklyPrefix: 'NJPW Fighting Spirit',               grandeLabel: 'NJPW Fighting Spirit Tag 8' },
];

// ─── Constantes ────────────────────────────────────────────────────────────
export const SPECIAL_MONTHS = {
  3:  { key: 'njc',  name: 'New Japan Cup',             type: 'elimination', icon: '🏆', participants: 32, weightClass: null },
  6:  { key: 'bosj', name: 'Best of the Super Juniors', type: 'roundrobin',  icon: '✈️', participants: 8,  weightClass: 'junior' },
  9:  { key: 'g1',   name: 'G1 Climax',                 type: 'roundrobin',  icon: '🌟', participants: 10, weightClass: null },
  12: { key: 'wtl',  name: 'World Tag League',           type: 'tagRoundRobin',icon: '🤝', participants: 8,  weightClass: 'heavy' },
};

// ─── Estado inicial ──────────────────────────────────────────────────────────
const INITIAL_STATE = {
  currentYear: 1980,
  currentMonth: 1,
  phase: 'booking',
  roster: roster1980.map(w => ({ ...w, points: 0, monthlyPoints: 0 })),
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
  pendingMonthEvents: [],        // ← mostrado en el modal de periódico
  // Selección interactiva de workers
  workerSelectionActive: false,
  workerSelectionPool: [],
  workerSelectionOptions: [],
  workerSelectionAvailable: [],
  workerSelectionCpuLastPick: null,
  // Draft interactivo del G1 Climax
  g1DraftActive: false,
  g1DraftSelected: [],
  g1DraftOptions: [],
  g1DraftAvailable: [],
  g1DraftTarget: 10,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
  (n,x)=>`${n} se torció la rodilla en un mal movimiento y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió un fuerte golpe en la cadera y estará fuera ${m(x)}.`,
  (n,x)=>`${n} se lastimó el hombro al caer del ring y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una sobrecarga muscular en la espalda y estará fuera ${m(x)}.`,
  (n,x)=>`${n} se torció la muñeca durante un combate y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió un tirón en el cuádriceps y estará fuera ${m(x)}.`,
  (n,x)=>`${n} se lesionó el tobillo al aterrizar mal y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una distensión en el hombro y estará fuera ${m(x)}.`,
  (n,x)=>`${n} se golpeó la espalda baja y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una pequeña lesión en el codo y estará fuera ${m(x)}.`,
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
  (n,x)=>`${n} sufrió una lesión en el codo y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una lesión en la cadera y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una distensión en los ligamentos de la rodilla y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió un desgarro en el bíceps y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una lesión en el hombro que requerirá reposo prolongado y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una fractura menor en el pie y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una lesión muscular en la espalda baja y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió un esguince severo de tobillo y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una lesión en el pectoral y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una lesión en la rodilla tras un impacto fuerte y estará fuera ${m(x)}.`,
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
  (n,x)=>`${n} sufrió una rotura de pectoral y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una lesión grave en la rodilla durante un combate y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una fractura de tobillo y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una lesión grave en la columna y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una rotura muscular completa en el muslo y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una fractura de clavícula y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una lesión grave en el hombro y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una rotura de ligamentos múltiples en la rodilla y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una fractura de codo y estará fuera ${m(x)}.`,
  (n,x)=>`${n} sufrió una lesión grave en la espalda baja y estará fuera ${m(x)}.`,
];

const INJURY_GRAVISIMA = [
  (n,x)=>`${n} sufrió graves lesiones tras un accidente automovilístico y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} sufrió múltiples fracturas en un choque de moto y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} recibió un disparo durante un ataque relacionado con la yakuza y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} sufrió graves lesiones tras ser apuñalado en una pelea callejera y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} sufrió daños severos tras ser atropellado por un automóvil y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} sufrió múltiples fracturas tras caer desde gran altura y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} sufrió graves quemaduras en un incendio doméstico y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} sufrió una lesión cerebral grave tras un accidente fuera del ring y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} sufrió graves lesiones tras ser atacado violentamente en la calle y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} sufrió múltiples fracturas tras un accidente en bicicleta y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} sufrió graves lesiones tras un accidente con maquinaria pesada y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} sufrió una grave lesión en la columna tras un accidente doméstico y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} sufrió múltiples fracturas tras un accidente durante un entrenamiento extremo y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} sufrió graves lesiones tras ser alcanzado por disparos durante un altercado y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} sufrió una grave lesión neurológica tras un accidente en la vía pública y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} sufrió múltiples fracturas tras un accidente de tránsito durante una gira y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} sufrió graves lesiones tras un violento asalto y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} sufrió una grave lesión en la columna tras un accidente en el gimnasio y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} sufrió múltiples fracturas tras ser atropellado en la vía pública y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
  (n,x)=>`${n} sufrió graves lesiones internas tras un accidente automovilístico durante una gira y estará fuera ${m(x)}. Nunca volverá a ser el mismo.`,
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
  (n,x)=>`${n} fue suspendido tras un altercado con personal de producción y estará fuera ${m(x)}.`,
  (n,x)=>`${n} fue suspendido por ausentarse sin aviso de un show y estará fuera ${m(x)}.`,
  (n,x)=>`${n} fue suspendido tras un incidente con un fan y estará fuera ${m(x)}.`,
  (n,x)=>`${n} fue suspendido por violar las normas internas de la promoción y estará fuera ${m(x)}.`,
  (n,x)=>`${n} fue suspendido por llegar en malas condiciones a un evento y estará fuera ${m(x)}.`,
  (n,x)=>`${n} fue suspendido tras generar problemas en una gira y estará fuera ${m(x)}.`,
  (n,x)=>`${n} fue suspendido por conducta poco profesional y estará fuera ${m(x)}.`,
  (n,x)=>`${n} fue suspendido tras una discusión con directivos y estará fuera ${m(x)}.`,
  (n,x)=>`${n} fue suspendido por comportamiento irresponsable y estará fuera ${m(x)}.`,
  (n,x)=>`${n} fue suspendido tras un incidente disciplinario y estará fuera ${m(x)}.`,
];

const CAREER_END_TEMPLATES = [
  (n)=>`${n} fue arrestado por sus vínculos con la yakuza. Su carrera ha terminado.`,
  (n)=>`${n} fue condenado por un caso grave de violencia doméstica. Su carrera ha terminado.`,
  (n)=>`${n} fue declarado culpable en un caso de homicidio. Su carrera ha terminado.`,
  (n)=>`${n} fue arrestado tras un violento incidente armado en un bar. Su carrera ha terminado.`,
  (n)=>`${n} fue condenado por participar en actividades del crimen organizado. Su carrera ha terminado.`,
  (n)=>`${n} fue arrestado por intento de asesinato tras una pelea fuera del ring. Su carrera ha terminado.`,
  (n)=>`${n} fue condenado por un violento asalto que dejó a una persona gravemente herida. Su carrera ha terminado.`,
  (n)=>`${n} fue arrestado por tráfico de drogas a gran escala. Su carrera ha terminado.`,
  (n)=>`${n} fue condenado por secuestro en un caso que conmocionó a la opinión pública. Su carrera ha terminado.`,
  (n)=>`${n} fue arrestado tras verse involucrado en un asesinato durante una disputa personal. Su carrera ha terminado.`,
];

const pick = (arr) => arr[randomInt(0, arr.length - 1)];

const processEvents = (currentRoster, currentChampions, eventLog, nextMonth, nextYear) => {
  let newRoster = [...currentRoster];
  let newEvents = [];
  let newChampions = { ...currentChampions };
  let careerEnded = [];

  // 1. Procesar retornos automáticos
  newRoster = newRoster.map(w => {
    if (w.status !== 'active' && w.returnMonth === nextMonth && w.returnYear === nextYear) {
      newEvents.push({ id: Date.now()+Math.random(), text: `${w.name} regresó a la acción tras su ausencia.`, type: 'success', eventType: 'return', year: nextYear, month: nextMonth });
      return { ...w, status: 'active', returnMonth: null, returnYear: null };
    }
    return w;
  });

  // Helper: vacunar cinturón
  const vacateChampion = (victim) => {
    Object.keys(newChampions).forEach(belt => {
      if (newChampions[belt]?.id === victim.id) {
        newChampions[belt] = null;
        newEvents.push({ id: Date.now()+Math.random(), text: `El Campeonato ${belt.toUpperCase()} ha sido declarado VACANTE por la baja de ${victim.name}.`, type: 'warning', eventType: 'titleVacant', year: nextYear, month: nextMonth });
      }
    });
  };

  // Helper: establecer lesionado
  const setInjured = (wrestler, duration, extraFields = {}) => {
    let rMonth = nextMonth + duration, rYear = nextYear;
    while (rMonth > 12) { rMonth -= 12; rYear += 1; }
    newRoster = newRoster.map(w => w.id === wrestler.id
      ? { ...w, status: 'injured', returnMonth: rMonth, returnYear: rYear, ...extraFields }
      : w);
  };

  // 2. Evento aleatorio (20% por mes)
  const activeWrestlers = newRoster.filter(w => w.status === 'active');
  if (Math.random() < 0.20 && activeWrestlers.length > 0) {
    const victim = pick(activeWrestlers);
    const roll = Math.random();

    if (roll < 0.30) {
      // Lesión leve: 1-3 meses — sin vacante
      const dur = randomInt(1, 3);
      newEvents.push({ id: Date.now()+Math.random(), text: pick(INJURY_LEVE)(victim.name, dur), type: 'warning', eventType: 'leve', year: nextYear, month: nextMonth });
      setInjured(victim, dur);

    } else if (roll < 0.55) {
      // Lesión moderada: 2-5 meses — vacante si ≥3
      const dur = randomInt(2, 5);
      newEvents.push({ id: Date.now()+Math.random(), text: pick(INJURY_MODERADA)(victim.name, dur), type: 'warning', eventType: 'moderada', year: nextYear, month: nextMonth });
      setInjured(victim, dur);
      if (dur >= 3) vacateChampion(victim);

    } else if (roll < 0.73) {
      // Lesión grave: 4-8 meses — siempre vacante
      const dur = randomInt(4, 8);
      newEvents.push({ id: Date.now()+Math.random(), text: pick(INJURY_GRAVE)(victim.name, dur), type: 'danger', eventType: 'grave', year: nextYear, month: nextMonth });
      setInjured(victim, dur);
      vacateChampion(victim);

    } else if (roll < 0.80) {
      // Lesión gravísima: 6-12 meses + penalidad permanente -15%
      const dur = randomInt(6, 12);
      newEvents.push({ id: Date.now()+Math.random(), text: pick(INJURY_GRAVISIMA)(victim.name, dur), type: 'danger', eventType: 'gravisima', year: nextYear, month: nextMonth });
      const existingPenalty = victim.permanentPenalty ?? 1.0;
      setInjured(victim, dur, { permanentPenalty: Math.round(existingPenalty * 0.85 * 100) / 100 });
      vacateChampion(victim);

    } else if (roll < 0.95) {
      // Suspensión: 1-4 meses — vacante si ≥3
      const dur = randomInt(1, 4);
      newEvents.push({ id: Date.now()+Math.random(), text: pick(SUSPENSION_TEMPLATES)(victim.name, dur), type: 'warning', eventType: 'suspension', year: nextYear, month: nextMonth });
      let rMonth = nextMonth + dur, rYear = nextYear;
      while (rMonth > 12) { rMonth -= 12; rYear += 1; }
      newRoster = newRoster.map(w => w.id === victim.id ? { ...w, status: 'suspended', returnMonth: rMonth, returnYear: rYear } : w);
      if (dur >= 3) vacateChampion(victim);

    } else {
      // Evento gravísimo fuera del ring — fin de carrera inmediato
      newEvents.push({ id: Date.now()+Math.random(), text: pick(CAREER_END_TEMPLATES)(victim.name), type: 'danger', eventType: 'careerEnd', year: nextYear, month: nextMonth });
      careerEnded.push({ ...victim, retiredAt: nextYear });
      newRoster = newRoster.filter(w => w.id !== victim.id);
      vacateChampion(victim);
    }
  }

  const allEvents = [...newEvents, ...(eventLog || [])].slice(0, 50);
  return { newRoster, careerEnded, newChampions, newLog: allEvents, newEvents };
};



/** Genera 7 shows semanales con nombres de la serie */
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
    const label = series ? `${series.weeklyPrefix} Tag ${i + 1}` : `Show ${i + 1}`;
    shows.push({ index: i, label, matches });
  }
  return shows;
};

/** Genera el Show Grande basado en ranking mensual.
 * Los retadores se seleccionan secuencialmente para evitar duplicados:
 * - Título Mundial: campeón vs #1 (o #1 vs #2 si vacante)
 * - Título Secundario: campeón vs primer retador disponible (o los dos siguientes si vacante)
 * - Semi-estelar + Tag: con los restantes
 */
const generateShowGrande = (roster, champions, series) => {
  const ranking = [...roster]
    .filter(w => w.status === 'active')
    .sort((a, b) => (b.monthlyPoints || 0) - (a.monthlyPoints || 0));

  // Solo excluir campeones de los contendientes; ellos participan en sus propias defensas
  const champIds = Object.values(champions).filter(Boolean).map(c => c.id);
  const challengers = ranking.filter(w => !champIds.includes(w.id));

  // Pool de retadores con cursor para evitar duplicados
  const usedIds = new Set();
  const nextChallenger = () => {
    const c = challengers.find(w => !usedIds.has(w.id));
    if (c) usedIds.add(c.id);
    return c ?? null;
  };

  // ── Título Mundial ──────────────────────────────────────────────────────────
  let worldMatch = null;
  if (champions.world) {
    const c1 = nextChallenger();
    if (c1) worldMatch = { id: 'sg_world', type: 'title', belt: 'world', title: 'IWGP World Heavyweight', wrestlerA: champions.world, wrestlerB: c1, winnerId: null };
  } else {
    const c1 = nextChallenger(), c2 = nextChallenger();
    if (c1 && c2) worldMatch = { id: 'sg_world', type: 'title', belt: 'world', title: 'IWGP World Heavyweight (Vacante)', wrestlerA: c1, wrestlerB: c2, winnerId: null };
  }

  // ── Título Secundario (usa retadores distintos a los del mundial) ───────────
  let secondaryMatch = null;
  if (champions.secondary) {
    const c1 = nextChallenger();
    if (c1) secondaryMatch = { id: 'sg_secondary', type: 'title', belt: 'secondary', title: 'IWGP Intercontinental', wrestlerA: champions.secondary, wrestlerB: c1, winnerId: null };
  } else {
    const c1 = nextChallenger(), c2 = nextChallenger();
    if (c1 && c2) secondaryMatch = { id: 'sg_secondary', type: 'title', belt: 'secondary', title: 'IWGP Intercontinental (Vacante)', wrestlerA: c1, wrestlerB: c2, winnerId: null };
  }

  // ── Semi-estelar y Tag con los restantes ────────────────────────────────────
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

// ─── Reducer ──────────────────────────────────────────────────────────────────
function gameReducer(state, action) {
  switch (action.type) {

    case 'LOAD_STATE':
      return { ...action.payload };

    case 'LOG_RESULT': {
      const { winnerId, loserId, matchType, month, year } = action.payload;
      const newLog = [{ id: Date.now(), year: year ?? state.currentYear, month: month ?? state.currentMonth, winnerId, loserId, matchType: matchType ?? 'singles', time: new Date().toLocaleTimeString() }, ...state.matchLog];
      const newRoster = state.roster.map(w =>
        w.id === winnerId ? { ...w, points: (w.points || 0) + 1, monthlyPoints: (w.monthlyPoints || 0) + 1 } : w
      );
      return { ...state, matchLog: newLog, roster: newRoster };
    }

    // ─── Selección interactiva de workers ───────────────────────────────────
    case 'START_WORKER_SELECTION':
    case 'SELECT_MONTHLY_WORKERS': {
      // Excluir campeones mundial Y secundario — no participan en shows semanales
      const champExcludeIds = new Set(
        ['world', 'secondary'].map(k => state.champions[k]?.id).filter(Boolean)
      );
      const available = state.roster.filter(w => w.status === 'active' && !champExcludeIds.has(w.id));
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      const options = shuffled.slice(0, Math.min(2, shuffled.length));
      const remaining = shuffled.slice(options.length);
      return {
        ...state,
        workerSelectionActive: true,
        workerSelectionPool: [],
        workerSelectionOptions: options,
        workerSelectionAvailable: remaining,
        workerSelectionCpuLastPick: null,
        monthlyWorkers: [],
        monthlyShows: [],
        currentShowIndex: 0,
        monthlyEventSeries: null,
      };
    }

    case 'CHOOSE_WORKER': {
      const { chosenId } = action.payload;
      const chosen = state.workerSelectionOptions.find(w => w.id === chosenId);
      const rejected = state.workerSelectionOptions.find(w => w.id !== chosenId);

      // El campeón nunca debe volver al pool aunque sea 'rejected'
      const champExcludeIds = new Set(
        ['world', 'secondary'].map(k => state.champions[k]?.id).filter(Boolean)
      );

      let newAvailable = [...state.workerSelectionAvailable];
      if (rejected && !champExcludeIds.has(rejected.id)) {
        const insertAt = randomInt(0, newAvailable.length);
        newAvailable.splice(insertAt, 0, rejected);
      }

      // CPU elige 1 al azar del pool disponible
      let cpuPick = null;
      if (newAvailable.length > 0) {
        const cpuIdx = randomInt(0, newAvailable.length - 1);
        cpuPick = newAvailable[cpuIdx];
        newAvailable.splice(cpuIdx, 1);
      }

      const newPool = [
        ...state.workerSelectionPool,
        { ...chosen, pickedBy: 'player' },
        ...(cpuPick ? [{ ...cpuPick, pickedBy: 'cpu' }] : []),
      ];

      const targetCount = 16;

      if (newPool.length >= targetCount || newAvailable.length === 0) {
        const workers = newPool.slice(0, targetCount);
        const cleanWorkers = workers.map(({ pickedBy: _, ...w }) => w);
        // Elegir serie aleatoria y generar shows automáticamente
        const series = NJPW_SERIES[randomInt(0, NJPW_SERIES.length - 1)];
        const shows = generateShows(cleanWorkers, series);
        return {
          ...state,
          workerSelectionActive: false,
          workerSelectionPool: [],
          workerSelectionOptions: [],
          workerSelectionAvailable: [],
          workerSelectionCpuLastPick: cpuPick,
          monthlyWorkers: cleanWorkers,
          monthlyEventSeries: series,
          monthlyShows: shows,
          currentShowIndex: 0,
        };
      }

      const nextOptions = newAvailable.slice(0, Math.min(2, newAvailable.length));
      const nextAvailable = newAvailable.slice(nextOptions.length);

      return {
        ...state,
        workerSelectionPool: newPool,
        workerSelectionOptions: nextOptions,
        workerSelectionAvailable: nextAvailable,
        workerSelectionCpuLastPick: cpuPick,
      };
    }

    case 'CANCEL_WORKER_SELECTION': {
      return {
        ...state,
        workerSelectionActive: false,
        workerSelectionPool: [],
        workerSelectionOptions: [],
        workerSelectionAvailable: [],
        workerSelectionCpuLastPick: null,
      };
    }

    case 'GENERATE_SHOWS': {
      if (state.monthlyWorkers.length < 4) return state;
      const series = state.monthlyEventSeries;
      const shows = generateShows(state.monthlyWorkers, series);
      return { ...state, monthlyShows: shows, currentShowIndex: 0 };
    }

    case 'ADVANCE_SHOW': {
      const nextIndex = state.currentShowIndex + 1;
      // Al llegar al show grande (índice 7), generarlo dinámicamente con el ranking mensual actual
      if (nextIndex === 7) {
        const sg = generateShowGrande(state.roster, state.champions, state.monthlyEventSeries);
        return {
          ...state,
          currentShowIndex: 7,
          monthlyShows: [...state.monthlyShows.filter(s => !s.isGrande), sg],
        };
      }
      return { ...state, currentShowIndex: nextIndex };
    }

    case 'GENERATE_SHOW_GRANDE': {
      const sg = generateShowGrande(state.roster, state.champions, state.monthlyEventSeries);
      return {
        ...state,
        monthlyShows: [...state.monthlyShows.filter(s => !s.isGrande), sg],
        currentShowIndex: 7,
      };
    }

    case 'SET_CURRENT_SHOW':
      return { ...state, currentShowIndex: action.payload };

    case 'RESOLVE_SHOW_MATCH': {
      const { showIndex, matchId, winnerId, winningSide } = action.payload;

      // Buscar el match original para saber si es un match de título
      const origShow = state.monthlyShows.find(s => s.index === showIndex);
      const origMatch = origShow?.matches.find(m => m.id === matchId);

      const updatedShows = state.monthlyShows.map(show => {
        if (show.index !== showIndex) return show;
        return {
          ...show,
          matches: show.matches.map(m => {
            if (m.id !== matchId) return m;
            return m.type === 'tag' ? { ...m, winningSide } : { ...m, winnerId };
          }),
        };
      });

      let newRoster = [...state.roster];
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

      // Auto-asignar campeón si el match tiene un belt (título en juego)
      let newChampions = { ...state.champions };
      let recentEvent = state.recentEvent;
      if (origMatch?.belt && winnerId) {
        const champWrestler = newRoster.find(w => w.id === winnerId);
        if (champWrestler) {
          const wasChamp = state.champions[origMatch.belt];
          newChampions[origMatch.belt] = champWrestler;
          recentEvent = wasChamp && wasChamp.id === champWrestler.id
            ? { type: 'title', message: ` ${champWrestler.name} defiende exitosamente su título.` }
            : { type: 'title', message: ` ¡${champWrestler.name} se convierte en el nuevo Campeón!` };
        }
      }

      // Construir entrada del log enriquecida
      const getWinnerName = () => {
        if (winnerId) return newRoster.find(w => w.id === winnerId)?.name ?? 'Desconocido';
        if (winningSide && origMatch) {
          const team = winningSide === 'A' ? origMatch.teamA : origMatch.teamB;
          return team?.map(w => w?.name).filter(Boolean).join(' & ') ?? 'Equipo';
        }
        return 'Desconocido';
      };
      const getLoserName = () => {
        // Comprobar por wrestlerA/B en lugar de type==='singles'  
        // porque los title matches tienen type='title', no 'singles'
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

      return {
        ...state,
        monthlyShows: updatedShows,
        roster: newRoster,
        champions: newChampions,
        recentEvent,
        matchLog: [logEntry, ...state.matchLog],
      };
    }

    case 'GENERATE_TOURNAMENT': {
      const month = state.currentMonth;
      const config = SPECIAL_MONTHS[month];
      if (!config || state.activeTournament) return state;

      // G1 Climax: iniciar draft interactivo en lugar de selección aleatoria
      if (config.key === 'g1') {
        const eligible = state.roster
          .filter(w => w.status === 'active')
          .sort(() => Math.random() - 0.5);
        const options = eligible.slice(0, 3);
        const available = eligible.slice(3);
        return {
          ...state,
          g1DraftActive: true,
          g1DraftSelected: [],
          g1DraftOptions: options,
          g1DraftAvailable: available,
          g1DraftTarget: config.participants,
        };
      }

      let tournament = null;
      if (config.type === 'elimination') tournament = generateEliminationTournament(config, state.roster);
      else if (config.type === 'roundrobin') tournament = generateRoundRobinTournament(config, state.roster);
      else if (config.type === 'tagRoundRobin') tournament = generateTagRoundRobin(config, state.roster);
      return { ...state, activeTournament: tournament };
    }

    case 'CHOOSE_G1_DRAFT': {
      const { chosenId } = action.payload;
      const chosen = state.g1DraftOptions.find(w => w.id === chosenId);
      if (!chosen) return state;

      const newSelected = [...state.g1DraftSelected, chosen];
      const rejected = state.g1DraftOptions.filter(w => w.id !== chosenId);

      // Los rechazados vuelven al pool disponible (en posición aleatoria)
      let newAvailable = [...state.g1DraftAvailable];
      rejected.forEach(w => {
        const insertAt = Math.floor(Math.random() * (newAvailable.length + 1));
        newAvailable.splice(insertAt, 0, w);
      });

      // ¿Ya completamos el target?
      if (newSelected.length >= state.g1DraftTarget || newAvailable.length === 0) {
        const finalParticipants = newSelected.slice(0, state.g1DraftTarget);
        const config = SPECIAL_MONTHS[state.currentMonth];
        const fakeRoster = finalParticipants.map(w => ({ ...w, status: 'active', points: 9999 }));
        const tournament = generateRoundRobinTournament({ ...config, participants: finalParticipants.length }, fakeRoster);
        // override participants to be exactly our draft picks
        tournament.participants = finalParticipants;
        return {
          ...state,
          g1DraftActive: false,
          g1DraftSelected: [],
          g1DraftOptions: [],
          g1DraftAvailable: [],
          activeTournament: tournament,
        };
      }

      // Siguiente ronda: 3 opciones del pool
      const nextOptions = newAvailable.slice(0, 3);
      const nextAvailable = newAvailable.slice(3);
      return {
        ...state,
        g1DraftSelected: newSelected,
        g1DraftOptions: nextOptions,
        g1DraftAvailable: nextAvailable,
      };
    }

    case 'CANCEL_G1_DRAFT': {
      return {
        ...state,
        g1DraftActive: false,
        g1DraftSelected: [],
        g1DraftOptions: [],
        g1DraftAvailable: [],
      };
    }

    case 'RESOLVE_TOURNAMENT_MATCH': {
      const { tournamentType, matchId, winnerId, winningSide, roundId, dayId } = action.payload;
      const t = JSON.parse(JSON.stringify(state.activeTournament)); // deep clone
      let newRoster = [...state.roster];
      let recentEvent = state.recentEvent;

      if (tournamentType === 'elimination') {
        const round = t.rounds.find(r => r.id === roundId);
        const match = round.matches.find(m => m.id === matchId);
        match.winnerId = winnerId;
        newRoster = newRoster.map(w => w.id === winnerId ? { ...w, points: (w.points||0)+1, monthlyPoints: (w.monthlyPoints||0)+1 } : w);

        const allResolved = round.matches.every(m => m.winnerId !== null);
        // Helper: get winner wrestler from a match
        const getWinner = (m) => m.winnerId === m.wrestlerA?.id ? m.wrestlerA : m.wrestlerB;

        if (allResolved) {
          if (roundId === 'r32') {
            // 32-player: llenar Segunda Ronda con ganadores de Primera Ronda
            const r16 = t.rounds.find(r => r.id === 'r16');
            for (let i = 0; i < r16.matches.length; i++) {
              r16.matches[i].wrestlerA = getWinner(round.matches[i * 2]);
              r16.matches[i].wrestlerB = getWinner(round.matches[i * 2 + 1]);
            }
          } else if (roundId === 'r16') {
            // Llenar Cuartos de final con los ganadores de la Segunda Ronda
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
              isTitleMatch: false,
              isTournamentFinal: true,
              belt: null,
              title: `Final — ${t.name}`,
              winnerName,
              loserName,
              winnerId, winningSide: null,
              time: new Date().toLocaleTimeString(),
            };
            return { ...state, activeTournament: t, roster: newRoster, recentEvent, matchLog: [logEntry, ...state.matchLog] };
          }
        }
      } else if (tournamentType === 'roundrobin' || tournamentType === 'tagRoundRobin') {
        if (matchId === 't_final') {
          t.finalMatch.winnerId = winnerId;
          t.finalMatch.winningSide = winningSide;
          t.winnerId = winnerId || winningSide;

          const isTag = tournamentType === 'tagRoundRobin';

          // Nombre del ganador y perdedor
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

          // Auto-asignar campeón según el tipo de torneo
          let newChampions = { ...state.champions };
          if (t.key === 'bosj') {
            // BOSJ → Campeón Junior
            const winnerWrestler = t.participants.find(p => String(p.id) === String(t.winnerId));
            if (winnerWrestler) newChampions.junior = winnerWrestler;
          } else if (t.key === 'wtl') {
            // WTL → Campeón Tag (guardado como objeto con nombre del equipo)
            const winnerTeam = t.teams.find(tm => tm.id === t.winnerId);
            if (winnerTeam) {
              newChampions.tag = { id: winnerTeam.id, name: winnerTeam.name, style: 'Tag Team', members: winnerTeam.members };
            }
          }

          // Agregar al historial de títulos
          const newMatchLog = [{
            id: Date.now() + Math.random(),
            year: state.currentYear, month: state.currentMonth,
            isTitleMatch: false,
            isTournamentFinal: true,
            belt: null,
            title: `Final — ${t.name}`,
            winnerName,
            loserName,
            winnerId: winnerId || null, winningSide: winningSide || null,
            time: new Date().toLocaleTimeString(),
          }, ...state.matchLog];

          return { ...state, activeTournament: t, roster: newRoster, recentEvent, champions: newChampions, matchLog: newMatchLog };
        } else {
          const day = t.days.find(d => d.id === dayId);
          const match = day.matches.find(m => m.id === matchId);
          if (tournamentType === 'roundrobin') {
            match.winnerId = winnerId;
            const wId = winnerId === 'draw' ? null : winnerId;
            // Usar String() para coincidir con las keys del standings object
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
              // String(p.id) para coincidir con las keys del standings
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
      return { ...state, activeTournament: t, roster: newRoster, recentEvent };
    }

    case 'RESET_STATE':
      return { ...INITIAL_STATE, roster: roster1980.map(w => ({ ...w, points: 0, monthlyPoints: 0 })) };

    case 'CLEAR_RECENT_EVENT':
      return { ...state, recentEvent: null };

    case 'ADVANCE_YEAR': {
      const nextYear = state.currentYear + 1;
      const retirements = [];
      let nextRoster = [];
      state.roster.forEach(w => {
        if (shouldRetire(w, nextYear)) retirements.push({ ...w, retiredAt: nextYear });
        else nextRoster.push({ ...w, points: 0, monthlyPoints: 0 });
      });
      // Agregamos luchadores nuevos del roster del próximo año que no estén ya
      const newYearRoster = getRosterForYear(nextYear);
      const existingIds = new Set(nextRoster.map(w => w.id));
      const newArrivals = [];
      newYearRoster.forEach(w => {
        if (!existingIds.has(w.id)) {
          nextRoster.push({ ...w, points: 0, monthlyPoints: 0 });
          newArrivals.push(w);
        }
      });
      let nextChampions = { ...state.champions };
      retirements.forEach(r => {
        Object.keys(nextChampions).forEach(belt => { if (nextChampions[belt]?.id === r.id) nextChampions[belt] = null; });
      });
      const { newRoster, careerEnded: evtCareerEnded, newChampions, newLog, newEvents } = processEvents(nextRoster, nextChampions, state.eventLog, 1, nextYear);
      // Generar eventos de llegada de nuevos luchadores
      const arrivalEvents = newArrivals.map(w => {
        const age = nextYear - w.birthYear;
        const ageMod = getAgeModifier(age);
        const juniorMod = w.weightClass === 'junior' ? 0.7 : 1.0;
        const effLevel = Math.max(1, Math.round(w.level * ageMod * juniorMod));
        const weightLabel = w.weightClass === 'junior' ? 'Junior' : 'Pesado';
        return {
          id: Date.now() + Math.random(),
          year: nextYear,
          month: 1,
          type: 'success',
          eventType: 'return',
          text: `🆕 ${w.name} (${weightLabel} · ${w.style}) se incorpora al roster. LVL ${effLevel}.`,
        };
      });
      const finalLog = [...arrivalEvents, ...newLog].slice(0, 50);

      // ── WON Wrestler of the Year ──────────────────────────────────────────
      const wonWinner = [...state.roster]
        .filter(w => w.status === 'active' && (w.points || 0) > 0)
        .sort((a, b) => (b.points || 0) - (a.points || 0))[0];
      const wonEntry = wonWinner ? {
        id: `won_${state.currentYear}`,
        year: state.currentYear,
        month: 12,
        isTitleMatch: false,
        isTournamentFinal: false,
        isWON: true,
        winnerName: wonWinner.name,
        loserName: null,
        belt: null,
        title: `WON Wrestler of the Year ${state.currentYear}`,
      } : null;
      const finalMatchLog = wonEntry ? [...state.matchLog, wonEntry] : state.matchLog;

      const yearRecord = { year: state.currentYear, retirements: retirements.map(r => r.name), matchLog: state.matchLog.filter(m => m.year === state.currentYear) };
      const allNewEvents = [...newEvents, ...arrivalEvents];
      return {
        ...state,
        currentYear: nextYear, currentMonth: 1, phase: 'booking',
        roster: newRoster,
        retiredRoster: [...state.retiredRoster, ...retirements, ...evtCareerEnded],
        champions: newChampions, monthlyWorkers: [], monthlyShows: [], activeTournament: null,
        currentShowIndex: 0, eventLog: finalLog, matchLog: finalMatchLog,
        yearHistory: [...state.yearHistory, yearRecord],
        monthlyEventSeries: null,
        pendingMonthEvents: allNewEvents,
        workerSelectionActive: false, workerSelectionPool: [], workerSelectionOptions: [], workerSelectionAvailable: [], workerSelectionCpuLastPick: null,
      };
    }

    case 'SET_CHAMPION': {
      const { belt, wrestlerId } = action.payload;
      const wrestler = state.roster.find(w => w.id === wrestlerId) || null;
      return { ...state, champions: { ...state.champions, [belt]: wrestler } };
    }

    case 'CLEAR_MONTH_EVENTS':
      return { ...state, pendingMonthEvents: [] };

    case 'ADVANCE_MONTH': {
      const next = state.currentMonth + 1;
      if (next > 12) return state;
      const { newRoster, careerEnded, newChampions, newLog, newEvents } = processEvents(state.roster, state.champions, state.eventLog, next, state.currentYear);
      const rosterReset = newRoster.map(w => ({ ...w, monthlyPoints: 0 }));
      return {
        ...state,
        currentMonth: next, roster: rosterReset, champions: newChampions, eventLog: newLog,
        retiredRoster: [...state.retiredRoster, ...careerEnded],
        pendingMonthEvents: newEvents,
        monthlyWorkers: [], monthlyShows: [], currentShowIndex: 0, activeTournament: null,
        monthlyEventSeries: null,
        workerSelectionActive: false, workerSelectionPool: [], workerSelectionOptions: [], workerSelectionAvailable: [], workerSelectionCpuLastPick: null,
      };
    }

    case 'ADVANCE_MONTH_AND_SELECT': {
      const next = state.currentMonth + 1;
      if (next > 12) return state;
      const { newRoster, careerEnded: sel_careerEnded, newChampions, newLog, newEvents: sel_newEvents } = processEvents(state.roster, state.champions, state.eventLog, next, state.currentYear);
      const rosterReset = newRoster.map(w => ({ ...w, monthlyPoints: 0 }));

      const isSpecial = !!SPECIAL_MONTHS[next];
      let selectionState = {
        workerSelectionActive: false, workerSelectionPool: [], workerSelectionOptions: [],
        workerSelectionAvailable: [], workerSelectionCpuLastPick: null,
      };

      if (!isSpecial) {
        // Arrancar selección inmediatamente solo para meses normales
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

      return {
        ...state,
        currentMonth: next, roster: rosterReset, champions: newChampions, eventLog: newLog,
        retiredRoster: [...state.retiredRoster, ...sel_careerEnded],
        pendingMonthEvents: sel_newEvents,
        monthlyWorkers: [], monthlyShows: [], currentShowIndex: 0, activeTournament: null,
        monthlyEventSeries: null,
        ...selectionState,
      };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE, (init) => {
    try {
      const saved = localStorage.getItem('njpw_booking_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...init,
          ...parsed,
          workerSelectionActive: false,
          workerSelectionPool: parsed.workerSelectionPool || [],
          workerSelectionOptions: parsed.workerSelectionOptions || [],
          workerSelectionAvailable: parsed.workerSelectionAvailable || [],
          workerSelectionCpuLastPick: null,
          monthlyEventSeries: parsed.monthlyEventSeries || null,
        };
      }
    } catch (_) {}
    return init;
  });

  useEffect(() => {
    localStorage.setItem('njpw_booking_state', JSON.stringify(state));
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
