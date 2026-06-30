const swisseph = require('swisseph');

// Planet IDs in Swiss Ephemeris
const PLANET_IDS = {
  Sun:     swisseph.SE_SUN,
  Moon:    swisseph.SE_MOON,
  Mars:    swisseph.SE_MARS,
  Mercury: swisseph.SE_MERCURY,
  Jupiter: swisseph.SE_JUPITER,
  Venus:   swisseph.SE_VENUS,
  Saturn:  swisseph.SE_SATURN,
  // Rahu (mean node) and Ketu (mean node + 180)
  Rahu:    swisseph.SE_MEAN_NODE,
};

const RASHI_NAMES = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const NAKSHATRA_NAMES = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha',
  'Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati',
];

const AYANAMSHA_IDS = {
  LAHIRI:        swisseph.SE_SIDM_LAHIRI,
  RAMAN:         swisseph.SE_SIDM_RAMAN,
  KRISHNAMURTI:  swisseph.SE_SIDM_KRISHNAMURTI,
  TRUE_CHITRA:   swisseph.SE_SIDM_TRUE_CITRA,
};

function setAyanamsha(name = 'LAHIRI') {
  const id = AYANAMSHA_IDS[name] ?? swisseph.SE_SIDM_LAHIRI;
  swisseph.swe_set_sid_mode(id, 0, 0);
}

function getAyanamshaValue(jd) {
  return swisseph.swe_get_ayanamsa_ut(jd);
}

/**
 * Calculate sidereal longitude of a single planet.
 * Returns { longitude, latitude, speed }
 */
function calcPlanet(jd, planetId) {
  const flags = swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED;
  const result = swisseph.swe_calc_ut(jd, planetId, flags);
  if (result.error) throw new Error(`swe_calc_ut error for planet ${planetId}: ${result.error}`);
  return {
    longitude: result.longitude,
    latitude:  result.latitude,
    speed:     result.longitudeSpeed,
  };
}

function longitudeToRashi(lng) {
  return Math.floor(lng / 30);
}

function longitudeToDegreeInRashi(lng) {
  return lng % 30;
}

function longitudeToNakshatra(lng) {
  // Each nakshatra = 13°20' = 13.333...°
  return Math.floor(lng / (360 / 27));
}

function longitudeToNakshatraPada(lng) {
  const nakshatraLng = lng % (360 / 27);
  return Math.floor(nakshatraLng / (360 / 27 / 4)) + 1;
}

/**
 * Calculate all 9 planets at a given Julian Day.
 * Returns array of planet objects with sidereal positions.
 */
function calcAllPlanets(jd) {
  const planets = [];

  for (const [name, id] of Object.entries(PLANET_IDS)) {
    const raw = calcPlanet(jd, id);
    const lng = ((raw.longitude % 360) + 360) % 360;
    const rashi = longitudeToRashi(lng);
    const nak = longitudeToNakshatra(lng);

    planets.push({
      name,
      longitude: lng,
      latitude:  raw.latitude,
      speed:     raw.speed,
      isRetrograde: raw.speed < 0,
      rashi,
      rashiName:     RASHI_NAMES[rashi],
      nakshatra:     nak,
      nakshatraName: NAKSHATRA_NAMES[nak],
      pada:          longitudeToNakshatraPada(lng),
      degree:        longitudeToDegreeInRashi(lng),
      house: 0, // assigned after ascendant calc
    });
  }

  // Ketu = Rahu + 180
  const rahu = planets.find((p) => p.name === 'Rahu');
  if (rahu) {
    const ketuLng = ((rahu.longitude + 180) % 360);
    const rashiK = longitudeToRashi(ketuLng);
    const nakK = longitudeToNakshatra(ketuLng);
    planets.push({
      name: 'Ketu',
      longitude: ketuLng,
      latitude: -rahu.latitude,
      speed: rahu.speed,
      isRetrograde: true,
      rashi: rashiK,
      rashiName: RASHI_NAMES[rashiK],
      nakshatra: nakK,
      nakshatraName: NAKSHATRA_NAMES[nakK],
      pada: longitudeToNakshatraPada(ketuLng),
      degree: longitudeToDegreeInRashi(ketuLng),
      house: 0,
    });
  }

  return planets;
}

/**
 * Calculate house cusps using Placidus (or Whole Sign if Placidus fails).
 * Returns array of 12 house cusp longitudes.
 */
function calcHouses(jd, lat, lng) {
  const result = swisseph.swe_houses(jd, lat, lng, 'P');
  if (result.error) {
    // Fall back to whole sign
    const ascLng = calcPlanet(jd, swisseph.SE_ECL_NUT);
    throw new Error('House calculation failed: ' + result.error);
  }
  return {
    cusps: result.house.slice(1, 13), // index 1-12
    ascendant: result.ascendant,
    mc: result.mc,
  };
}

/**
 * Assign house number to each planet based on ascendant (whole sign system).
 */
function assignHouses(planets, ascendantLng) {
  const ascRashi = longitudeToRashi(ascendantLng);
  return planets.map((p) => {
    const house = ((p.rashi - ascRashi + 12) % 12) + 1;
    return { ...p, house };
  });
}

module.exports = {
  setAyanamsha,
  getAyanamshaValue,
  calcAllPlanets,
  calcHouses,
  assignHouses,
  longitudeToRashi,
  RASHI_NAMES,
  NAKSHATRA_NAMES,
};
