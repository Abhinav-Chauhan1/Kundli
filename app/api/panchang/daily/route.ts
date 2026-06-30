import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { redis, CACHE_TTL } from '@/lib/redis';
import { engine } from '@/lib/engine';
import { createHash } from 'crypto';

const panchangSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  lat:  z.number().min(-90).max(90),
  lng:  z.number().min(-180).max(180),
  tz:   z.string().min(1),
});

function cityHash(lat: number, lng: number): string {
  return createHash('md5')
    .update(`${lat.toFixed(2)},${lng.toFixed(2)}`)
    .digest('hex')
    .slice(0, 8);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = panchangSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { date, lat, lng, tz } = parsed.data;
  const cacheKey = `panchang:${date}:${cityHash(lat, lng)}`;

  const cached = await redis.get<object>(cacheKey).catch(() => null);
  if (cached) return NextResponse.json(cached);

  let result;
  try {
    result = await engine.panchang({ date, lat, lng, tz });
  } catch {
    return NextResponse.json({ error: 'Panchang calculation failed' }, { status: 502 });
  }

  await redis.set(cacheKey, result, { ex: CACHE_TTL.PANCHANG }).catch(() => null);

  return NextResponse.json(result);
}
