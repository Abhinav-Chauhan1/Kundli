/**
 * Vimshottari Dasha system.
 * Total cycle = 120 years.
 * Starting lord determined by birth nakshatra.
 */

const DASHA_LORDS = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const DASHA_YEARS = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

// Nakshatra to starting Dasha lord (0-indexed nakshatra)
const NAKSHATRA_LORD = [
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',  // 0-8
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',  // 9-17
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',  // 18-26
];

/**
 * Calculate Vimshottari Dasha periods.
 * @param {number} moonLng - Sidereal Moon longitude
 * @param {string} dob - "YYYY-MM-DD"
 * @returns {Array} dasha periods
 */
function calcVimshottari(moonLng, dob) {
  const nakshatra = Math.floor(moonLng / (360 / 27));
  const nakshatraLng = moonLng % (360 / 27);
  const nakshatraDuration = 360 / 27;

  // Fraction elapsed in current nakshatra
  const fractionElapsed = nakshatraLng / nakshatraDuration;

  // Starting lord
  const startLordName = NAKSHATRA_LORD[nakshatra];
  const startLordYears = DASHA_YEARS[startLordName];

  // Balance of current dasha at birth
  const balanceYears = startLordYears * (1 - fractionElapsed);

  const dobDate = new Date(dob);
  const dashas = [];

  // Build sequence starting from birth lord
  const startIdx = DASHA_LORDS.indexOf(startLordName);
  let currentDate = new Date(dobDate);

  for (let i = 0; i < DASHA_LORDS.length; i++) {
    const lordIdx = (startIdx + i) % DASHA_LORDS.length;
    const lord = DASHA_LORDS[lordIdx];
    const durationYears = i === 0 ? balanceYears : DASHA_YEARS[lord];
    const durationMs = durationYears * 365.25 * 24 * 3600 * 1000;

    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate.getTime() + durationMs);

    dashas.push({
      lord,
      startDate: startDate.toISOString().slice(0, 10),
      endDate:   endDate.toISOString().slice(0, 10),
      years:     durationYears,
      antardashas: calcAntardashas(lord, startDate, durationYears),
    });

    currentDate = endDate;
  }

  return dashas;
}

function calcAntardashas(mahaLord, mahaStart, mahaDurationYears) {
  const mahaDurationMs = mahaDurationYears * 365.25 * 24 * 3600 * 1000;
  const mahaStartIdx = DASHA_LORDS.indexOf(mahaLord);
  const antardashas = [];
  let currentDate = new Date(mahaStart);

  for (let i = 0; i < DASHA_LORDS.length; i++) {
    const lordIdx = (mahaStartIdx + i) % DASHA_LORDS.length;
    const lord = DASHA_LORDS[lordIdx];
    const fraction = DASHA_YEARS[lord] / 120;
    const durationMs = mahaDurationMs * fraction;

    antardashas.push({
      lord,
      startDate: new Date(currentDate).toISOString().slice(0, 10),
      endDate:   new Date(currentDate.getTime() + durationMs).toISOString().slice(0, 10),
    });

    currentDate = new Date(currentDate.getTime() + durationMs);
  }

  return antardashas;
}

module.exports = { calcVimshottari, NAKSHATRA_LORD, DASHA_LORDS, DASHA_YEARS };
