import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';

export interface FirebaseSession {
  uid: string;
  email: string | null;
  name:  string | null;
  picture: string | null;
}

export async function getServerSession(): Promise<FirebaseSession | null> {
  try {
    const store = await cookies();
    const sessionCookie = store.get('__session')?.value;
    if (!sessionCookie) return null;

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return {
      uid:     decoded.uid,
      email:   decoded.email   ?? null,
      name:    decoded.name    ?? null,
      picture: decoded.picture ?? null,
    };
  } catch {
    return null;
  }
}
