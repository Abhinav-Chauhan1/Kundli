import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redis, CACHE_TTL } from '@/lib/redis';
import { engine } from '@/lib/engine';

const transitSchema = z.object({
  profileId: z.string().min(1),
  date:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getServerSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = transitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { profileId, date = new Date().toISOString().slice(0, 10) } = parsed.data;

  const kundli = await prisma.kundli.findFirst({
    where: { profileId, profile: { userId: user!.uid } },
  });
  if (!kundli) return NextResponse.json({ error: 'Kundli not found. Generate kundli first.' }, { status: 404 });

  const cacheKey = `transit:${profileId}:${date}`;
  const cached = await redis.get<object>(cacheKey).catch(() => null);
  if (cached) return NextResponse.json(cached);

  const chartData = kundli.chartData as { planets: { name: string; longitude: number; rashi: number }[] };
  const moon = chartData.planets.find((p) => p.name === 'Moon');
  if (!moon) return NextResponse.json({ error: 'Invalid kundli data' }, { status: 500 });

  let result;
  try {
    result = await engine.transit({
      date,
      natalMoonLng:  moon.longitude,
      natalMoonSign: moon.rashi,
    });
  } catch {
    return NextResponse.json({ error: 'Transit calculation failed' }, { status: 502 });
  }

  await redis.set(cacheKey, result, { ex: CACHE_TTL.TRANSIT }).catch(() => null);

  return NextResponse.json(result);
}
