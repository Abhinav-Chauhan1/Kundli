/**
 * Gun Milan — 8 Koota compatibility scoring.
 * Tables based on traditional Parashari system.
 */

const VARNA = ['Brahmin','Kshatriya','Vaishya','Shudra'];
// Rashi → Varna index
const RASHI_VARNA = [3,3,0,0,1,0,2,1,1,2,3,0]; // 0-11

const VASHYA = ['Manav','Chatushpad','Jalchar','Vanchar','Keeta'];
const RASHI_VASHYA = [0,4,0,0,4,0,0,4,1,1,0,2]; // approximate

const RASHI_NAKSHATRA_START = [0,1,2,3,4,5,6,7,8,9,10,11].map(r => r * 2.25);

const RASHI_LORD = [2,6,4,1,0,4,6,2,5,8,8,5]; // Su=0,Mo=1,Ma=2,Me=3,Ju=4,Ve=5,Sa=6,Ra=7,Ke=8

// Planet friendship table (index: planet 0=Su,1=Mo,2=Ma,3=Me,4=Ju,5=Ve,6=Sa)
const PLANET_FRIENDS = {
  0: [1,2,4],    // Sun: Moon, Mars, Jupiter
  1: [0,4,3],    // Moon: Sun, Jupiter, Mercury
  2: [0,1,4],    // Mars: Sun, Moon, Jupiter
  3: [0,5,6],    // Mercury: Sun, Venus, Saturn
  4: [0,1,2],    // Jupiter: Sun, Moon, Mars
  5: [3,6],      // Venus: Mercury, Saturn
  6: [3,5],      // Saturn: Mercury, Venus
};

const PLANET_ENEMIES = {
  0: [5,6],      // Sun: Venus, Saturn
  1: [2,6],      // Moon: Mars, Saturn (some traditions differ)
  2: [4,5,3],    // Mars: Jupiter, Venus, Mercury
  3: [1],        // Mercury: Moon
  4: [3,5,6],    // Jupiter: Mercury, Venus, Saturn
  5: [0,1,2],    // Venus: Sun, Moon, Mars
  6: [0,1,2],    // Saturn: Sun, Moon, Mars
};

function getPlanetRelation(p1, p2) {
  if (PLANET_FRIENDS[p1]?.includes(p2)) return 'friend';
  if (PLANET_ENEMIES[p1]?.includes(p2)) return 'enemy';
  return 'neutral';
}

// Nadi (0=Aadi, 1=Madhya, 2=Antya)
const NAKSHATRA_NADI = [];
for (let i = 0; i < 27; i++) {
  NAKSHATRA_NADI.push(i % 3);
}

// Gana (0=Deva, 1=Manav, 2=Rakshasa)
const NAKSHATRA_GANA = [
  0,2,0,0,2,2,0,0,2, // 0-8
  2,2,0,0,1,0,0,0,2, // 9-17
  2,2,0,0,1,2,0,0,0, // 18-26
];

// Yoni animals (0-13)
const NAKSHATRA_YONI = [
  0,13,1,8,4,5,2,6,9,   // 0-8 (Cat, Elephant, Horse, etc simplified)
  6,12,12,7,7,3,3,8,8,  // 9-17
  11,11,9,9,2,10,10,4,  // 18-26
  4,                    // index 26
];

// Bhakoot (rashi distance scoring) — simplified
function bhakootScore(r1, r2) {
  const diff1 = ((r2 - r1) + 12) % 12 + 1;
  const diff2 = ((r1 - r2) + 12) % 12 + 1;
  const bad = [6, 8, 9, 5, 3, 12]; // 6-8 (shadashtak), 9-5, 3-11 (navamansh), etc.
  if (bad.includes(diff1) || bad.includes(diff2)) return 0;
  return 7;
}

