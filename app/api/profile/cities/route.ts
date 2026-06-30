import { NextRequest, NextResponse } from 'next/server';
import { loadCities, searchCities, formatCityLabel } from '@/lib/utils/cities';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  if (q.trim().length < 2) return NextResponse.json({ cities: [] });

  try {
    const all = await loadCities();
    const results = searchCities(all, q, 10);
    return NextResponse.json({
      cities: results.map(c => ({
        label:       formatCityLabel(c),
        name:        c.n,
        lat:         c.la,
        lng:         c.ln,
        timezone:    c.tz,
        countryCode: c.cc,
      })),
    });
  } catch (err) {
    console.error('City search error:', err);
    return NextResponse.json({ cities: [] }, { status: 500 });
  }
}
