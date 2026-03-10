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
 *  weightClass    string   "heavy" | "junior"
 *  promotion      string   "NJPW" | "AJPW" | "UWF" | etc.
 *  status         string   Siempre "active" en el archivo base.
 *
 * STATS DE COMBATE (1–10, enteros)
 * ────────────────────────────────
 *  level          1–10     Estrellato / importancia en el card.
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
 *
 * REFERENCIA RÁPIDA DE STATS (Generadas Automáticamente)
 * ──────────────────────────────────────────────────────
 *  hpMax, power, technique, speed y toughness se autogeneran 
 *  dependiendo del level y el estilo (style) del luchador.
 *
 * ══════════════════════════════════════════════════════════════════════
 */

export const rosterXXXX = [

  {
    id: "nombre_apellido",         // ← mismo ID en todos los años
    name: "Nombre Apellido",
    birthYear: 1950,
    weightClass: "heavy",          // "heavy" | "junior"
    promotion: "NJPW",
    status: "active",
    unavailableWeeks: 0,
    style: "Powerhouse",
    level: 9,
    titles:   { world: 0, secondary: 0, junior: 0, tag: 0 },
    defenses: { world: 0, secondary: 0, junior: 0, tag: 0 },
    achievements: []
  },

  // ── UPPER MIDCARD ─────────────────────────────────────────────────
  {
    id: "otro_luchador",
    name: "Otro Luchador",
    birthYear: 1960,
    retirementYear: 2005,
    weightClass: "heavy",
    promotion: "NJPW",
    status: "active",
    unavailableWeeks: 0,
    style: "Technician",
    level: 7,
    titles:   { world: 0, secondary: 0, junior: 0, tag: 0 },
    defenses: { world: 0, secondary: 0, junior: 0, tag: 0 },
    achievements: []
  },

  // ── JUNIOR HEAVYWEIGHTS ─────────────────────────────────────────────
  {
    id: "junior_volador",
    name: "Junior Volador",
    birthYear: 1965,
    retirementYear: null,
    weightClass: "junior",         // ← "junior" para BOSJ
    promotion: "NJPW",
    status: "active",
    unavailableWeeks: 0,
    style: "High Flyer",
    level: 8,
    titles:   { world: 0, secondary: 0, junior: 0, tag: 0 },
    defenses: { world: 0, secondary: 0, junior: 0, tag: 0 },
    achievements: []
  },

];
