/**
 * KP (Krishnamurti Paddhati) sublord table.
 * Each nakshatra (27) has 9 sub-lords in Vimshottari order.
 * Sub-lord span = nakshatra span (13°20') × (dasha years / 120)
 */

import { DASHA_LORDS, DASHA_YEARS, NAKSHATRA_LORD, type DashaLord } from './dasha';

const TOTAL_YEARS = 120;
const NAKSHATRA_SPAN = 360 / 27; // 13.333...°

export interface KPSublord {
  nakshatra:       number;   // 0-26
  nakshatraLord:   DashaLord;
  sublordIndex:    number;   // 0-8
  sublord:         DashaLord;
  startDeg:        number;   // absolute sidereal longitude
  endDeg:          number;
  span:            number;   // degrees
}

let _sublordTable: KPSublord[] | null = null;

function buildSublordTable(): KPSublord[] {
  const table: KPSublord[] = [];

  for (let nak = 0; nak < 27; nak++) {
    const nakStart = nak * NAKSHATRA_SPAN;
    const nakLord = NAKSHATRA_LORD[nak];
    const nakLordIdx = DASHA_LORDS.indexOf(nakLord);

    let cumDeg = nakStart;

    for (let i = 0; i < DASHA_LORDS.length; i++) {
      const subLord = DASHA_LORDS[(nakLordIdx + i) % DASHA_LORDS.length];
      const span = NAKSHATRA_SPAN * (DASHA_YEARS[subLord] / TOTAL_YEARS);

      table.push({
        nakshatra:      nak,
        nakshatraLord:  nakLord,
        sublordIndex:   i,
        sublord:        subLord,
        startDeg:       cumDeg,
        endDeg:         cumDeg + span,
        span,
      });

      cumDeg += span;
    }
  }

  return table;
}

export function getKPSublordTable(): KPSublord[] {
  if (!_sublordTable) _sublordTable = buildSublordTable();
  return _sublordTable;
}

export function getSublordForLongitude(longitude: number): KPSublord {
  const normalised = ((longitude % 360) + 360) % 360;
  const table = getKPSublordTable();
  const entry = table.find((e) => e.startDeg <= normalised && e.endDeg > normalised);
  return entry ?? table[0];
}

export interface KPSignificator {
  planet:      string;
  longitude:   number;
  nakshatra:   DashaLord;
  sublord:     DashaLord;
  houses:      number[]; // houses this planet signifies
}

export function calcKPSignificators(
  planets: { name: string; longitude: number; house: number; rashi: number }[],
  houses:  { number: number; longitude: number }[],
): KPSignificator[] {
  return planets.map((p) => {
    const entry = getSublordForLongitude(p.longitude);

    // Houses signified: own house + planets in that house + aspected houses (simplified)
    const ownHouse = p.house;
    const houseOwnedByRashi = houses.find((h) => h.number === ownHouse);
    const signifiedHouses = Array.from(new Set([ownHouse]));

    return {
      planet:    p.name,
      longitude: p.longitude,
      nakshatra: entry.nakshatraLord,
      sublord:   entry.sublord,
      houses:    signifiedHouses,
    };
  });
}
