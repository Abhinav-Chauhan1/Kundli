/**
 * Ashtakavarga computation.
 * Pure lookup tables — no engine calls.
 *
 * Bindus contributed by each planet from its position to all houses.
 * Tables from Parashari system (Brihat Parasara Hora Shastra).
 */

// Planets: 0=Su, 1=Mo, 2=Ma, 3=Me, 4=Ju, 5=Ve, 6=Sa, 7=Lagna
const PLANET_NAMES = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];

/**
 * Bindu tables: for each contributing planet (0-7 incl Lagna),
 * the 12 houses (from that planet's own position) that receive a bindu.
 * House offset is 1-based; 1 = planet's own house.
 */
const BINDU_TABLES: Record<number, number[]> = {
  // Sun's contributions from each body
  0: [1,2,4,7,8,9,10,11], // from Sun
  // ... (abbreviated — full 7×8 table below)
};

// Full Ashtakavarga bindu table (planet → benefic house offsets from that planet's position)
const AV_TABLE: { [planet: number]: { [contributor: number]: number[] } } = {
  0: { // Sun's AV
    0: [1,2,4,7,8,9,10,11],   // from Sun
    1: [3,6,10,11],            // from Moon
    2: [1,2,4,7,8,9,10,11],   // from Mars
    3: [3,5,6,9,10,11,12],    // from Mercury
    4: [5,6,9,11],             // from Jupiter
    5: [6,7,12],               // from Venus
    6: [1,2,4,7,8,9,10,11],   // from Saturn
    7: [3,4,6,10,11,12],      // from Lagna
  },
  1: { // Moon's AV
    0: [3,6,7,8,10,11],
    1: [1,3,6,7,10,11],
    2: [2,3,5,6,9,10,11],
    3: [1,3,4,5,7,8,10,11],
    4: [1,4,7,8,10,11,12],
    5: [3,4,5,7,9,10,11],
    6: [3,5,6,11],
    7: [3,6,10,11],
  },
  2: { // Mars's AV
    0: [3,5,6,10,11],
    1: [3,6,11],
    2: [1,2,4,7,8,10,11],
    3: [3,5,6,11],
    4: [6,10,11,12],
    5: [6,8,11,12],
    6: [1,4,7,8,9,10,11],
    7: [1,2,4,7,10,11],
  },
  3: { // Mercury's AV
    0: [5,6,9,11,12],
    1: [2,4,6,8,10,11],
    2: [1,2,4,7,8,9,10,11],
    3: [1,3,5,6,9,10,11,12],
    4: [6,8,11,12],
    5: [1,2,3,4,5,8,9,11],
    6: [1,2,4,7,8,9,10,11],
    7: [1,2,4,7,8,9,10,11],
  },
  4: { // Jupiter's AV
    0: [1,2,3,4,7,8,10,11],
    1: [2,5,7,9,11],
    2: [1,2,4,7,8,10,11],
    3: [1,2,4,5,6,9,10,11],
    4: [1,2,3,4,7,8,10,11],
    5: [2,5,6,9,10,11],
    6: [3,5,6,12],
    7: [1,2,4,5,6,7,9,10,11],
  },
  5: { // Venus's AV
    0: [8,11,12],
    1: [1,2,3,4,5,8,9,11,12],
    2: [3,4,6,9,11,12],
    3: [3,5,6,9,11],
    4: [5,8,9,10,11],
    5: [1,2,3,4,5,8,9,10,11],
    6: [3,4,5,8,9,10,11],
    7: [1,2,3,4,5,8,9,11],
  },
  6: { // Saturn's AV
    0: [1,2,4,7,8,10,11],
    1: [3,6,11],
    2: [3,5,6,10,11,12],
    3: [6,8,9,10,11,12],
    4: [5,6,11,12],
    5: [6,11,12],
    6: [3,5,6,11],
    7: [1,3,4,6,10,11],
  },
};

export interface AshtakavargaResult {
  planet: string;
  bindus: number[];   // 12 values, one per house
  total:  number;
}

export interface SarvashtakavargaResult {
  bindus: number[];   // sum of all 7 planets, per house
  total:  number;
}

/**
 * Compute Ashtakavarga for all 7 planets.
 *
 * @param planetHouses - Map of planet name → house number (1-12)
 * @param lagnaHouse   - always 1 (lagna = 1st house)
 */
export function calcAshtakavarga(
  planetRashis: Record<string, number>, // planet name → rashi (0-11)
  lagnaRashi: number,
): { planets: AshtakavargaResult[]; sarva: SarvashtakavargaResult } {
  const planetOrder = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
  const contributors = [
    ...planetOrder.map((_, i) => ({ type: 'planet' as const, idx: i })),
    { type: 'lagna' as const, idx: 7 },
  ];

  const results: AshtakavargaResult[] = [];
  const sarvaBindus = new Array(12).fill(0);

  for (let pIdx = 0; pIdx < planetOrder.length; pIdx++) {
    const planetName = planetOrder[pIdx];
    const planetRashi = planetRashis[planetName] ?? 0;
    const bindus = new Array(12).fill(0);

    for (const contributor of contributors) {
      const cRashi = contributor.type === 'lagna'
        ? lagnaRashi
        : planetRashis[planetOrder[contributor.idx]] ?? 0;

      const offsets = AV_TABLE[pIdx]?.[contributor.idx] ?? [];
      for (const offset of offsets) {
        // offset is 1-based house from contributor's position
        const targetRashi = (cRashi + offset - 1) % 12;
        bindus[targetRashi]++;
      }
    }

    const total = bindus.reduce((s, v) => s + v, 0);
    results.push({ planet: planetName, bindus, total });

    for (let r = 0; r < 12; r++) sarvaBindus[r] += bindus[r];
  }

  return {
    planets: results,
    sarva: { bindus: sarvaBindus, total: sarvaBindus.reduce((s, v) => s + v, 0) },
  };
}
