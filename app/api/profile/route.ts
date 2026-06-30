import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

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

  const snap = await adminDb.collection('profiles')
    .where('uid', '==', user.uid)
    .orderBy('isDefault', 'desc')
    .orderBy('createdAt', 'asc')
    .get();

  const profiles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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

  const countSnap = await adminDb.collection('profiles')
    .where('uid', '==', user.uid)
    .count()
    .get();
  if (countSnap.data().count >= 5) {
    return NextResponse.json({ error: 'Maximum 5 profiles allowed' }, { status: 422 });
  }

  const data = parsed.data;

  // Clear existing defaults if this will be default
  if (data.isDefault) {
    const batch = adminDb.batch();
    const existing = await adminDb.collection('profiles')
      .where('uid', '==', user.uid)
      .where('isDefault', '==', true)
      .get();
    existing.docs.forEach(d => batch.update(d.ref, { isDefault: false }));
    await batch.commit();
  }

  const id      = randomUUID();
  const docRef  = adminDb.collection('profiles').doc(id);
  const now     = FieldValue.serverTimestamp();
  const profile = {
    uid: user.uid,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  await docRef.set(profile);

  return NextResponse.json({ id, ...data, uid: user.uid }, { status: 201 });
}
