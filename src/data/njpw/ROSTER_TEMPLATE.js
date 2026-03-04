/**
 * ══════════════════════════════════════════════════════════════════════
 *  TEMPLATE DE ROSTER — NJPW [AÑO]
 *  Copiá este archivo, renombralo a <año>.js y completá los datos.
 * ══════════════════════════════════════════════════════════════════════
 *
 * CAMPOS OBLIGATORIOS
 * ───────────────────
 *  id             string   Snake_case único. Si el luchador ya existe en otro año, usá el MISMO id.
 *  name           string   Nombre completo.
 *  birthYear      number   Año de nacimiento (para calcular edad y prime).
 *  debutYear      number   Año de debut profesional.
 *  retirementYear number|null  null = sigue activo.
 *  weightClass    string   "heavy" | "junior"
 *  promotion      string   "NJPW" | "AJPW" | "UWF" | etc.
 *  status         string   Siempre "active" en el archivo base.
 *
 * STATS DE COMBATE (1–10, enteros)
 * ────────────────────────────────
 *  level          1–10     Estrellato / importancia en el card.
 *  hpMax          60–130   HP máximo. Regulars: ~90, monsters: ~120+
 *  power          1–10     Fuerza física. Relevante para slams, powerbombs.
 *  technique      1–10     Técnica. Relevante para llaves, escapes.
 *  speed          1–10     Velocidad. Afecta iniciativa y movimientos aéreos.
 *  toughness      1–10     Resistencia al daño. Cuánto aguanta antes de caer.
 *
 * ESTILOS DISPONIBLES (style)
 * ────────────────────────────
 *  "Technician"          Técnico puro, buenas llaves.
 *  "Powerhouse"          Grande y poderoso, poco veloz.
 *  "High Flyer"          Aéreo y veloz.
 *  "Brawler"             Pegador, agresivo.
 *  "Submission Specialist" Especialista en llaves de sumisión.
 *  "Heel"                 Rudo que hace trampa.
 *  "All-Rounder"          Equilibrado.
 *
 * REFERENCIA DE LEVEL / CARD POSITION
 * ─────────────────────────────────────
 *  10   World Champion caliber / Legend
 *  8-9  Main Eventer
 *  6-7  Upper Midcard
 *  4-5  Midcard
 *  2-3  Opener / Enhancement talent
 *  1    Jobber
 *
 * REFERENCIA RÁPIDA DE STATS
 * ───────────────────────────
 *  power 10     = André The Giant, Vader
 *  technique 10 = Inoki, Liger
 *  speed 10     = Tiger Mask, Jushin Liger
 *  toughness 10 = André The Giant
 *  Un main eventer típico tiene 2-3 stats en 8-9 y el resto en 5-7.
 *
 * ══════════════════════════════════════════════════════════════════════
 */

export const rosterXXXX = [

  // ── MAIN EVENTERS ──────────────────────────────────────────────────
  {
    id: "nombre_apellido",         // ← mismo ID en todos los años
    name: "Nombre Apellido",
    birthYear: 1950,
    debutYear: 1970,
    retirementYear: null,          // null = sigue activo
    weightClass: "heavy",          // "heavy" | "junior"
    promotion: "NJPW",
    status: "active",
    unavailableWeeks: 0,
    style: "Powerhouse",
    level: 9,
    hpMax: 105,
    power: 9,
    technique: 6,
    speed: 5,
    toughness: 8,
    titles:   { world: 0, secondary: 0, junior: 0, tag: 0 },
    defenses: { world: 0, secondary: 0, junior: 0, tag: 0 },
    achievements: []
  },

  // ── UPPER MIDCARD ─────────────────────────────────────────────────
  {
    id: "otro_luchador",
    name: "Otro Luchador",
    birthYear: 1960,
    debutYear: 1980,
    retirementYear: 2005,
    weightClass: "heavy",
    promotion: "NJPW",
    status: "active",
    unavailableWeeks: 0,
    style: "Technician",
    level: 7,
    hpMax: 95,
    power: 7,
    technique: 8,
    speed: 7,
    toughness: 7,
    titles:   { world: 0, secondary: 0, junior: 0, tag: 0 },
    defenses: { world: 0, secondary: 0, junior: 0, tag: 0 },
    achievements: []
  },

  // ── JUNIOR HEAVYWEIGHTS ─────────────────────────────────────────────
  {
    id: "junior_volador",
    name: "Junior Volador",
    birthYear: 1965,
    debutYear: 1985,
    retirementYear: null,
    weightClass: "junior",         // ← "junior" para BOSJ
    promotion: "NJPW",
    status: "active",
    unavailableWeeks: 0,
    style: "High Flyer",
    level: 8,
    hpMax: 82,
    power: 5,
    technique: 9,
    speed: 10,
    toughness: 5,
    titles:   { world: 0, secondary: 0, junior: 0, tag: 0 },
    defenses: { world: 0, secondary: 0, junior: 0, tag: 0 },
    achievements: []
  },

];
