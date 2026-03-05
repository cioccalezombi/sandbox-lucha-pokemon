const fs = require('fs');
const path = require('path');

const wrestlersData = [
  // 1980
  { name: "Giant Baba", year: 1980, level: 10, birthYear: 1938, retirementYear: 1999, style: "Powerhouse", weightClass: "heavy" },
  { name: "Jumbo Tsuruta", year: 1980, level: 9, birthYear: 1951, retirementYear: 1999, style: "All-Rounder", weightClass: "heavy" },
  { name: "Mil Mascaras", year: 1980, level: 8, birthYear: 1942, retirementYear: null, style: "High-Flyer", weightClass: "heavy" },
  { name: "Abdullah The Butcher", year: 1980, level: 9, birthYear: 1941, retirementYear: 2011, style: "Brawler", weightClass: "heavy" },
  { name: "The Destroyer", year: 1980, level: 8, birthYear: 1930, retirementYear: 1993, style: "Technical", weightClass: "heavy" },
  { name: "Terry Funk", year: 1980, level: 9, birthYear: 1944, retirementYear: 2017, style: "Brawler", weightClass: "heavy" },
  { name: "Dory Funk Jr.", year: 1980, level: 9, birthYear: 1941, retirementYear: 2017, style: "Technical", weightClass: "heavy" },
  { name: "Bruiser Brody", year: 1980, level: 9, birthYear: 1946, retirementYear: 1988, style: "Brawler", weightClass: "heavy" },
  { name: "Tiger Jeet Singh", year: 1980, level: 8, birthYear: 1948, retirementYear: 2010, style: "Brawler", weightClass: "heavy" },
  { name: "Haruka Eigen", year: 1980, level: 4, birthYear: 1946, retirementYear: 2006, style: "Brawler", weightClass: "heavy" },
  { name: "Great Kojika", year: 1980, level: 6, birthYear: 1942, retirementYear: null, style: "Brawler", weightClass: "heavy" },
  { name: "Motoshi Okuma", year: 1980, level: 6, birthYear: 1941, retirementYear: 1992, style: "Powerhouse", weightClass: "heavy" },
  { name: "Rocky Hata", year: 1980, level: 5, birthYear: 1948, retirementYear: 1983, style: "Powerhouse", weightClass: "heavy" },
  { name: "Akihisa Mera", year: 1980, level: 5, birthYear: 1948, retirementYear: 1997, style: "Technical", weightClass: "heavy" },
  { name: "Masanobu Fuchi", year: 1980, level: 4, birthYear: 1954, retirementYear: null, style: "Technical", weightClass: "junior" },
  { name: "Atsushi Onita", year: 1980, level: 4, birthYear: 1957, retirementYear: null, style: "Brawler", weightClass: "junior" },
  { name: "Shiro Koshinaka", year: 1980, level: 3, birthYear: 1958, retirementYear: null, style: "All-Rounder", weightClass: "junior" },

  // 1981
  { name: "Genichiro Tenryu", year: 1981, level: 7, birthYear: 1950, retirementYear: 2015, style: "Brawler", weightClass: "heavy" },
  { name: "Stan Hansen", year: 1981, level: 10, birthYear: 1949, retirementYear: 2001, style: "Brawler", weightClass: "heavy" },
  { name: "Ricky Steamboat", year: 1981, level: 8, birthYear: 1953, retirementYear: 2010, style: "Technical", weightClass: "heavy" },
  { name: "Jimmy Snuka", year: 1981, level: 8, birthYear: 1943, retirementYear: 2015, style: "High-Flyer", weightClass: "heavy" },
  { name: "Ric Flair", year: 1981, level: 9, birthYear: 1949, retirementYear: 2022, style: "Technical", weightClass: "heavy" },
  { name: "Ted DiBiase", year: 1981, level: 8, birthYear: 1954, retirementYear: 1993, style: "Technical", weightClass: "heavy" },
  { name: "Ashura Hara", year: 1981, level: 6, birthYear: 1947, retirementYear: 2004, style: "Powerhouse", weightClass: "heavy" },
  { name: "Takashi Ishikawa", year: 1981, level: 4, birthYear: 1953, retirementYear: 2002, style: "Powerhouse", weightClass: "heavy" },
  { name: "Kazuharu Sonoda", year: 1981, level: 4, birthYear: 1956, retirementYear: 1987, style: "Technical", weightClass: "junior" },

  // 1982
  { name: "Chavo Guerrero", year: 1982, level: 8, birthYear: 1949, retirementYear: 1990, style: "Technical", weightClass: "junior" },
  { name: "Gino Hernandez", year: 1982, level: 7, birthYear: 1957, retirementYear: 1986, style: "Technical", weightClass: "heavy" },
  { name: "Rick Martel", year: 1982, level: 8, birthYear: 1956, retirementYear: 1999, style: "All-Rounder", weightClass: "heavy" },
  { name: "Wahoo McDaniel", year: 1982, level: 8, birthYear: 1938, retirementYear: 1996, style: "Brawler", weightClass: "heavy" },
  { name: "Jay Youngblood", year: 1982, level: 7, birthYear: 1955, retirementYear: 1985, style: "Technical", weightClass: "heavy" },
  { name: "Goro Tsurumi", year: 1982, level: 5, birthYear: 1948, retirementYear: 2013, style: "Brawler", weightClass: "heavy" },
  { name: "Magic Dragon", year: 1982, level: 5, birthYear: 1956, retirementYear: 1987, style: "High-Flyer", weightClass: "junior" },
  { name: "Super Destroyer", year: 1982, level: 7, birthYear: 1952, retirementYear: 1987, style: "Powerhouse", weightClass: "heavy" },
  { name: "Umanosuke Ueda", year: 1982, level: 7, birthYear: 1940, retirementYear: 1996, style: "Brawler", weightClass: "heavy" },

  // 1984
  { name: "Riki Choshu", year: 1984, level: 9, birthYear: 1951, retirementYear: 2019, style: "Powerhouse", weightClass: "heavy" },
  { name: "Yoshiaki Yatsu", year: 1984, level: 8, birthYear: 1956, retirementYear: null, style: "Technical", weightClass: "heavy" },
  { name: "Animal Hamaguchi", year: 1984, level: 7, birthYear: 1947, retirementYear: 1995, style: "Brawler", weightClass: "heavy" },
  { name: "Isamu Teranishi", year: 1984, level: 6, birthYear: 1946, retirementYear: 1992, style: "Technical", weightClass: "junior" },
  { name: "Kuniaki Kobayashi", year: 1984, level: 7, birthYear: 1956, retirementYear: 2000, style: "Technical", weightClass: "junior" },
  { name: "Kurisu", year: 1984, level: 5, birthYear: 1952, retirementYear: 1997, style: "Brawler", weightClass: "heavy" },
  { name: "Norio Honaga", year: 1984, level: 4, birthYear: 1955, retirementYear: 1998, style: "Technical", weightClass: "junior" },
  { name: "Tiger Mask II", year: 1984, level: 8, birthYear: 1962, retirementYear: 2009, style: "High-Flyer", weightClass: "junior" },
  { name: "Davey Boy Smith", year: 1984, level: 8, birthYear: 1962, retirementYear: 2000, style: "Powerhouse", weightClass: "heavy" },
  { name: "Dynamite Kid", year: 1984, level: 8, birthYear: 1958, retirementYear: 1996, style: "High-Flyer", weightClass: "junior" },

  // 1985
  { name: "Road Warrior Animal", year: 1985, level: 9, birthYear: 1960, retirementYear: 2012, style: "Powerhouse", weightClass: "heavy" },
  { name: "Road Warrior Hawk", year: 1985, level: 9, birthYear: 1957, retirementYear: 2003, style: "Powerhouse", weightClass: "heavy" },
  { name: "Stan Lane", year: 1985, level: 8, birthYear: 1953, retirementYear: 1993, style: "Technical", weightClass: "heavy" },

  // 1986
  { name: "Steve Williams", year: 1986, level: 8, birthYear: 1960, retirementYear: 2009, style: "Powerhouse", weightClass: "heavy" },
  { name: "Terry Gordy", year: 1986, level: 8, birthYear: 1961, retirementYear: 2001, style: "Powerhouse", weightClass: "heavy" },
  { name: "Tom Zenk", year: 1986, level: 6, birthYear: 1958, retirementYear: 1996, style: "All-Rounder", weightClass: "heavy" },
  { name: "Dan Kroffat", year: 1986, level: 7, birthYear: 1960, retirementYear: 1999, style: "Technical", weightClass: "junior" },
  { name: "Doug Furnas", year: 1986, level: 7, birthYear: 1959, retirementYear: 2000, style: "Powerhouse", weightClass: "heavy" },

  // 1987
  { name: "Hiroshi Wajima", year: 1987, level: 7, birthYear: 1948, retirementYear: 1988, style: "Powerhouse", weightClass: "heavy" },
  { name: "John Tenta", year: 1987, level: 8, birthYear: 1963, retirementYear: 2004, style: "Powerhouse", weightClass: "heavy" },
  { name: "Abdullah Tamba", year: 1987, level: 5, birthYear: 1948, retirementYear: 1993, style: "Brawler", weightClass: "heavy" },
  { name: "Brian Adams", year: 1987, level: 6, birthYear: 1964, retirementYear: 2003, style: "Powerhouse", weightClass: "heavy" },

  // 1988
  { name: "Johnny Ace", year: 1988, level: 6, birthYear: 1962, retirementYear: 2000, style: "All-Rounder", weightClass: "heavy" },
  { name: "Dan Spivey", year: 1988, level: 7, birthYear: 1952, retirementYear: 1995, style: "Brawler", weightClass: "heavy" },
  { name: "Gary Albright", year: 1988, level: 8, birthYear: 1963, retirementYear: 2000, style: "Powerhouse", weightClass: "heavy" },
  { name: "Toshiaki Kawada", year: 1988, level: 9, birthYear: 1963, retirementYear: 2010, style: "Brawler", weightClass: "heavy" },
  { name: "Akira Taue", year: 1988, level: 8, birthYear: 1961, retirementYear: 2013, style: "Powerhouse", weightClass: "heavy" },
  { name: "Kenta Kobashi", year: 1988, level: 9, birthYear: 1967, retirementYear: 2013, style: "Powerhouse", weightClass: "heavy" },
  { name: "Yoshinari Ogawa", year: 1988, level: 7, birthYear: 1966, retirementYear: null, style: "Technical", weightClass: "junior" },
  { name: "Tsuyoshi Kikuchi", year: 1988, level: 6, birthYear: 1964, retirementYear: null, style: "Brawler", weightClass: "junior" },

  // 1990
  { name: "Mitsuharu Misawa", year: 1990, level: 10, birthYear: 1962, retirementYear: 2009, style: "Technical", weightClass: "heavy" },
  { name: "Patriot", year: 1990, level: 7, birthYear: 1961, retirementYear: 2001, style: "Powerhouse", weightClass: "heavy" },
  { name: "Eagle", year: 1990, level: 6, birthYear: 1958, retirementYear: 2001, style: "High-Flyer", weightClass: "heavy" },
  { name: "Rex King", year: 1990, level: 5, birthYear: 1961, retirementYear: 2017, style: "Brawler", weightClass: "heavy" },
  { name: "Steve Cox", year: 1990, level: 5, birthYear: 1958, retirementYear: 1993, style: "Brawler", weightClass: "heavy" },
  { name: "Johnny Smith", year: 1990, level: 6, birthYear: 1965, retirementYear: 2003, style: "Technical", weightClass: "junior" },
  { name: "Giant Kimala II", year: 1990, level: 6, birthYear: 1950, retirementYear: 2004, style: "Brawler", weightClass: "heavy" },
  { name: "Rob Van Dam", year: 1990, level: 6, birthYear: 1970, retirementYear: null, style: "High-Flyer", weightClass: "heavy" },
  { name: "Tamon Honda", year: 1990, level: 6, birthYear: 1963, retirementYear: null, style: "Technical", weightClass: "heavy" },

  // 1992
  { name: "Jun Akiyama", year: 1992, level: 8, birthYear: 1969, retirementYear: null, style: "Technical", weightClass: "heavy" },
  { name: "Takao Omori", year: 1992, level: 7, birthYear: 1969, retirementYear: null, style: "Brawler", weightClass: "heavy" },
  { name: "Satoru Asako", year: 1992, level: 5, birthYear: 1971, retirementYear: 2004, style: "High-Flyer", weightClass: "junior" },

  // 1994
  { name: "Kentaro Shiga", year: 1994, level: 5, birthYear: 1974, retirementYear: 2009, style: "Technical", weightClass: "heavy" },

  // 1996
  { name: "Yoshinobu Kanemaru", year: 1996, level: 6, birthYear: 1976, retirementYear: null, style: "Technical", weightClass: "junior" },
  { name: "Maunakea Mossman", year: 1996, level: 7, birthYear: 1975, retirementYear: 2018, style: "Technical", weightClass: "heavy" },

  // 1998
  { name: "Vader", year: 1998, level: 9, birthYear: 1955, retirementYear: 2017, style: "Powerhouse", weightClass: "heavy" },
  { name: "Hayabusa", year: 1998, level: 8, birthYear: 1968, retirementYear: 2001, style: "High-Flyer", weight: "junior" },
  { name: "Jinsei Shinzaki", year: 1998, level: 7, birthYear: 1966, retirementYear: null, style: "High-Flyer", weightClass: "heavy" },
  { name: "Kodo Fuyuki", year: 1998, level: 7, birthYear: 1960, retirementYear: 2003, style: "Brawler", weightClass: "heavy" },
  { name: "Jado", year: 1998, level: 6, birthYear: 1968, retirementYear: null, style: "Brawler", weightClass: "junior" },
  { name: "Gedo", year: 1998, level: 6, birthYear: 1969, retirementYear: null, style: "Technical", weightClass: "junior" },

  // 2004
  { name: "Suwama", year: 2004, level: 8, birthYear: 1976, retirementYear: null, style: "Powerhouse", weightClass: "heavy" },

  // 2008
  { name: "Kento Miyahara", year: 2008, level: 9, birthYear: 1989, retirementYear: null, style: "All-Rounder", weightClass: "heavy" }
];

