/**
 * ══════════════════════════════════════════════════════════════════════
 *  wrestlerStats.js — Derivación automática de stats de combate
 *
 *  A partir del `level` (1–10) y el `style` del luchador se calculan:
 *    power, technique, speed, toughness, hpMax
 *
 *  Multiplicadores: el valor base es `level`. Cada stat se multiplica
 *  por un factor según el estilo, y se redondea al entero más cercano.
 *  El resultado siempre se clampea entre 1 y 10.
 * ══════════════════════════════════════════════════════════════════════
 */

/**
 * Multiplicadores por estilo.
 * Cada fila suma ~4.0 para que un All-Rounder level 10 dé 10 en todo.
 *
 *                       power  technique  speed  toughness
 */
const STYLE_MULTIPLIERS = {
  "Powerhouse":           { power: 1.15, technique: 0.70, speed: 0.60, toughness: 1.15 },
  "Brawler":              { power: 1.05, technique: 0.65, speed: 0.70, toughness: 1.10 },
  "Technician":           { power: 0.70, technique: 1.15, speed: 0.90, toughness: 0.75 },
  "Submission Specialist":{ power: 0.65, technique: 1.20, speed: 0.75, toughness: 0.90 },
  "High Flyer":           { power: 0.65, technique: 0.95, speed: 1.20, toughness: 0.70 },
  "Heel":                 { power: 0.85, technique: 1.00, speed: 0.90, toughness: 0.85 },
  "All-Rounder":          { power: 1.00, technique: 1.00, speed: 1.00, toughness: 1.00 },
};

/**
 * Clampea un valor entre min y max.
 */
const clamp = (value, min = 1, max = 10) => Math.min(max, Math.max(min, value));

/**
 * Deriva las stats de combate a partir del level y el estilo.
 *
 * @param {number} level  - Valor 1–10.
 * @param {string} style  - Uno de los estilos definidos en STYLE_MULTIPLIERS.
 * @returns {{ power: number, technique: number, speed: number, toughness: number, hpMax: number }}
 */
export function deriveStats(level, style) {
  const m = STYLE_MULTIPLIERS[style] ?? STYLE_MULTIPLIERS["All-Rounder"];

  return {
    power:     clamp(Math.round(level * m.power)),
    technique: clamp(Math.round(level * m.technique)),
    speed:     clamp(Math.round(level * m.speed)),
    toughness: clamp(Math.round(level * m.toughness)),
    hpMax:     level * 10,   // 10 → 100 HP, 1 → 10 HP
  };
}
