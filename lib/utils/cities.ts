export interface City {
  n:  string;  // name
  s:  string;  // state
  cc: string;  // country code (ISO)
  la: number;  // latitude
  ln: number;  // longitude
  tz: string;  // IANA timezone
}

let _cache: City[] | null = null;

export async function loadCities(): Promise<City[]> {
  if (_cache) return _cache;
  const fs = await import('fs/promises');
  const path = await import('path');
  const filePath = path.join(process.cwd(), 'public', 'cities.json');
  const raw = await fs.readFile(filePath, 'utf8');
  _cache = JSON.parse(raw) as City[];
  return _cache;
}

export function searchCities(cities: City[], query: string, limit = 10): City[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  const results: Array<{ city: City; score: number }> = [];

  for (const city of cities) {
    const nameLow = city.n.toLowerCase();
    if (nameLow.startsWith(q)) {
      results.push({ city, score: 3 });
    } else if (nameLow.includes(q)) {
      results.push({ city, score: 2 });
    } else if (`${city.n} ${city.s} ${city.cc}`.toLowerCase().includes(q)) {
      results.push({ city, score: 1 });
    }
  }

  return results
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aIN = a.city.cc === 'IN' ? 0 : 1;
      const bIN = b.city.cc === 'IN' ? 0 : 1;
      return aIN - bIN || a.city.n.localeCompare(b.city.n);
    })
    .slice(0, limit)
    .map(r => r.city);
}

export function formatCityLabel(city: City): string {
  const parts = [city.n];
  if (city.s && city.s !== city.n) parts.push(city.s);
  if (city.cc !== 'IN') parts.push(city.cc);
  return parts.join(', ');
}
