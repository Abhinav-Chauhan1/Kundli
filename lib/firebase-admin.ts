import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function initAdmin() {
  if (getApps().length > 0) return getApps()[0];

  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (saJson && saJson !== '{}' && saJson.length > 10) {
    return initializeApp({ credential: cert(JSON.parse(saJson)) });
  }

  // Fallback: application default credentials (gcloud auth application-default login)
  return initializeApp({
    credential: applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const adminApp  = initAdmin();
const adminAuth = getAuth(adminApp);
const adminDb   = getFirestore(adminApp);

export { adminApp, adminAuth, adminDb };
