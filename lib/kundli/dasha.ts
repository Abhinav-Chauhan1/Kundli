/**
 * Vimshottari Dasha computation in TypeScript.
 * Pure math from Moon longitude — no engine calls.
 */

export const DASHA_LORDS = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'] as const;
export type DashaLord = typeof DASHA_LORDS[number];

export const DASHA_YEARS: Record<DashaLord, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

// Nakshatra (0-26) → starting Dasha lord
export const NAKSHATRA_LORD: DashaLord[] = [
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
];

export interface AntarDasha {
  lord:      DashaLord;
  startDate: string; // ISO date
  endDate:   string;
}

export interface MahaDasha {
  lord:        DashaLord;
  startDate:   string;
  endDate:     string;
  years:       number;
  antardashas: AntarDasha[];
}

const MS_PER_YEAR = 365.25 * 24 * 3600 * 1000;
const TOTAL_YEARS = 120;

function addYearsMs(date: Date, years: number): Date {
  return new Date(date.getTime() + years * MS_PER_YEAR);
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function calcAntardashas(mahaLord: DashaLord, mahaStart: Date, mahaDurationYears: number): AntarDasha[] {
  const mahaIdx = DASHA_LORDS.indexOf(mahaLord);
  const antardashas: AntarDasha[] = [];
  let current = mahaStart;

  for (let i = 0; i < DASHA_LORDS.length; i++) {
    const lord = DASHA_LORDS[(mahaIdx + i) % DASHA_LORDS.length];
    const fraction = DASHA_YEARS[lord] / TOTAL_YEARS;
    const years = mahaDurationYears * fraction;
    const end = addYearsMs(current, years);

    antardashas.push({
      lord,
      startDate: toISODate(current),
      endDate:   toISODate(end),
    });

    current = end;
  }

  return antardashas;
}

/**
 * Compute Vimshottari Mahadasha periods.
 *
 * @param moonLng - Sidereal Moon longitude (0–360)
 * @param dob     - Birth date "YYYY-MM-DD"
 */
export function calcVimshottari(moonLng: number, dob: string): MahaDasha[] {
  const normalised = ((moonLng % 360) + 360) % 360;
  const nakshatra = Math.floor(normalised / (360 / 27));
  const degInNakshatra = normalised % (360 / 27);
  const nakshatraDuration = 360 / 27;

  const fractionElapsed = degInNakshatra / nakshatraDuration;
  const startLord = NAKSHATRA_LORD[nakshatra];
  const startYears = DASHA_YEARS[startLord];
  const balanceYears = startYears * (1 - fractionElapsed);

  const dobDate = new Date(dob);
  const dashas: MahaDasha[] = [];
  const startIdx = DASHA_LORDS.indexOf(startLord);
  let current = dobDate;

  for (let i = 0; i < DASHA_LORDS.length; i++) {
    const lord = DASHA_LORDS[(startIdx + i) % DASHA_LORDS.length];
    const years = i === 0 ? balanceYears : DASHA_YEARS[lord];
    const end = addYearsMs(current, years);

    dashas.push({
      lord,
      startDate:   toISODate(current),
      endDate:     toISODate(end),
      years,
      antardashas: calcAntardashas(lord, current, years),
    });

    current = end;
  }

  return dashas;
}

/**
 * Find the current running Mahadasha and Antardasha.
 */
export function getCurrentDasha(dashas: MahaDasha[], today = new Date()): {
  maha: MahaDasha;
  antar: AntarDasha;
} | null {
  const todayStr = toISODate(today);
  const maha = dashas.find(
    (d) => d.startDate <= todayStr && d.endDate > todayStr,
  );
  if (!maha) return null;

  const antar = maha.antardashas.find(
    (a) => a.startDate <= todayStr && a.endDate > todayStr,
  );
  if (!antar) return null;

  return { maha, antar };
}
