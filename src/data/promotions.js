/**
 * ─── PROMOTION REGISTRY ────────────────────────────────────────────────────
 *
 * Cada promoción define su metadata, títulos, series de shows y torneos.
 * Para agregar una nueva promoción: agregá un objeto a PROMOTIONS y creá su
 * carpeta de datos en src/data/<id>/index.js siguiendo la misma convención.
 */

// ─── Series de shows NJPW ──────────────────────────────────────────────────
const NJPW_SERIES = [
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

const NJPW_SPECIAL_MONTHS = {
  3:  { key: 'njc',  name: 'New Japan Cup',             type: 'elimination',   icon: '🏆', participants: 32, weightClass: null   },
  6:  { key: 'bosj', name: 'Best of the Super Juniors', type: 'roundrobin',    icon: '✈️', participants: 8,  weightClass: 'junior' },
  9:  { key: 'g1',   name: 'G1 Climax',                 type: 'roundrobin',    icon: '🌟', participants: 10, weightClass: null   },
  12: { key: 'wtl',  name: 'World Tag League',           type: 'tagRoundRobin', icon: '🤝', participants: 8,  weightClass: 'heavy' },
};

// ─── Series de shows AJPW ──────────────────────────────────────────────────
const AJPW_SERIES = [
  { weeklyPrefix: 'AJPW Giant Series',       grandeLabel: 'Giant Series Final' },
  { weeklyPrefix: 'AJPW World Tag Series',   grandeLabel: 'World Tag Series Final' },
  { weeklyPrefix: 'AJPW Champion Carnival',  grandeLabel: 'Champion Carnival Final' },
  { weeklyPrefix: 'AJPW Real World Tag',     grandeLabel: 'Real World Tag League Final' },
  { weeklyPrefix: 'AJPW Super Power Series', grandeLabel: 'Super Power Series Tag 8' },
  { weeklyPrefix: 'AJPW Summer Action',      grandeLabel: 'Summer Action Series Tag 8' },
  { weeklyPrefix: 'AJPW Autumn Battle',      grandeLabel: 'Autumn Battle Series Tag 8' },
  { weeklyPrefix: 'AJPW New Year',           grandeLabel: 'New Year Giant Series Tag 8' },
];

const AJPW_SPECIAL_MONTHS = {
  4:  { key: 'cc',   name: 'Champion Carnival',     type: 'roundrobin',    icon: '', participants: 10, weightClass: null,   draftMode: true },
  7:  { key: 'ajt',  name: 'AJPW Junior Tournament', type: 'elimination',   icon: '', participants: 8,  weightClass: 'junior' },
  11: { key: 'rwtl', name: 'Real World Tag League',  type: 'tagRoundRobin', icon: '', participants: 8,  weightClass: 'heavy' },
};


// ─── US cities pool for WWF location-based shows ─────────────────────────────
export const US_CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Philadelphia', 'Phoenix',
  'San Antonio', 'San Diego', 'Dallas', 'Jacksonville', 'Austin', 'Memphis',
  'Baltimore', 'Boston', 'Seattle', 'Denver', 'Nashville', 'Detroit',
  'Louisville', 'Portland', 'Las Vegas', 'Milwaukee', 'Albuquerque', 'Cleveland',
  'Atlanta', 'Omaha', 'Minneapolis', 'Tulsa', 'Wichita', 'New Orleans',
  'Tampa', 'Pittsburgh', 'Buffalo', 'Cincinnati', 'St. Louis', 'Kansas City',
  'Madison Square Garden',
];

// ─── Series de shows WWF ───────────────────────────────────────────────────
// locationBased: true → show name generated with a random US city instead of a number
const WWF_SERIES = [
  { weeklyPrefix: 'WWF All Star Wrestling',        grandeLabel: 'WWF All Star Wrestling', locationBased: true },
  { weeklyPrefix: 'WWF Championship Wrestling',    grandeLabel: 'WWF Championship Wrestling', locationBased: true },
  { weeklyPrefix: 'WWF All Star Wrestling',        grandeLabel: 'WWF All Star Wrestling', locationBased: true },
  { weeklyPrefix: 'WWF Championship Wrestling',    grandeLabel: 'WWF Championship Wrestling', locationBased: true },
  { weeklyPrefix: 'WWF All Star Wrestling',        grandeLabel: 'WWF All Star Wrestling', locationBased: true },
  { weeklyPrefix: 'WWF Championship Wrestling',    grandeLabel: 'WWF Championship Wrestling', locationBased: true },
  { weeklyPrefix: 'WWF All Star Wrestling',        grandeLabel: 'WWF All Star Wrestling', locationBased: true },
  { weeklyPrefix: 'WWF Championship Wrestling',    grandeLabel: 'WWF Championship Wrestling', locationBased: true },
  { weeklyPrefix: 'WWF All Star Wrestling',        grandeLabel: 'WWF All Star Wrestling', locationBased: true },
  { weeklyPrefix: 'WWF Championship Wrestling',    grandeLabel: 'WWF Championship Wrestling', locationBased: true },
  { weeklyPrefix: 'WWF All Star Wrestling',        grandeLabel: 'WWF All Star Wrestling', locationBased: true },
  { weeklyPrefix: 'WWF Championship Wrestling',    grandeLabel: 'WWF Championship Wrestling', locationBased: true },
];

