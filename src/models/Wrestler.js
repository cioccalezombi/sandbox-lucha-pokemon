export const calculateAge = (wrestler, currentYear) => currentYear - wrestler.birthYear;

export const getAgeModifier = (age) => {
  const primeStart = 28;
  const primeEnd = 38;
  if (age < primeStart) return 0.7;
  if (age >= primeStart && age <= primeEnd) return 1.0;
  return 0.8;
};

export const getEffectiveStat = (wrestler, stat, currentYear) => {
  const age = calculateAge(wrestler, currentYear);
  const modifier = getAgeModifier(age);
  const permanentPenalty = wrestler.permanentPenalty ?? 1.0;
  return Math.max(1, Math.round(wrestler[stat] * modifier * permanentPenalty));
};

export const getPrimeStatus = (age) => {
  const primeStart = 28;
  const primeEnd = 38;
  if (age < primeStart) return "Pre-Prime (-30%)";
  if (age >= primeStart && age <= primeEnd) return "Prime (Peak)";
  return "Post-Prime (-20%)";
};

/**
 * Effective level: age modifier × junior penalty × permanent injury penalty.
 * All stack multiplicatively. Minimum 1.
 */
export const getEffectiveLevel = (wrestler, currentYear) => {
  const age = calculateAge(wrestler, currentYear);
  const ageMod = getAgeModifier(age);
  const juniorMod = wrestler.weightClass === 'junior' ? 0.7 : 1.0;
  const permanentPenalty = wrestler.permanentPenalty ?? 1.0;
  return Math.max(1, Math.round(wrestler.level * ageMod * juniorMod * permanentPenalty));
};

/**
 * Hydrates missing stats (hpMax, power, technique, speed, toughness) 
 * based on the wrestler's level and style.
 */
export const hydrateWrestlerStats = (wrestler) => {
  // If stats already exist, do nothing
  if (wrestler.hpMax !== undefined) return wrestler;

  const level = wrestler.level || 5;
  const style = wrestler.style || "All-Rounder";

  let hpMax = 70 + (level * 5); // Level 1 = 75, Level 10 = 120
  let power = level;
  let technique = level;
  let speed = level;
  let toughness = level;

  switch (style) {
    case "Technician":
    case "Submission Specialist":
      technique += 2; power -= 1; hpMax -= 5; speed += 1;
      break;
    case "Powerhouse":
    case "Brawler":
      power += 2; speed -= 2; hpMax += 10; toughness += 2;
      break;
    case "High Flyer":
      speed += 3; power -= 2; toughness -= 1; hpMax -= 5;
      break;
    case "Heel":
      technique += 1; toughness += 1;
      break;
    case "All-Rounder":
    default:
      break;
  }

  const clamp = (val) => Math.max(1, Math.min(10, val));
  
  return {
    ...wrestler,
    hpMax: Math.round(hpMax),
    power: clamp(power),
    technique: clamp(technique),
    speed: clamp(speed),
    toughness: clamp(toughness)
  };
};
