const fs = require('fs');
const path = require('path');

const wrestlersData = [
  // 2010
  { name: "Yoshihiro Takayama", year: 2010, level: 8, birthYear: 1966, retirementYear: 2017, style: "Brawler", weightClass: "heavy" },
  { name: "Masayuki Kono", year: 2010, level: 6, birthYear: 1980, retirementYear: null, style: "Powerhouse", weightClass: "heavy" },
  { name: "Ryota Hama", year: 2010, level: 6, birthYear: 1979, retirementYear: null, style: "Powerhouse", weightClass: "heavy" },
  { name: "KAI", year: 2010, level: 6, birthYear: 1983, retirementYear: null, style: "High-Flyer", weightClass: "junior" },
  { name: "Hiroshi Yamato", year: 2010, level: 5, birthYear: 1983, retirementYear: null, style: "Technical", weightClass: "junior" },
  { name: "Shuji Ishikawa", year: 2010, level: 7, birthYear: 1975, retirementYear: null, style: "Powerhouse", weightClass: "heavy" },

  // 2011
  { name: "Koji Kanemoto", year: 2011, level: 7, birthYear: 1966, retirementYear: null, style: "Technical", weightClass: "junior" },
  { name: "Minoru Tanaka", year: 2011, level: 6, birthYear: 1972, retirementYear: null, style: "Technical", weightClass: "junior" },
  { name: "Takumi Soya", year: 2011, level: 4, birthYear: 1988, retirementYear: null, style: "Powerhouse", weightClass: "heavy" },

  // 2012
  { name: "Andy Wu", year: 2012, level: 4, birthYear: 1989, retirementYear: null, style: "High-Flyer", weightClass: "junior" },

  // 2013
  { name: "SUSHI", year: 2013, level: 4, birthYear: 1983, retirementYear: null, style: "All-Rounder", weightClass: "junior" },

  // 2014
  { name: "Yuma Aoyagi", year: 2014, level: 8, birthYear: 1995, retirementYear: null, style: "Technical", weightClass: "heavy" },
  { name: "Naoya Nomura", year: 2014, level: 7, birthYear: 1993, retirementYear: null, style: "Powerhouse", weightClass: "heavy" },

  // 2015
  { name: "Jake Lee", year: 2015, level: 9, birthYear: 1989, retirementYear: null, style: "Brawler", weightClass: "heavy" },
  { name: "Shotaro Ashino", year: 2015, level: 7, birthYear: 1990, retirementYear: null, style: "Technical", weightClass: "heavy" },

  // 2016
  { name: "Koji Iwamoto", year: 2016, level: 6, birthYear: 1990, retirementYear: null, style: "Technical", weightClass: "junior" },

  // 2017
  { name: "Yusuke Okada", year: 2017, level: 4, birthYear: 1993, retirementYear: null, style: "Technical", weightClass: "junior" },

  // 2018
  { name: "Hokuto Omori", year: 2018, level: 6, birthYear: 1995, retirementYear: null, style: "All-Rounder", weightClass: "heavy" },
  { name: "Dan Tamura", year: 2018, level: 5, birthYear: 1998, retirementYear: null, style: "Powerhouse", weightClass: "heavy" },

  // 2019
  { name: "Atsuki Aoyagi", year: 2019, level: 7, birthYear: 1999, retirementYear: null, style: "High-Flyer", weightClass: "junior" },
  { name: "Rising HAYATO", year: 2019, level: 6, birthYear: 1999, retirementYear: null, style: "High-Flyer", weightClass: "junior" },

  // 2020
  { name: "Ryuki Honda", year: 2020, level: 7, birthYear: 2000, retirementYear: null, style: "Powerhouse", weightClass: "heavy" },

  // 2021
  { name: "Jun Saito", year: 2021, level: 7, birthYear: 1987, retirementYear: null, style: "Powerhouse", weightClass: "heavy" },
  { name: "Rei Saito", year: 2021, level: 7, birthYear: 1987, retirementYear: null, style: "Powerhouse", weightClass: "heavy" },

  // 2022
  { name: "Ryo Inoue", year: 2022, level: 4, birthYear: 2001, retirementYear: null, style: "Technical", weightClass: "junior" },
  { name: "Yuma Anzai", year: 2022, level: 8, birthYear: 1999, retirementYear: null, style: "Technical", weightClass: "heavy" },

  // 2023
  { name: "Kuroshio TOKYO Japan", year: 2023, level: 6, birthYear: 1992, retirementYear: null, style: "High-Flyer", weightClass: "heavy" },

  // 2024
  { name: "Hideki Suzuki", year: 2024, level: 7, birthYear: 1980, retirementYear: null, style: "Technical", weightClass: "heavy" },
  { name: "Cyrus", year: 2024, level: 6, birthYear: 1989, retirementYear: null, style: "Powerhouse", weightClass: "heavy" },
];

const dirPath = 'c:/dev/sandbox-lucha-pokemon/src/data/ajpw';

const rosterByYear = {};

// Initialize all years from 2010 to 2025 to ensure empty arrays for years without wrestlers
for (let y = 2010; y <= 2025; y++) {
  rosterByYear[y] = [];
}

wrestlersData.forEach(w => {
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
     if (w.style === "Brawler") { pow = w.level; tgh = w.level; }
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

console.log('Successfully generated AJPW rosters 2010-2025.');