function calcGunMilan(nak1, nak2, rashi1, rashi2) {
  const kootas = [];
  let total = 0;

  // 1. Varna (1 point)
  const varna1 = RASHI_VARNA[rashi1];
  const varna2 = RASHI_VARNA[rashi2];
  const varnaScore = varna1 >= varna2 ? 1 : 0;
  total += varnaScore;
  kootas.push({ name: 'Varna', score: varnaScore, maxScore: 1, description: 'Social & spiritual compatibility' });

  // 2. Vashya (2 points)
  const vashya1 = RASHI_VASHYA[rashi1];
  const vashya2 = RASHI_VASHYA[rashi2];
  const vashyaScore = vashya1 === vashya2 ? 2 : 1;
  total += vashyaScore;
  kootas.push({ name: 'Vashya', score: vashyaScore, maxScore: 2, description: 'Dominance and control' });

  // 3. Tara (3 points)
  const taraDiff = ((nak2 - nak1) + 27) % 27;
  const taraGroup = (taraDiff % 9) + 1;
  const goodTaras = [1, 3, 5, 7];
  const taraScore = goodTaras.includes(taraGroup) ? 3 : (taraGroup <= 9 ? 1.5 : 0);
  const taraRounded = Math.round(taraScore);
  total += taraRounded;
  kootas.push({ name: 'Tara', score: taraRounded, maxScore: 3, description: 'Birth star compatibility & health' });

  // 4. Yoni (4 points)
  const yoni1 = NAKSHATRA_YONI[nak1] ?? 0;
  const yoni2 = NAKSHATRA_YONI[nak2] ?? 0;
  const yoniScore = yoni1 === yoni2 ? 4 : (Math.abs(yoni1 - yoni2) <= 2 ? 2 : 0);
  total += yoniScore;
  kootas.push({ name: 'Yoni', score: yoniScore, maxScore: 4, description: 'Physical & sexual compatibility' });

  // 5. Graha Maitri (5 points)
  const lord1 = RASHI_LORD[rashi1];
  const lord2 = RASHI_LORD[rashi2];
  const rel12 = getPlanetRelation(lord1, lord2);
  const rel21 = getPlanetRelation(lord2, lord1);
  let grahaMaitriScore = 0;
  if (rel12 === 'friend' && rel21 === 'friend') grahaMaitriScore = 5;
  else if (rel12 === 'friend' || rel21 === 'friend') grahaMaitriScore = 4;
  else if (rel12 === 'neutral' && rel21 === 'neutral') grahaMaitriScore = 3;
  else if (rel12 === 'neutral' || rel21 === 'neutral') grahaMaitriScore = 1;
  else grahaMaitriScore = 0;
  total += grahaMaitriScore;
  kootas.push({ name: 'Graha Maitri', score: grahaMaitriScore, maxScore: 5, description: 'Mental compatibility & friendship' });

  // 6. Gana (6 points)
  const gana1 = NAKSHATRA_GANA[nak1];
  const gana2 = NAKSHATRA_GANA[nak2];
  let ganaScore = 0;
  if (gana1 === gana2) ganaScore = 6;
  else if ((gana1 === 0 && gana2 === 1) || (gana1 === 1 && gana2 === 0)) ganaScore = 5;
  else if ((gana1 === 1 && gana2 === 2) || (gana1 === 2 && gana2 === 1)) ganaScore = 1;
  else ganaScore = 0; // Deva-Rakshasa
  total += ganaScore;
  kootas.push({ name: 'Gana', score: ganaScore, maxScore: 6, description: 'Nature & temperament' });

  // 7. Bhakoot (7 points)
  const bhakoot = bhakootScore(rashi1, rashi2);
  total += bhakoot;
  kootas.push({ name: 'Bhakoot', score: bhakoot, maxScore: 7, description: 'Love, affection & family' });

  // 8. Nadi (8 points)
  const nadi1 = NAKSHATRA_NADI[nak1];
  const nadi2 = NAKSHATRA_NADI[nak2];
  const nadiScore = nadi1 !== nadi2 ? 8 : 0; // Same nadi = dosha
  total += nadiScore;
  kootas.push({ name: 'Nadi', score: nadiScore, maxScore: 8, description: 'Health & progeny' });

  return { kootas, totalScore: total };
}

function calcMangalDosha(planets) {
  const mars = planets.find((p) => p.name === 'Mars');
  if (!mars) return { hasMangal: false, severity: 'none', houses: [] };
  const mangalHouses = [1, 2, 4, 7, 8, 12];
  const hasMangal = mangalHouses.includes(mars.house);
  let severity = 'none';
  if (hasMangal) {
    severity = [1, 8, 12].includes(mars.house) ? 'high' : 'moderate';
  }
  return { hasMangal, severity, houses: hasMangal ? [mars.house] : [] };
}

function determineCancellation(dosha1, dosha2) {
  if (!dosha1.hasMangal || !dosha2.hasMangal) return { cancellation: false, reason: null };
  return {
    cancellation: true,
    cancellationReason: 'Both persons have Mangal Dosha, which cancels the negative effects.',
  };
}

module.exports = { calcGunMilan, calcMangalDosha, determineCancellation };
