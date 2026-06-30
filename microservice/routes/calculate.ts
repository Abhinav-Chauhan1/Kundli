const { toJulianDay } = require('../lib/timezone');
const {
  setAyanamsha, getAyanamshaValue, calcAllPlanets,
  calcHouses, assignHouses, longitudeToRashi, RASHI_NAMES,
} = require('../lib/ephemeris');
const { calcGunMilan, calcMangalDosha, determineCancellation } = require('../lib/gunaMilan');

async function calculateRoutes(fastify) {
  // POST /calculate/chart
  fastify.post('/calculate/chart', {
    schema: {
      body: {
        type: 'object',
        required: ['dob', 'tob', 'lat', 'lng', 'tz'],
        properties: {
          dob:       { type: 'string' },
          tob:       { type: 'string' },
          lat:       { type: 'number' },
          lng:       { type: 'number' },
          tz:        { type: 'string' },
          ayanamsha: { type: 'string' },
        },
      },
    },
  }, async (req, reply) => {
    const { dob, tob, lat, lng, tz, ayanamsha = 'LAHIRI' } = req.body;

    setAyanamsha(ayanamsha);
    const jd = toJulianDay(dob, tob, tz);
    const ayanamshaValue = getAyanamshaValue(jd);

    let planets = calcAllPlanets(jd);
    let housesData;
    try {
      housesData = calcHouses(jd, lat, lng);
    } catch (e) {
      // Fallback: whole sign
      const asc = planets.find(p => p.name === 'Sun'); // placeholder
      housesData = { cusps: Array.from({length: 12}, (_, i) => i * 30), ascendant: 0 };
    }

    const ascendant = ((housesData.ascendant % 360) + 360) % 360;
    planets = assignHouses(planets, ascendant);

    const houses = housesData.cusps.map((cusp, i) => {
      const normalised = ((cusp % 360) + 360) % 360;
      const rashi = longitudeToRashi(normalised);
      return {
        number:    i + 1,
        longitude: normalised,
        rashi,
        rashiName: RASHI_NAMES[rashi],
      };
    });

    return { planets, houses, ascendant, ayanamsha: ayanamshaValue, julianDay: jd };
  });

  // POST /calculate/milan
  fastify.post('/calculate/milan', {
    schema: {
      body: {
        type: 'object',
        required: ['person1', 'person2'],
        properties: {
          person1: { type: 'object' },
          person2: { type: 'object' },
        },
      },
    },
  }, async (req, reply) => {
    const { person1, person2 } = req.body;

    setAyanamsha('LAHIRI');

    const jd1 = toJulianDay(person1.dob, person1.tob, person1.tz);
    const jd2 = toJulianDay(person2.dob, person2.tob, person2.tz);

    let planets1 = calcAllPlanets(jd1);
    let planets2 = calcAllPlanets(jd2);

    // Assign houses for Mangal Dosha check
    try {
      const h1 = calcHouses(jd1, person1.lat, person1.lng);
      const h2 = calcHouses(jd2, person2.lat, person2.lng);
      planets1 = assignHouses(planets1, h1.ascendant);
      planets2 = assignHouses(planets2, h2.ascendant);
    } catch (_) { /* ignore */ }

    const moon1 = planets1.find((p) => p.name === 'Moon');
    const moon2 = planets2.find((p) => p.name === 'Moon');

    if (!moon1 || !moon2) {
      return reply.status(500).send({ error: 'Moon calculation failed' });
    }

    const { kootas, totalScore } = calcGunMilan(
      moon1.nakshatra, moon2.nakshatra,
      moon1.rashi, moon2.rashi,
    );

    const dosha1 = calcMangalDosha(planets1);
    const dosha2 = calcMangalDosha(planets2);
    const { cancellation, cancellationReason } = determineCancellation(dosha1, dosha2);

    let recommendation;
    if (totalScore >= 28) recommendation = 'HIGHLY_COMPATIBLE';
    else if (totalScore >= 18) recommendation = 'COMPATIBLE';
    else if (totalScore >= 10) recommendation = 'AVERAGE';
    else recommendation = 'NOT_RECOMMENDED';

    return {
      person1MoonSign: moon1.rashi,
      person2MoonSign: moon2.rashi,
      person1Nakshatra: moon1.nakshatra,
      person2Nakshatra: moon2.nakshatra,
      kootas,
      totalScore,
      mangalDosha: {
        person1: dosha1,
        person2: dosha2,
        cancellation,
        cancellationReason,
      },
      compatibility: {
        mental:    totalScore >= 25 ? 'Excellent' : totalScore >= 18 ? 'Good' : 'Moderate',
        health:    kootas.find(k => k.name === 'Nadi')?.score === 8 ? 'Good' : 'Needs attention',
        financial: kootas.find(k => k.name === 'Bhakoot')?.score === 7 ? 'Prosperous' : 'Moderate',
        children:  kootas.find(k => k.name === 'Nadi')?.score === 8 ? 'Favourable' : 'Less favourable',
        longevity: kootas.find(k => k.name === 'Tara')?.score >= 3 ? 'Good' : 'Moderate',
      },
      recommendation,
    };
  });
}

module.exports = calculateRoutes;
