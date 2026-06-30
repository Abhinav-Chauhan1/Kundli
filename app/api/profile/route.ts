import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

const profileSchema = z.object({
  name:      z.string().min(2).max(60),
  dob:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tob:       z.string().regex(/^\d{2}:\d{2}$/),
  birthCity: z.string().min(1).max(100),
  lat:       z.number().min(-90).max(90),
  lng:       z.number().min(-180).max(180),
  timezone:  z.string().min(1),
  isDefault: z.boolean().optional().default(false),
});

export async function GET() {
  const user = await getServerSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profiles = await prisma.profile.findMany({
    where: { uid: user.uid },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json(profiles);
}

export async function POST(req: NextRequest) {
  const user = await getServerSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body   = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first.message, field: first.path[0] }, { status: 400 });
  }

  const count = await prisma.profile.count({ where: { uid: user.uid } });
  if (count >= 5) {
    return NextResponse.json({ error: 'Maximum 5 profiles allowed' }, { status: 422 });
  }

  const data = parsed.data;

  if (data.isDefault) {
    await prisma.profile.updateMany({ where: { uid: user.uid, isDefault: true }, data: { isDefault: false } });
  }

  const profile = await prisma.profile.create({ data: { uid: user.uid, ...data } });
  return NextResponse.json(profile, { status: 201 });
}