const dirPath = 'c:/dev/sandbox-lucha-pokemon/src/data/ajpw';

const rosterByYear = {};

wrestlersData.forEach(w => {
  if (!rosterByYear[w.year]) {
    rosterByYear[w.year] = [];
  }
  
  let hpMax = Number((75 + (w.level * 4)).toFixed(0));
  let pow = Math.floor(w.level * 0.9);
  let tech = Math.floor(w.level * 0.9);
  let spd = Math.floor(w.level * 0.9);
  let tgh = Math.floor(w.level * 0.9);

  if (w.style === "Powerhouse") { pow += 2; tgh += 1; spd -= 1; }
  else if (w.style === "High-Flyer") { spd += 2; tech += 1; tgh -= 1; }
  else if (w.style === "Technical") { tech += 2; pow -= 1; }
  else if (w.style === "Brawler") { tgh += 2; pow += 1; tech -= 1; }
  else if (w.style === "All-Rounder") { tech += 1; spd += 1; hpMax += 5; }

  pow = Math.max(1, Math.min(10, pow));
  tech = Math.max(1, Math.min(10, tech));
  spd = Math.max(1, Math.min(10, spd));
  tgh = Math.max(1, Math.min(10, tgh));

  if (w.level >= 9) {
     if (w.style === "Powerhouse") pow = w.level;
     if (w.style === "Technical") tech = w.level;
  }
  
  const idValue = w.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const wClass = w.weightClass || w.weight || "heavy";

  const wrestlerObj = {
    id: idValue,
    name: w.name,
    birthYear: w.birthYear,
    debutYear: w.year,
    retirementYear: w.retirementYear,
    weightClass: wClass,
    promotion: 'AJPW',
    status: 'active',
    unavailableWeeks: 0,
    style: w.style,
    level: w.level,
    hpMax: hpMax,
    power: pow,
    technique: tech,
    speed: spd,
    toughness: tgh,
    titles: { world: 0, secondary: 0, junior: 0, tag: 0 },
    defenses: { world: 0, secondary: 0, junior: 0, tag: 0 },
    achievements: []
  };
  
  rosterByYear[w.year].push(wrestlerObj);
});

for (const year of Object.keys(rosterByYear)) {
  const filePath = path.join(dirPath, `${year}.js`);
  const wrestlersJson = JSON.stringify(rosterByYear[year], null, 2);
  const fileContent = `export const roster${year} = ${wrestlersJson};\n`;
  fs.writeFileSync(filePath, fileContent, 'utf8');
}

console.log('Successfully generated AJPW rosters.');
