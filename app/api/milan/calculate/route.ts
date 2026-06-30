import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redis, CACHE_TTL } from '@/lib/redis';
import { engine } from '@/lib/engine';
import { createHash } from 'crypto';

const personSchema = z.object({
  name:      z.string().min(1).max(60),
  dob:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tob:       z.string().regex(/^\d{2}:\d{2}$/),
  birthCity: z.string().min(1),
  lat:       z.number().min(-90).max(90),
  lng:       z.number().min(-180).max(180),
  tz:        z.string().min(1),
});

const milanSchema = z.object({
  person1: personSchema,
  person2: personSchema,
});

function milanHash(body: unknown): string {
  return createHash('md5').update(JSON.stringify(body)).digest('hex').slice(0, 16);
}

export async function POST(req: NextRequest) {
  const user = await getServerSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = milanSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first.message, field: first.path[0] }, { status: 400 });
  }

  const { person1, person2 } = parsed.data;

  const cacheKey = `milan:${milanHash({ p1: `${person1.dob}${person1.tob}`, p2: `${person2.dob}${person2.tob}` })}`;
  const cached = await redis.get<object>(cacheKey).catch(() => null);
  if (cached) {
    return NextResponse.json(cached);
  }

  let result;
  try {
    result = await engine.milan({
      person1: { dob: person1.dob, tob: person1.tob, lat: person1.lat, lng: person1.lng, tz: person1.tz },
      person2: { dob: person2.dob, tob: person2.tob, lat: person2.lat, lng: person2.lng, tz: person2.tz },
    });
  } catch {
    return NextResponse.json({ error: 'Milan calculation failed' }, { status: 502 });
  }

  const fullResult = { ...result, person1: { name: person1.name }, person2: { name: person2.name } };

  // Save to DB
  await prisma.milanReport.create({
    data: {
      userId:  user!.uid,
      person1: { name: person1.name, dob: person1.dob, tob: person1.tob, city: person1.birthCity },
      person2: { name: person2.name, dob: person2.dob, tob: person2.tob, city: person2.birthCity },
      result: JSON.parse(JSON.stringify(fullResult)),
    },
  }).catch(() => null);

  await redis.set(cacheKey, fullResult, { ex: CACHE_TTL.MILAN }).catch(() => null);

  return NextResponse.json(fullResult);
}
