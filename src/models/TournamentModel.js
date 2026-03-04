/**
 * Lógica para generar y estructurar los Torneos.
 *
 * Notas importantes:
 * - Los IDs de wrestlers deben tratarse como strings para comparación segura
 *   (Object.keys() siempre devuelve strings, pero los IDs pueden ser números)
 * - Se usan String(id) en comparaciones para evitar bugs de tipo
 */

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

/**
 * Genera bracket de eliminación.
 * Soporta 8 participantes (QF→SF→F) y 16 participantes (R16→QF→SF→F).
 */
export const generateEliminationTournament = (config, roster) => {
  const participantsCount = config.participants; // 8, 16 o 32
  const eligible = roster
    .filter(w => w.status === 'active' && (!config.weightClass || w.weightClass === config.weightClass))
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, Math.ceil(participantsCount * 1.5));

  const participants = pickRandom(eligible, participantsCount);

  const makeEmptyMatch = (id, round) => ({
    id, type: 'singles', round, wrestlerA: null, wrestlerB: null, winnerId: null,
  });

  if (participantsCount === 32) {
    // R32 (16 matches) → R16 (8) → QF (4) → SF (2) → F (1)
    const r32 = [];
    for (let i = 0; i < 32; i += 2) {
      r32.push({ id: `t_r32_${i/2}`, type: 'singles', round: 'Primera Ronda', wrestlerA: participants[i], wrestlerB: participants[i+1], winnerId: null });
    }
    const r16 = Array.from({ length: 8 }, (_, i) => makeEmptyMatch(`t_r16_${i}`, 'Segunda Ronda'));
    const qf  = Array.from({ length: 4 }, (_, i) => makeEmptyMatch(`t_qf_${i}`, 'Cuartos de Final'));
    const sf  = Array.from({ length: 2 }, (_, i) => makeEmptyMatch(`t_sf_${i}`, 'Semifinal'));
    const f   = [makeEmptyMatch('t_final_0', 'Final')];
    return {
      key: config.key, name: config.name, type: config.type, participants,
      rounds: [
        { id: 'r32', name: 'Primera Ronda',    matches: r32 },
        { id: 'r16', name: 'Segunda Ronda',    matches: r16 },
        { id: 'qf',  name: 'Cuartos de Final', matches: qf  },
        { id: 'sf',  name: 'Semifinales',      matches: sf  },
        { id: 'f',   name: 'Final',            matches: f   },
      ],
      winnerId: null,
    };
  }

  if (participantsCount === 16) {
    // R16 (8 matches) → QF (4) → SF (2) → F (1)
    const r16 = [];
    for (let i = 0; i < 16; i += 2) {
      r16.push({ id: `t_r16_${i/2}`, type: 'singles', round: 'Primera Ronda', wrestlerA: participants[i], wrestlerB: participants[i+1], winnerId: null });
    }
    const qf = Array.from({ length: 4 }, (_, i) => makeEmptyMatch(`t_qf_${i}`, 'Cuartos de Final'));
    const sf = Array.from({ length: 2 }, (_, i) => makeEmptyMatch(`t_sf_${i}`, 'Semifinal'));
    const f  = [makeEmptyMatch('t_final_0', 'Final')];
    return {
      key: config.key, name: config.name, type: config.type, participants,
      rounds: [
        { id: 'r16', name: 'Primera Ronda',    matches: r16 },
        { id: 'qf',  name: 'Cuartos de Final', matches: qf  },
        { id: 'sf',  name: 'Semifinales',       matches: sf  },
        { id: 'f',   name: 'Final',             matches: f   },
      ],
      winnerId: null,
    };
  }

  // Default: 8 participantes → QF→SF→F
  const quarters = [];
  for (let i = 0; i < participantsCount; i += 2) {
    quarters.push({ id: `t_qf_${i/2}`, type: 'singles', round: 'Cuartos de Final', wrestlerA: participants[i], wrestlerB: participants[i+1], winnerId: null });
  }
  const semis = Array.from({ length: 2 }, (_, i) => makeEmptyMatch(`t_sf_${i}`, 'Semifinal'));
  const final = [makeEmptyMatch('t_final_0', 'Final')];

  return {
    key: config.key, name: config.name, type: config.type, participants,
    rounds: [
      { id: 'qf', name: 'Cuartos de Final', matches: quarters },
      { id: 'sf', name: 'Semifinales',       matches: semis   },
      { id: 'f',  name: 'Final',             matches: final   },
    ],
    winnerId: null,
  };
};

/**
 * Genera un Round Robin (BOSJ, G1).
 * Todos contra todos: N*(N-1)/2 matches repartidos en N-1 días de N/2 matches cada uno.
 *
 * Bug fix: usamos String(p.id) al construir standings para que Object.keys() y p.id
 * sean siempre comparables.
 */
