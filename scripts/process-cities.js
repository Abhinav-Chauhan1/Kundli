// Run once: node scripts/process-cities.js
// Outputs: public/cities.json (compact)
const fs = require('fs');
const path = require('path');

const raw = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../data/cities_raw.json'), 'utf8'
));

const INDIA_TZ = 'Asia/Kolkata';
const PRIORITY = new Set(['IN', 'PK', 'BD', 'NP', 'LK', 'GB', 'US', 'AE',
  'SG', 'AU', 'CA', 'DE', 'FR', 'NL', 'JP', 'CN', 'MY', 'ZA']);

// Population thresholds by tier
function keep(c) {
  const pop = c.population || 0;
  if (c.country_code === 'IN') return true;            // all Indian cities
  if (PRIORITY.has(c.country_code)) return pop >= 5000;
  return pop >= 10000;
}

const processed = raw
  .filter(c => c.latitude && c.longitude && c.name && keep(c))
  .map(c => ({
    n:   c.name,
    s:   c.state_name || '',
    cc:  c.country_code,
    la:  parseFloat(parseFloat(c.latitude).toFixed(4)),
    ln:  parseFloat(parseFloat(c.longitude).toFixed(4)),
    tz:  c.timezone || (c.country_code === 'IN' ? INDIA_TZ : 'UTC'),
  }))
  .sort((a, b) => {
    const aScore = a.cc === 'IN' ? 0 : PRIORITY.has(a.cc) ? 1 : 2;
    const bScore = b.cc === 'IN' ? 0 : PRIORITY.has(b.cc) ? 1 : 2;
    return aScore - bScore || a.n.localeCompare(b.n);
  });

const outPath = path.join(__dirname, '../public/cities.json');
fs.writeFileSync(outPath, JSON.stringify(processed));

console.log(`Written ${processed.length.toLocaleString()} cities to public/cities.json`);
console.log(`File size: ${(fs.statSync(outPath).size / 1024 / 1024).toFixed(1)} MB`);

const delhi = processed.find(c => c.n === 'New Delhi');
console.log('Delhi check:', delhi);