// ─── Torneos especiales WWF ────────────────────────────────────────────────
const WWF_SPECIAL_MONTHS = {
  6:  { key: 'kotr',    name: 'King of the Ring',    type: 'elimination',   icon: '👑', participants: 16, weightClass: null   },
  10: { key: 'wwf_tl',  name: 'WWF Tag Team Classic', type: 'tagRoundRobin', icon: '🤝', participants: 8,  weightClass: 'heavy' },
};

// ─── WWF series pools (evolucionan con los años) ───────────────────────────
const WWF_SERIES_CLASSIC = [
  { weeklyPrefix: 'WWF All Star Wrestling',     grandeLabel: 'WWF All Star Wrestling',     locationBased: true },
  { weeklyPrefix: 'WWF Championship Wrestling', grandeLabel: 'WWF Championship Wrestling', locationBased: true },
  { weeklyPrefix: 'WWF All Star Wrestling',     grandeLabel: 'WWF All Star Wrestling',     locationBased: true },
  { weeklyPrefix: 'WWF Championship Wrestling', grandeLabel: 'WWF Championship Wrestling', locationBased: true },
  { weeklyPrefix: 'WWF All Star Wrestling',     grandeLabel: 'WWF All Star Wrestling',     locationBased: true },
  { weeklyPrefix: 'WWF Championship Wrestling', grandeLabel: 'WWF Championship Wrestling', locationBased: true },
];
const WWF_SERIES_RAW = [
  { weeklyPrefix: 'WWF Monday Night Raw',       grandeLabel: 'WWF Monday Night Raw',       locationBased: true },
  { weeklyPrefix: 'WWF Championship Wrestling', grandeLabel: 'WWF Championship Wrestling', locationBased: true },
  { weeklyPrefix: 'WWF Monday Night Raw',       grandeLabel: 'WWF Monday Night Raw',       locationBased: true },
  { weeklyPrefix: 'WWF Championship Wrestling', grandeLabel: 'WWF Championship Wrestling', locationBased: true },
];
const WWF_SERIES_RAW_SD = [
  { weeklyPrefix: 'WWF Raw',       grandeLabel: 'WWF Raw',       locationBased: true },
  { weeklyPrefix: 'WWF SmackDown', grandeLabel: 'WWF SmackDown', locationBased: true },
  { weeklyPrefix: 'WWF Raw',       grandeLabel: 'WWF Raw',       locationBased: true },
  { weeklyPrefix: 'WWF SmackDown', grandeLabel: 'WWF SmackDown', locationBased: true },
];
const WWE_SERIES_RAW_SD = [
  { weeklyPrefix: 'WWE Raw',       grandeLabel: 'WWE Raw',       locationBased: true },
  { weeklyPrefix: 'WWE SmackDown', grandeLabel: 'WWE SmackDown', locationBased: true },
  { weeklyPrefix: 'WWE Raw',       grandeLabel: 'WWE Raw',       locationBased: true },
  { weeklyPrefix: 'WWE SmackDown', grandeLabel: 'WWE SmackDown', locationBased: true },
];

