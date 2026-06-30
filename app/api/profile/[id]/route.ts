import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

const updateSchema = z.object({
  name:      z.string().min(2).max(60).optional(),
  dob:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  tob:       z.string().regex(/^\d{2}:\d{2}$/).optional(),
  birthCity: z.string().min(1).max(100).optional(),
  lat:       z.number().min(-90).max(90).optional(),
  lng:       z.number().min(-180).max(180).optional(),
  timezone:  z.string().min(1).optional(),
  isDefault: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const profile = await prisma.profile.findFirst({ where: { id, uid: user.uid } });
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const profile = await prisma.profile.findFirst({ where: { id, uid: user.uid } });
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body   = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first.message, field: first.path[0] }, { status: 400 });
  }

  if (parsed.data.isDefault) {
    await prisma.profile.updateMany({ where: { uid: user.uid, isDefault: true }, data: { isDefault: false } });
  }

  const updated = await prisma.profile.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const profile = await prisma.profile.findFirst({ where: { id, uid: user.uid } });
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.profile.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
