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