// ─── JCP / WCW series pools ────────────────────────────────────────────────
const JCP_SERIES_NWA = [
  { weeklyPrefix: 'NWA',                        grandeLabel: 'NWA',                        locationBased: true },
  { weeklyPrefix: 'NWA World Championship',     grandeLabel: 'NWA World Championship',     locationBased: true },
  { weeklyPrefix: 'NWA',                        grandeLabel: 'NWA',                        locationBased: true },
  { weeklyPrefix: 'NWA Worldwide Wrestling',    grandeLabel: 'NWA Worldwide Wrestling',    locationBased: true },
];
const JCP_SERIES_WCW_CLASSIC = [
  { weeklyPrefix: 'World Championship Wrestling', grandeLabel: 'World Championship Wrestling', locationBased: true },
  { weeklyPrefix: 'WCW Saturday Night',           grandeLabel: 'WCW Saturday Night',           locationBased: true },
  { weeklyPrefix: 'World Championship Wrestling', grandeLabel: 'World Championship Wrestling', locationBased: true },
  { weeklyPrefix: 'WCW Saturday Night',           grandeLabel: 'WCW Saturday Night',           locationBased: true },
];
const JCP_SERIES_NITRO = [
  { weeklyPrefix: 'WCW Monday Nitro', grandeLabel: 'WCW Monday Nitro', locationBased: true },
  { weeklyPrefix: 'WCW Saturday Night', grandeLabel: 'WCW Saturday Night', locationBased: true },
  { weeklyPrefix: 'WCW Monday Nitro', grandeLabel: 'WCW Monday Nitro', locationBased: true },
  { weeklyPrefix: 'WCW Saturday Night', grandeLabel: 'WCW Saturday Night', locationBased: true },
];
const JCP_SERIES_NITRO_THUNDER = [
  { weeklyPrefix: 'WCW Monday Nitro', grandeLabel: 'WCW Monday Nitro',   locationBased: true },
  { weeklyPrefix: 'WCW Thunder',      grandeLabel: 'WCW Thunder',        locationBased: true },
  { weeklyPrefix: 'WCW Monday Nitro', grandeLabel: 'WCW Monday Nitro',   locationBased: true },
  { weeklyPrefix: 'WCW Thunder',      grandeLabel: 'WCW Thunder',        locationBased: true },
  { weeklyPrefix: 'WCW Monday Nitro', grandeLabel: 'WCW Monday Nitro',   locationBased: true },
  { weeklyPrefix: 'WCW Thunder',      grandeLabel: 'WCW Thunder',        locationBased: true },
];

// ─── Torneos especiales JCP/WCW ────────────────────────────────────────────
const JCP_SPECIAL_MONTHS = {
  5:  { key: 'nwa_jr_rr', name: 'NWA Jr. Round Robin',   type: 'roundrobin',    icon: '⚡', participants: 8, weightClass: 'junior' },
  9:  { key: 'nwa_tl',    name: 'NWA World Tag Classic',  type: 'tagRoundRobin', icon: '🤝', participants: 8, weightClass: 'heavy'  },
};

