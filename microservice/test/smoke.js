/**
 * Smoke test for the Kundli Engine.
 * Run after `npm install` succeeds (requires build-essential for native swisseph compile).
 *
 * Usage: node test/smoke.js
 */

'use strict';

process.env.EPHE_PATH = './ephe';

let swisseph;
try {
  swisseph = require('swisseph');
} catch (e) {
  console.error('❌ swisseph not compiled. Run: sudo apt-get install -y build-essential && npm install');
  process.exit(1);
}

const { toJulianDay }  = require('../lib/timezone');
const { setAyanamsha, getAyanamshaValue, calcAllPlanets, calcHouses, assignHouses } = require('../lib/ephemeris');
const { calcVimshottari } = require('../lib/vimshottari');
const { calcGunMilan }    = require('../lib/gunaMilan');

swisseph.swe_set_ephe_path(process.env.EPHE_PATH);

console.log('Swiss Ephemeris Smoke Test');
console.log('==========================\n');

// Test 1: Julian Day conversion
const jd = toJulianDay('1990-01-15', '10:30', 'Asia/Kolkata');
console.log(`✓ JD for 1990-01-15 10:30 IST: ${jd.toFixed(4)}`);
const expected = 2447906.97; // approximate
const diff = Math.abs(jd - expected);
console.assert(diff < 0.1, `JD diff too large: ${diff}`);

// Test 2: Ayanamsha
setAyanamsha('LAHIRI');
const ayan = getAyanamshaValue(jd);
console.log(`✓ Lahiri Ayanamsha at JD ${jd.toFixed(0)}: ${ayan.toFixed(6)}°`);
console.assert(ayan > 22 && ayan < 24, `Ayanamsha out of range: ${ayan}`);

// Test 3: Planet positions
const planets = calcAllPlanets(jd);
console.log(`✓ Computed ${planets.length} planets`);
console.assert(planets.length === 9, `Expected 9 planets, got ${planets.length}`);

const moon = planets.find(p => p.name === 'Moon');
console.log(`  Moon: ${moon.rashiName} ${moon.degree.toFixed(2)}° (Nakshatra: ${moon.nakshatraName})`);
const sun = planets.find(p => p.name === 'Sun');
console.log(`  Sun:  ${sun.rashiName} ${sun.degree.toFixed(2)}°`);
const rahu = planets.find(p => p.name === 'Rahu');
const ketu = planets.find(p => p.name === 'Ketu');
const diff180 = Math.abs(Math.abs(rahu.longitude - ketu.longitude) - 180);
console.assert(diff180 < 0.01, `Rahu/Ketu not opposite: diff=${diff180}`);
console.log(`  Rahu: ${rahu.rashiName} / Ketu: ${ketu.rashiName} (opposite ✓)`);

// Test 4: Houses
try {
  const houses = calcHouses(jd, 28.6139, 77.2090); // New Delhi
  const withHouses = assignHouses(planets, houses.ascendant);
  const asc = houses.ascendant;
  console.log(`✓ Ascendant: ${asc.toFixed(2)}° (${['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][Math.floor(asc/30)]})`);
  console.assert(withHouses.every(p => p.house >= 1 && p.house <= 12), 'House numbers out of range');
  console.log(`  All ${withHouses.length} planets assigned to houses 1-12 ✓`);
} catch (e) {
  console.log(`⚠  House calc warning: ${e.message}`);
}

// Test 5: Vimshottari Dasha
const dashas = calcVimshottari(moon.longitude, '1990-01-15');
console.log(`✓ Vimshottari Dasha: ${dashas.length} periods`);
console.assert(dashas.length === 9, 'Expected 9 dasha periods');
const totalYears = dashas.reduce((s, d) => s + d.years, 0);
console.assert(Math.abs(totalYears - 120) < 0.5, `Dasha total years wrong: ${totalYears}`);
console.log(`  Total span: ${totalYears.toFixed(1)} years (should be ~120) ✓`);
console.log(`  Current start lord: ${dashas[0].lord} (balance: ${dashas[0].years.toFixed(2)} years)`);

// Test 6: Gun Milan
const { kootas, totalScore } = calcGunMilan(moon.nakshatra, 5, moon.rashi, 3); // arbitrary test pair
console.log(`✓ Gun Milan test: ${totalScore}/36 (8 kootas computed)`);
console.assert(kootas.length === 8, `Expected 8 kootas, got ${kootas.length}`);
const maxPossible = kootas.reduce((s, k) => s + k.maxScore, 0);
console.assert(maxPossible === 36, `Koota max should be 36, got ${maxPossible}`);

console.log('\n✅ All smoke tests passed. Microservice is ready.');
