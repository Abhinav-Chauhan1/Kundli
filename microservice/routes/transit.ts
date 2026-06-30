const { toJulianDay } = require('../lib/timezone');
const { setAyanamsha, calcAllPlanets, assignHouses, longitudeToRashi } = require('../lib/ephemeris');

async function transitRoutes(fastify) {
  fastify.post('/calculate/transit', {
    schema: {
      body: {
        type: 'object',
        required: ['date', 'natalMoonLng', 'natalMoonSign'],
        properties: {
          date:           { type: 'string' },
          natalMoonLng:   { type: 'number' },
          natalMoonSign:  { type: 'number' },
        },
      },
    },
  }, async (req, reply) => {
    const { date, natalMoonLng, natalMoonSign } = req.body;

    setAyanamsha('LAHIRI');

    // Current positions
    const jdCurrent  = toJulianDay(date, '12:00', 'UTC');
    const jdYesterday = jdCurrent - 1;

    const currentPlanets  = calcAllPlanets(jdCurrent);
    const yesterdayPlanets = calcAllPlanets(jdYesterday);

    // Assign transit houses relative to natal moon sign
    const transitHouses = currentPlanets.map((p) => {
      const natalHouse = ((p.rashi - natalMoonSign + 12) % 12) + 1;
      return { planet: p.name, natalHouse, transitHouse: p.house || natalHouse };
    });

    // Detect sign changes
    const significantTransits = [];
    for (const cp of currentPlanets) {
      const yp = yesterdayPlanets.find((p) => p.name === cp.name);
      if (yp && yp.rashi !== cp.rashi) {
        significantTransits.push({
          planet:    cp.name,
          fromRashi: yp.rashi,
          toRashi:   cp.rashi,
          at:        new Date().toISOString(),
        });
      }
    }

    return {
      currentPlanetPositions: currentPlanets,
      transitHouses,
      significantTransits,
    };
  });
}

module.exports = transitRoutes;
