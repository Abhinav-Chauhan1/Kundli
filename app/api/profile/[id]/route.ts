import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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

async function getOwnedProfile(profileId: string, uid: string) {
  const doc = await adminDb.collection('profiles').doc(profileId).get();
  if (!doc.exists || doc.data()?.uid !== uid) return null;
  return { id: doc.id, ...doc.data() };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const profile = await getOwnedProfile(id, user.uid);
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const profile = await getOwnedProfile(id, user.uid);
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body   = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first.message, field: first.path[0] }, { status: 400 });
  }

  if (parsed.data.isDefault) {
    const batch = adminDb.batch();
    const existing = await adminDb.collection('profiles')
      .where('uid', '==', user.uid)
      .where('isDefault', '==', true)
      .get();
    existing.docs.forEach(d => batch.update(d.ref, { isDefault: false }));
    await batch.commit();
  }

  await adminDb.collection('profiles').doc(id).update({
    ...parsed.data,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ id, ...parsed.data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const profile = await getOwnedProfile(id, user.uid);
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await adminDb.collection('profiles').doc(id).delete();
  return NextResponse.json({ success: true });
}
