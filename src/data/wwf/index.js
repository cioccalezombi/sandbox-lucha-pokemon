/**
 * ─── ROSTERS WWF POR AÑO ──────────────────────────────────────────────────
 * - Solo exporta los luchadores NUEVOS de cada año.
 * - Al avanzar año, el sistema hace merge con los anteriores.
 */

import { roster1980 } from './1980';

const ROSTERS = {
  1980: roster1980,
};

export const getRosterForYear = (year) => ROSTERS[year] || [];

export { roster1980 };