// ─── Registro de promociones ───────────────────────────────────────────────
export const PROMOTIONS = [
  {
    id: 'njpw',
    name: 'New Japan Pro-Wrestling',
    shortName: 'NJPW',
    foundedYear: 1972,
    foldedYear: null,
    titles: {
      world:     'IWGP World Heavyweight',
      secondary: 'IWGP Intercontinental',
      junior:    'IWGP Jr. Heavyweight',
      tag:       'IWGP Tag Team',
    },
    series: NJPW_SERIES,
    specialMonths: NJPW_SPECIAL_MONTHS,
  },
  {
    id: 'ajpw',
    name: 'All Japan Pro-Wrestling',
    shortName: 'AJPW',
    foundedYear: 1972,
    foldedYear: null,
    titles: {
      world:     'PWF World Heavyweight',
      secondary: 'NWA International Heavyweight',
      junior:    'AJPW Jr. Heavyweight',
      tag:       'World Tag Team',
    },
    series: AJPW_SERIES,
    specialMonths: AJPW_SPECIAL_MONTHS,
  },
  {
    id: 'wwf',
    name: 'World Wrestling Federation',
    shortName: 'WWF',
    foundedYear: 1963,
    foldedYear: null,
    rename: {
      year: 2002, month: 5,
      name: 'World Wrestling Entertainment',
      shortName: 'WWE',
      newsText: 'La World Wrestling Federation cambia oficialmente su nombre a World Wrestling Entertainment (WWE) tras un fallo judicial a favor del World Wildlife Fund por el uso de las siglas WWF.',
    },
    titles: {
      world:     'WWF Championship',
      secondary: 'WWF Intercontinental',
      junior:    'King of the Ring',
      tag:       'WWF Tag Team',
    },
    titleRenames: {
      world:     [{ year: 2002, month: 5, name: 'WWE Championship' }],
      secondary: [{ year: 2002, month: 5, name: 'WWE Intercontinental Championship' }],
      tag:       [{ year: 2002, month: 5, name: 'WWE Tag Team Championship' }],
    },
    // series is chosen via seriesHistory based on current year/month
    series: WWF_SERIES_CLASSIC,  // fallback / default
    seriesHistory: [
      { fromYear: 1980, fromMonth: 1,  series: WWF_SERIES_CLASSIC   },
      { fromYear: 1993, fromMonth: 1,  series: WWF_SERIES_RAW        },
      { fromYear: 1999, fromMonth: 4,  series: WWF_SERIES_RAW_SD     },
      { fromYear: 2002, fromMonth: 5,  series: WWE_SERIES_RAW_SD     },
    ],
    specialMonths: WWF_SPECIAL_MONTHS,
  },
  {
    id: 'jcp',
    name: 'Jim Crockett Promotions',
    shortName: 'JCP',
    foundedYear: 1980,
    foldedYear: 2001,
    rename: {
      year: 1990, month: 1,
      name: 'World Championship Wrestling',
      shortName: 'WCW',
      newsText: 'Jim Crockett Promotions adopta oficialmente el nombre World Championship Wrestling (WCW), consolidando el control de Ted Turner sobre la compañía.',
    },
    // Extra news events (not rebrands)
    extraEvents: [
      {
        year: 1988, month: 11,
        text: 'Ted Turner adquiere Jim Crockett Promotions. La NWA queda en manos del magnate de la televisión por cable de Atlanta.',
      },
    ],
    titles: {
      world:     'NWA World Heavyweight',
      secondary: 'NWA United States Heavyweight',
      junior:    'NWA World Jr. Heavyweight',
      tag:       'NWA World Tag Team',
    },
    titleRenames: {
      world:     [{ year: 1991, month: 1, name: 'WCW World Heavyweight' }],
      secondary: [{ year: 1991, month: 1, name: 'WCW United States Heavyweight' }],
      junior:    [{ year: 1993, month: 1, name: 'WCW Cruiserweight' }],
      tag:       [{ year: 1991, month: 1, name: 'WCW World Tag Team' }],
    },
    series: JCP_SERIES_NWA,  // fallback
    seriesHistory: [
      { fromYear: 1980, fromMonth: 1,  series: JCP_SERIES_NWA         },
      { fromYear: 1990, fromMonth: 1,  series: JCP_SERIES_WCW_CLASSIC },
      { fromYear: 1995, fromMonth: 9,  series: JCP_SERIES_NITRO       },
      { fromYear: 1998, fromMonth: 1,  series: JCP_SERIES_NITRO_THUNDER },
    ],
    specialMonths: JCP_SPECIAL_MONTHS,
  },

];

/** Devuelve las promociones activas para un año dado */
export const getActivePromotions = (year) =>
  PROMOTIONS.filter(p => p.foundedYear <= year && (p.foldedYear === null || p.foldedYear >= year));

/** Devuelve una promoción por id */
export const getPromotion = (id) => PROMOTIONS.find(p => p.id === id);

/** Devuelve el shortName actual de una promoción según el año/mes de juego */
export const getPromoShortName = (promo, year, month) => {
  if (!promo?.rename) return promo?.shortName ?? '';
  const r = promo.rename;
  if (year > r.year || (year === r.year && month >= r.month)) return r.shortName;
  return promo.shortName;
};

/** Devuelve el nombre completo actual de una promoción según el año/mes de juego */
export const getPromoName = (promo, year, month) => {
  if (!promo?.rename) return promo?.name ?? '';
  const r = promo.rename;
  if (year > r.year || (year === r.year && month >= r.month)) return r.name;
  return promo.name;
};

/** Devuelve el nombre actualizado de un título según el año/mes de juego */
export const getTitleName = (promoConfig, belt, year, month) => {
  const base = promoConfig?.titles?.[belt] ?? '';
  const renames = promoConfig?.titleRenames?.[belt];
  if (!renames || renames.length === 0) return base;
  const applicable = renames
    .filter(r => year > r.year || (year === r.year && month >= (r.month ?? 1)))
    .sort((a, b) => b.year !== a.year ? b.year - a.year : (b.month ?? 1) - (a.month ?? 1));
  return applicable.length > 0 ? applicable[0].name : base;
};

/** Devuelve la pool de series correcta para un año/mes dado */
export const getSeriesForYearMonth = (promoConfig, year, month) => {
  if (!promoConfig?.seriesHistory || promoConfig.seriesHistory.length === 0) {
    return promoConfig?.series ?? [];
  }
  const applicable = promoConfig.seriesHistory
    .filter(sh => year > sh.fromYear || (year === sh.fromYear && month >= sh.fromMonth))
    .sort((a, b) => b.fromYear !== a.fromYear ? b.fromYear - a.fromYear : b.fromMonth - a.fromMonth);
  return applicable.length > 0 ? applicable[0].series : promoConfig.series;
};