export const generateRoundRobinTournament = (config, roster) => {
  const participantsCount = config.participants;
  let eligible = roster.filter(w => w.status === 'active');
  if (config.weightClass) eligible = eligible.filter(w => w.weightClass === config.weightClass);
  eligible = eligible.sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, Math.ceil(participantsCount * 1.5));
  const participants = pickRandom(eligible, participantsCount);

  // standings keyed by String(id) para consistencia con Object.keys()
  const standings = {};
  participants.forEach(p => { standings[String(p.id)] = { points: 0, matchesPlayed: 0 }; });

  // Todos contra todos - genera N*(N-1)/2 matches
  const allMatches = [];
  let matchId = 0;
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      allMatches.push({ id: `t_rr_${matchId++}`, type: 'singles', wrestlerA: participants[i], wrestlerB: participants[j], winnerId: null });
    }
  }

  // Distribuir usando el algoritmo circle para que cada día nadie pelee dos veces
  // Usamos el algoritmo round-robin clásico (circle method)
  const n = participants.length;
  const roundsNeeded = n - 1;        // rounds necesarios = N-1
  const matchesPerRound = n / 2;     // matches por round = N/2

  // Generar el schedule correcto con circle method
  const ids = participants.map((_, i) => i);
  const days = [];
  for (let r = 0; r < roundsNeeded; r++) {
    const dayMatches = [];
    for (let m = 0; m < matchesPerRound; m++) {
      const home = ids[m === 0 ? 0 : r + m <= n - 1 ? r + m : r + m - (n - 1)];
      const away = ids[r + (n - 1 - m) <= n - 1 ? r + (n - 1 - m) : r + (n - 1 - m) - (n - 1)];
      // Buscar el match pre-generado entre estos dos
      const found = allMatches.find(match =>
        (match.wrestlerA.id === participants[home].id && match.wrestlerB.id === participants[away].id) ||
        (match.wrestlerA.id === participants[away].id && match.wrestlerB.id === participants[home].id)
      );
      if (found && !dayMatches.find(dm => dm.id === found.id)) {
        dayMatches.push(found);
      }
    }
    // Si el circle method no completó el día (por impar), rellenar con los pendientes
    if (dayMatches.length < matchesPerRound) {
      const usedInDay = new Set(dayMatches.flatMap(m => [m.wrestlerA.id, m.wrestlerB.id]));
      for (const m of allMatches) {
        if (dayMatches.length >= matchesPerRound) break;
        if (dayMatches.find(dm => dm.id === m.id)) continue;
        if (usedInDay.has(m.wrestlerA.id) || usedInDay.has(m.wrestlerB.id)) continue;
        dayMatches.push(m);
        usedInDay.add(m.wrestlerA.id);
        usedInDay.add(m.wrestlerB.id);
      }
    }
    days.push({ id: `day_${r}`, name: `Día ${r + 1}`, matches: dayMatches });
  }

  // Si quedaron matches sin asignar (por redondeo / impar) agregarlos al último día
  const assignedIds = new Set(days.flatMap(d => d.matches.map(m => m.id)));
  const unassigned = allMatches.filter(m => !assignedIds.has(m.id));
  if (unassigned.length > 0 && days.length > 0) {
    days[days.length - 1].matches.push(...unassigned);
  }

  return { key: config.key, name: config.name, type: config.type, participants, standings, days, finalMatch: null, winnerId: null };
};

/**
 * Genera el Round Robin en Parejas (WTL).
 * Maneja el caso de pocos wrestlers heavy disponibles reduciendo el número de equipos.
 *
 * Bug fix: misma corrección de String(id) para standings.
 */
export const generateTagRoundRobin = (config, roster) => {
  const requestedTeams = config.participants; // cantidad de EQUIPOS pedida (ej: 8)
  const eligible = roster
    .filter(w => w.status === 'active' && w.weightClass === 'heavy')
    .sort(() => Math.random() - 0.5);

  // Cuántos equipos podemos realmente armar con los wrestlers disponibles
  const maxPossibleTeams = Math.floor(eligible.length / 2);
  const teamsCount = Math.max(2, Math.min(requestedTeams, maxPossibleTeams));

  const selectedWrestlers = eligible.slice(0, teamsCount * 2);

  const teams = [];
  for (let i = 0; i < teamsCount; i++) {
    const w1 = selectedWrestlers[i * 2];
    const w2 = selectedWrestlers[i * 2 + 1];
    if (!w1 || !w2) break; // safe guard
    teams.push({ id: `team_${i}`, name: `${w1.name} & ${w2.name}`, members: [w1, w2] });
  }

  if (teams.length < 2) {
    // No hay suficientes wrestlers; turno vacío
    return { key: config.key, name: config.name, type: config.type, teams: [], standings: {}, days: [], finalMatch: null, winnerId: null };
  }

  // standings keyed by String(team.id)
  const standings = {};
  teams.forEach(t => { standings[t.id] = { points: 0, matchesPlayed: 0 }; });

  const allMatches = [];
  let matchId = 0;
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      allMatches.push({ id: `t_tagrr_${matchId++}`, type: 'tag', teamA: teams[i].members, teamAId: teams[i].id, teamB: teams[j].members, teamBId: teams[j].id, winningSide: null });
    }
  }

  const shuffledMatches = [...allMatches].sort(() => Math.random() - 0.5);
  const matchesPerDay = Math.max(1, Math.floor(teams.length / 2));
  const daysCount = teams.length - 1;
  const days = [];
  for (let d = 0; d < daysCount; d++) {
    days.push({ id: `day_${d}`, name: `Día ${d + 1}`, matches: shuffledMatches.slice(d * matchesPerDay, (d + 1) * matchesPerDay) });
  }
  // Agregar sobras al último día
  const lastDayStart = daysCount * matchesPerDay;
  if (lastDayStart < shuffledMatches.length && days.length > 0) {
    days[days.length - 1].matches.push(...shuffledMatches.slice(lastDayStart));
  }

  return { key: config.key, name: config.name, type: config.type, teams, standings, days, finalMatch: null, winnerId: null };
};
