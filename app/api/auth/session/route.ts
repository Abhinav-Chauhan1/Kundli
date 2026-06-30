import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const SESSION_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export async function POST(req: NextRequest) {
  const { idToken, displayName } = await req.json().catch(() => ({}));
  if (!idToken) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  let decoded: Awaited<ReturnType<typeof adminAuth.verifyIdToken>>;
  let sessionCookie: string;

  try {
    decoded = await adminAuth.verifyIdToken(idToken);
    sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    });
  } catch (err) {
    console.error('[session] token verification failed:', err);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Upsert user doc — non-blocking; session succeeds even if Firestore is unavailable
  adminDb.collection('users').doc(decoded.uid).get().then((snap) => {
    if (!snap.exists) {
      return adminDb.collection('users').doc(decoded.uid).set({
        email:        decoded.email ?? null,
        displayName:  displayName ?? decoded.name ?? null,
        photoURL:     decoded.picture ?? null,
        language:     'en',
        consentGiven: true,
        createdAt:    FieldValue.serverTimestamp(),
      });
    }
  }).catch((err) => console.error('[session] firestore upsert failed:', err));

  const res = NextResponse.json({ ok: true });
  res.cookies.set('__session', sessionCookie, {
    maxAge:   SESSION_DURATION_MS / 1000,
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
  });
  return res;
}
