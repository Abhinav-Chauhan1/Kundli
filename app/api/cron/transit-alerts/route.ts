import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { engine } from '@/lib/engine';

export async function GET(req: NextRequest) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);

  // Get transit data using a reference point (Moon sign 0 = Aries)
  let transitData;
  try {
    transitData = await engine.transit({
      date:           today,
      natalMoonLng:   0,
      natalMoonSign:  0,
    });
  } catch {
    return NextResponse.json({ error: 'Transit engine unavailable' }, { status: 502 });
  }

  const changedSigns = transitData.significantTransits;
  if (changedSigns.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No planet sign changes today' });
  }

  // Find users with push subscriptions
  const users = await prisma.user.findMany({
    where: { pushSubscription: { not: null } },
    select: { id: true, pushSubscription: true },
  });

  // In production: send FCM notifications here
  // For now, log the count
  return NextResponse.json({
    sent:     users.length,
    changes:  changedSigns.map((t) => `${t.planet}: rashi ${t.fromRashi} → ${t.toRashi}`),
  });
}
