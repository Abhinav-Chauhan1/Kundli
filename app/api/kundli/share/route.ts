import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

const shareSchema = z.object({
  profileId: z.string().min(1),
  isPublic:  z.boolean(),
});

export async function POST(req: NextRequest) {
  const user = await getServerSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = shareSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { profileId, isPublic } = parsed.data;

  const kundli = await prisma.kundli.findFirst({
    where: { profileId, profile: { userId: user!.uid } },
  });
  if (!kundli) return NextResponse.json({ error: 'Kundli not found' }, { status: 404 });

  const updated = await prisma.kundli.update({
    where: { id: kundli.id },
    data: {
      isPublic,
      shareToken: isPublic ? (kundli.shareToken ?? randomUUID()) : null,
    },
  });

  return NextResponse.json({
    isPublic: updated.isPublic,
    shareToken: updated.shareToken,
  });
}
