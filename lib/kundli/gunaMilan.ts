/**
 * Gun Milan — 8 Koota scoring tables.
 * TypeScript port of the microservice lib for client-side preview;
 * authoritative calculation runs server-side.
 */

export const DASHA_LORDS_ORDER = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'] as const;

export const KOOTA_NAMES = ['Varna','Vashya','Tara','Yoni','Graha Maitri','Gana','Bhakoot','Nadi'] as const;
export type KootaName = typeof KOOTA_NAMES[number];

export interface Koota {
  name:        KootaName;
  score:       number;
  maxScore:    number;
  description: string;
}

export interface MilanResult {
  kootas:     Koota[];
  totalScore: number;
  recommendation: 'HIGHLY_COMPATIBLE' | 'COMPATIBLE' | 'AVERAGE' | 'NOT_RECOMMENDED';
}

const RASHI_VARNA = [3, 3, 0, 0, 1, 0, 2, 1, 1, 2, 3, 0] as const;
const RASHI_VASHYA = [0, 4, 0, 0, 4, 0, 0, 4, 1, 1, 0, 2] as const;
const RASHI_LORD = [0, 6, 2, 1, 0, 4, 6, 2, 5, 8, 8, 5] as const; // Su=0..Ke=8

const NAKSHATRA_GANA = [
  0,2,0,0,2,2,0,0,2,
  2,2,0,0,1,0,0,0,2,
  2,2,0,0,1,2,0,0,0,
] as const;

const NAKSHATRA_NADI = Array.from({ length: 27 }, (_, i) => i % 3) as number[];

const NAKSHATRA_YONI = [
  0,13,1,8,4,5,2,6,9,
  6,12,12,7,7,3,3,8,8,
  11,11,9,9,2,10,10,4,4,
] as const;

const PLANET_FRIENDS: Record<number, number[]> = {
  0: [1,2,4], 1: [0,4,3], 2: [0,1,4],
  3: [0,5,6], 4: [0,1,2], 5: [3,6],  6: [3,5],
};
const PLANET_ENEMIES: Record<number, number[]> = {
  0: [5,6], 1: [2,6], 2: [4,5,3],
  3: [1],   4: [3,5,6], 5: [0,1,2], 6: [0,1,2],
};

function planetRelation(p1: number, p2: number): 'friend' | 'neutral' | 'enemy' {
  if (PLANET_FRIENDS[p1]?.includes(p2)) return 'friend';
  if (PLANET_ENEMIES[p1]?.includes(p2)) return 'enemy';
  return 'neutral';
}

export function calcGunMilan(
  nak1: number, nak2: number,
  rashi1: number, rashi2: number,
): MilanResult {
  const kootas: Koota[] = [];
  let total = 0;

  // 1. Varna (1)
  const vs = RASHI_VARNA[rashi1] >= RASHI_VARNA[rashi2] ? 1 : 0;
  total += vs; kootas.push({ name: 'Varna', score: vs, maxScore: 1, description: 'Social & spiritual compatibility' });

  // 2. Vashya (2)
  const vas = RASHI_VASHYA[rashi1] === RASHI_VASHYA[rashi2] ? 2 : 1;
  total += vas; kootas.push({ name: 'Vashya', score: vas, maxScore: 2, description: 'Dominance and control' });

  // 3. Tara (3)
  const taraDiff = ((nak2 - nak1) + 27) % 27;
  const taraGroup = (taraDiff % 9) + 1;
  const taraScore = [1,3,5,7].includes(taraGroup) ? 3 : taraGroup <= 9 ? 1 : 0;
  total += taraScore; kootas.push({ name: 'Tara', score: taraScore, maxScore: 3, description: 'Birth star compatibility & health' });

  // 4. Yoni (4)
  const y1 = NAKSHATRA_YONI[nak1];
  const y2 = NAKSHATRA_YONI[nak2];
  const yoniScore = y1 === y2 ? 4 : Math.abs(y1 - y2) <= 2 ? 2 : 0;
  total += yoniScore; kootas.push({ name: 'Yoni', score: yoniScore, maxScore: 4, description: 'Physical & sexual compatibility' });

  // 5. Graha Maitri (5)
  const l1 = RASHI_LORD[rashi1];
  const l2 = RASHI_LORD[rashi2];
  const r12 = planetRelation(l1, l2);
  const r21 = planetRelation(l2, l1);
  let gm = 0;
  if      (r12 === 'friend'  && r21 === 'friend')  gm = 5;
  else if (r12 === 'friend'  || r21 === 'friend')  gm = 4;
  else if (r12 === 'neutral' && r21 === 'neutral') gm = 3;
  else if (r12 === 'neutral' || r21 === 'neutral') gm = 1;
  total += gm; kootas.push({ name: 'Graha Maitri', score: gm, maxScore: 5, description: 'Mental compatibility & friendship' });

  // 6. Gana (6)
  const g1 = NAKSHATRA_GANA[nak1];
  const g2 = NAKSHATRA_GANA[nak2];
  let gana = 0;
  if      (g1 === g2) gana = 6;
  else if ((g1 === 0 && g2 === 1) || (g1 === 1 && g2 === 0)) gana = 5;
  else if ((g1 === 1 && g2 === 2) || (g1 === 2 && g2 === 1)) gana = 1;
  total += gana; kootas.push({ name: 'Gana', score: gana, maxScore: 6, description: 'Nature & temperament' });

  // 7. Bhakoot (7)
  const diff1 = ((rashi2 - rashi1) + 12) % 12 + 1;
  const diff2 = ((rashi1 - rashi2) + 12) % 12 + 1;
  const bhakoot = [6,8,9,5,3,12].some((d) => d === diff1 || d === diff2) ? 0 : 7;
  total += bhakoot; kootas.push({ name: 'Bhakoot', score: bhakoot, maxScore: 7, description: 'Love, affection & family' });

  // 8. Nadi (8)
  const nadi1 = NAKSHATRA_NADI[nak1];
  const nadi2 = NAKSHATRA_NADI[nak2];
  const nadi = nadi1 !== nadi2 ? 8 : 0;
  total += nadi; kootas.push({ name: 'Nadi', score: nadi, maxScore: 8, description: 'Health & progeny' });

  let recommendation: MilanResult['recommendation'];
  if      (total >= 28) recommendation = 'HIGHLY_COMPATIBLE';
  else if (total >= 18) recommendation = 'COMPATIBLE';
  else if (total >= 10) recommendation = 'AVERAGE';
  else                  recommendation = 'NOT_RECOMMENDED';

  return { kootas, totalScore: total, recommendation };
}
