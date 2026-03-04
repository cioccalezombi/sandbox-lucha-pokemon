/**
 * ─── ROSTERS POR AÑO ──────────────────────────────────────────────────────────
 *
 * Cada archivo exporta solo los luchadores NUEVOS de ese año.
 * Al avanzar año, el sistema hace merge: mantiene los anteriores y agrega los nuevos.
 *
 * Convención:
 *  - ID único y consistente entre años (snake_case del nombre)
 *  - Si un luchador ya existe en el roster, el merge lo ignora (no duplica)
 */

import { roster1980 } from './1980';
import { roster1981 } from './1981';
import { roster1982 } from './1982';
import { roster1983 } from './1983';
import { roster1984 } from './1984';
import { roster1985 } from './1985';
import { roster1986 } from './1986';
import { roster1987 } from './1987';
import { roster1988 } from './1988';
import { roster1989 } from './1989';
import { roster1990 } from './1990';
import { roster1991 } from './1991';
import { roster1992 } from './1992';
import { roster1993 } from './1993';
import { roster1994 } from './1994';
import { roster1995 } from './1995';
import { roster1996 } from './1996';
import { roster1997 } from './1997';
import { roster1998 } from './1998';
import { roster1999 } from './1999';
import { roster2000 } from './2000';
import { roster2001 } from './2001';
import { roster2002 } from './2002';
import { roster2003 } from './2003';
import { roster2004 } from './2004';
import { roster2005 } from './2005';
import { roster2006 } from './2006';
import { roster2007 } from './2007';
import { roster2008 } from './2008';
import { roster2009 } from './2009';
import { roster2010 } from './2010';
import { roster2011 } from './2011';
import { roster2012 } from './2012';
import { roster2013 } from './2013';
import { roster2014 } from './2014';
import { roster2015 } from './2015';
import { roster2016 } from './2016';
import { roster2017 } from './2017';
import { roster2018 } from './2018';
import { roster2019 } from './2019';
import { roster2020 } from './2020';
import { roster2021 } from './2021';
import { roster2022 } from './2022';
import { roster2023 } from './2023';
import { roster2024 } from './2024';
import { roster2025 } from './2025';

const ROSTERS = {
  1980: roster1980,
  1981: roster1981,
  1982: roster1982,
  1983: roster1983,
  1984: roster1984,
  1985: roster1985,
  1986: roster1986,
  1987: roster1987,
  1988: roster1988,
  1989: roster1989,
  1990: roster1990,
  1991: roster1991,
  1992: roster1992,
  1993: roster1993,
  1994: roster1994,
  1995: roster1995,
  1996: roster1996,
  1997: roster1997,
  1998: roster1998,
  1999: roster1999,
  2000: roster2000,
  2001: roster2001,
  2002: roster2002,
  2003: roster2003,
  2004: roster2004,
  2005: roster2005,
  2006: roster2006,
  2007: roster2007,
  2008: roster2008,
  2009: roster2009,
  2010: roster2010,
  2011: roster2011,
  2012: roster2012,
  2013: roster2013,
  2014: roster2014,
  2015: roster2015,
  2016: roster2016,
  2017: roster2017,
  2018: roster2018,
  2019: roster2019,
  2020: roster2020,
  2021: roster2021,
  2022: roster2022,
  2023: roster2023,
  2024: roster2024,
  2025: roster2025,
};

/**
 * Devuelve el roster INCREMENTAL para un año dado.
 * Solo incluye los luchadores nuevos de ese año.
 * Si el año exacto no existe, devuelve array vacío (nada nuevo ese año).
 * @param {number} year
 * @returns {Array}
 */
export const getRosterForYear = (year) => {
  return ROSTERS[year] || [];
};

export { roster1980 };
