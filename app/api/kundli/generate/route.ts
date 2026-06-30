import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { redis, CACHE_TTL } from '@/lib/redis';
import { engine } from '@/lib/engine';
import { calcVimshottari } from '@/lib/kundli/dasha';
import { calcAshtakavarga } from '@/lib/kundli/ashtakavarga';
import { calcKPSignificators } from '@/lib/kundli/kp';
import { getVargaRashi, ALL_VARGAS } from '@/lib/kundli/varga';
import { randomUUID } from 'crypto';

const generateSchema = z.object({
  profileId:  z.string().min(1),
  ayanamsha:  z.enum(['LAHIRI','RAMAN','KRISHNAMURTI','TRUE_CHITRA']).default('LAHIRI'),
  chartStyle: z.enum(['NORTH','SOUTH','EAST']).default('NORTH'),
  forceRegen: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  const user = await getServerSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first.message, field: first.path[0] }, { status: 400 });
  }

  const { profileId, ayanamsha, chartStyle, forceRegen } = parsed.data;

  // Verify profile ownership via Firestore
  const profileSnap = await adminDb.collection('profiles').doc(profileId).get();
  if (!profileSnap.exists || profileSnap.data()?.uid !== user.uid) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }
  const profile = profileSnap.data()!;

  const cacheKey = `kundli:${profileId}:${ayanamsha}`;

  if (!forceRegen) {
    const cached = await redis.get<object>(cacheKey).catch(() => null);
    if (cached) return NextResponse.json(cached);
  }

  let chartResult;
  try {
    chartResult = await engine.chart({
      dob: profile.dob,
      tob: profile.tob,
      lat: profile.lat,
      lng: profile.lng,
      tz:  profile.timezone,
      ayanamsha,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Engine unavailable';
    if (message.includes('abort') || message.includes('timeout')) {
      return NextResponse.json({ error: 'Chart generation timed out. Please retry.' }, { status: 504 });
    }
    return NextResponse.json({ error: 'Chart generation failed. Please retry.' }, { status: 502 });
  }

  const moon = chartResult.planets.find((p: { name: string }) => p.name === 'Moon');
  const dashas = moon ? calcVimshottari(moon.longitude, profile.dob) : [];

  const planetRashis: Record<string, number> = {};
  for (const p of chartResult.planets) {
    planetRashis[p.name] = p.rashi;
  }
  const lagnaRashi = Math.floor(chartResult.ascendant / 30);
  const ashtakavarga = calcAshtakavarga(planetRashis, lagnaRashi);

  const kpSignificators = calcKPSignificators(
    chartResult.planets.map((p: { name: string; longitude: number; house: number; rashi: number }) => ({
      name: p.name, longitude: p.longitude, house: p.house, rashi: p.rashi,
    })),
    chartResult.houses,
  );

  const vargaCharts: Record<string, { planet: string; vargaRashi: number }[]> = {};
  for (const v of ALL_VARGAS) {
    vargaCharts[v] = chartResult.planets.map((p: { name: string; longitude: number }) => ({
      planet:     p.name,
      vargaRashi: getVargaRashi(p.longitude, v),
    }));
  }

  const fullChartData = {
    ...chartResult,
    dashas,
    ashtakavarga,
    kpSignificators,
    vargaCharts,
    profile: {
      name:      profile.name,
      dob:       profile.dob,
      tob:       profile.tob,
      birthCity: profile.birthCity,
      timezone:  profile.timezone,
    },
    generatedAt: new Date().toISOString(),
  };

  // Upsert kundli in Firestore
  const kundliRef = adminDb.collection('kundlis').doc(profileId);
  const existing = await kundliRef.get();
  const shareToken = existing.exists ? existing.data()!.shareToken : randomUUID();

  await kundliRef.set({
    uid:        user.uid,
    profileId,
    ayanamsha,
    chartStyle,
    data:       fullChartData,
    shareToken,
    isPublic:   false,
    updatedAt:  FieldValue.serverTimestamp(),
    ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
  }, { merge: true });

  await redis.set(cacheKey, fullChartData, { ex: CACHE_TTL.KUNDLI }).catch(() => null);

  return NextResponse.json(fullChartData, { status: 200 });
}
