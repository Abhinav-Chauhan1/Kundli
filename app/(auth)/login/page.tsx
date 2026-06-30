'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

async function createSession(idToken: string) {
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error('Session creation failed');
}

export default function LoginPage() {
  const t      = useTranslations('auth');
  const router = useRouter();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cred    = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      await createSession(idToken);
      router.push('/home');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setError(
        code === 'auth/invalid-credential' || code === 'auth/user-not-found'
          ? t('invalidCredentials')
          : t('invalidCredentials'),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred     = await signInWithPopup(auth, provider);
      const idToken  = await cred.user.getIdToken();
      await createSession(idToken);
      router.push('/home');
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gold font-display">AstroVeda</h1>
          <p className="text-cream/60 text-sm mt-1">Vedic Astrology</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label={t('email')} type="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" autoComplete="email" required
            className="bg-navy-light border-navy-light text-cream placeholder:text-cream/30"
          />
          <Input
            label={t('password')} type="password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password" required
            className="bg-navy-light border-navy-light text-cream placeholder:text-cream/30"
          />

          {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}

          <Link href="/forgot-password" className="block text-right text-sm text-gold hover:text-gold-light">
            {t('forgotPassword')}
          </Link>

          <Button type="submit" fullWidth loading={loading} size="lg">
            {t('login')}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-navy-light" />
          <span className="text-xs text-cream/40">{t('orContinueWith')}</span>
          <div className="flex-1 h-px bg-navy-light" />
        </div>

        <Button variant="secondary" fullWidth onClick={handleGoogle} type="button" loading={loading}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t('google')}
        </Button>

        <p className="text-center text-sm text-cream/60 mt-6">
          {t('noAccount')}{' '}
          <Link href="/register" className="text-gold hover:text-gold-light font-medium">
            {t('registerLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
